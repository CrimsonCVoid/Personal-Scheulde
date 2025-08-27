import { format, startOfDay, endOfDay } from 'date-fns';
import { useEventsStore } from '@/features/events/store';
import { generateTimeSlots, getYFromTimeSlot, getCurrentTime } from '@/lib/time';
import { calculateEventColumns } from '@/features/events/utils';
import EventBlock from './EventBlock';
import NowIndicator from './NowIndicator';
import TimeGrid from './TimeGrid';
import { cn } from '@/lib/utils';

interface DayViewProps {
  date: Date;
}

export default function DayView({ date }: DayViewProps) {
  const { getEventsInRange } = useEventsStore();
  
  const dayStart = startOfDay(date);
  const dayEnd = endOfDay(date);
  
  const timeSlots = generateTimeSlots(0, 24, 60); // Hourly slots
  const containerHeight = timeSlots.length * 60; // 60px per hour
  
  const dayEvents = getEventsInRange(dayStart.toISOString(), dayEnd.toISOString());
  const timedEvents = dayEvents.filter(event => !event.allDay);
  const allDayEvents = dayEvents.filter(event => event.allDay);
  const eventsWithColumns = calculateEventColumns(timedEvents);
  
  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  const handleTimeSlotClick = (timeSlot: string) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const clickTime = new Date(date);
    clickTime.setHours(hours, minutes, 0, 0);
    
    // TODO: Open event creation modal with this time
    console.log('Create event at:', clickTime);
  };

  return (
    <div className="flex flex-col h-full">
      {/* All-day events */}
      {allDayEvents.length > 0 && (
        <div className="border-b bg-muted/20 p-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">All day</h3>
          <div className="space-y-2">
            {allDayEvents.map((event) => (
              <EventBlock
                key={event.id}
                event={event}
                view="day"
                style={{ height: '32px' }}
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Day header */}
      <div className="border-b bg-background p-4">
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-1">
            {format(date, 'EEEE')}
          </div>
          <div className={cn(
            'text-2xl font-semibold',
            isToday && 'text-primary'
          )}>
            {format(date, 'MMMM d, yyyy')}
          </div>
        </div>
      </div>
      
      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative flex" style={{ height: containerHeight }}>
          {/* Time labels */}
          <TimeGrid timeSlots={timeSlots} />
          
          {/* Day column */}
          <div className="flex-1 relative border-l" style={{ height: containerHeight }}>
            {/* Hour grid lines */}
            {timeSlots.map((slot) => (
              <div
                key={slot}
                className="absolute w-full border-b hover:bg-accent/20 cursor-pointer transition-colors"
                style={{
                  top: getYFromTimeSlot(`2023-01-01T${slot}:00`, containerHeight),
                  height: '60px',
                }}
                onClick={() => handleTimeSlotClick(slot)}
              />
            ))}
            
            {/* Events */}
            {eventsWithColumns.map((event) => {
              const startY = getYFromTimeSlot(event.start, containerHeight);
              const endY = getYFromTimeSlot(event.end, containerHeight);
              const height = endY - startY;
              const width = `${90 / event.maxColumns}%`;
              const left = `${(event.column * 90) / event.maxColumns + 5}%`;
              
              return (
                <div
                  key={event.id}
                  className="absolute"
                  style={{
                    top: startY,
                    height: height,
                    left: left,
                    width: width,
                    minHeight: '20px',
                    zIndex: 10 + event.column,
                  }}
                >
                  <EventBlock event={event} view="day" />
                </div>
              );
            })}
            
            {/* Now indicator */}
            <NowIndicator 
              currentTime={getCurrentTime()}
              containerHeight={containerHeight}
              show={isToday}
            />
          </div>
        </div>
      </div>
    </div>
  );
}