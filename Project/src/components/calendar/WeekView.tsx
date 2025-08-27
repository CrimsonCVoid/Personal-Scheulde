import { format, startOfWeek, endOfWeek, eachDayOfInterval, addMinutes, startOfDay } from 'date-fns';
import { useEventsStore } from '@/features/events/store';
import { generateTimeSlots, getYFromTimeSlot, getCurrentTime } from '@/lib/time';
import { calculateEventColumns } from '@/features/events/utils';
import EventBlock from './EventBlock';
import NowIndicator from './NowIndicator';
import TimeGrid from './TimeGrid';
import { cn } from '@/lib/utils';

interface WeekViewProps {
  date: Date;
}

export default function WeekView({ date }: WeekViewProps) {
  const { getEventsInRange, setSelectedDate } = useEventsStore();
  
  const weekStart = startOfWeek(date, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const timeSlots = generateTimeSlots(0, 24, 60); // Hourly slots
  const containerHeight = timeSlots.length * 60; // 60px per hour
  
  const weekEvents = getEventsInRange(
    weekStart.toISOString(),
    weekEnd.toISOString()
  );

  const handleTimeSlotClick = (day: Date, timeSlot: string) => {
    const [hours, minutes] = timeSlot.split(':').map(Number);
    const clickTime = new Date(day);
    clickTime.setHours(hours, minutes, 0, 0);
    
    // TODO: Open event creation modal with this time
    console.log('Create event at:', clickTime);
  };

  return (
    <div className="flex flex-col h-full">
      {/* All-day events row */}
      <div className="border-b bg-muted/20">
        <div className="grid grid-cols-8 min-h-16">
          <div className="border-r p-2 text-xs text-muted-foreground font-medium">
            All day
          </div>
          {weekDays.map((day) => {
            const dayString = format(day, 'yyyy-MM-dd');
            const allDayEvents = weekEvents.filter(event => 
              event.allDay && format(new Date(event.start), 'yyyy-MM-dd') === dayString
            );
            
            return (
              <div key={dayString} className="border-r last:border-r-0 p-1 space-y-1">
                {allDayEvents.map((event) => (
                  <EventBlock
                    key={event.id}
                    event={event}
                    view="week"
                    style={{ height: '20px', fontSize: '12px' }}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Week header */}
      <div className="grid grid-cols-8 border-b bg-background">
        <div className="border-r p-3"></div>
        {weekDays.map((day) => {
          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          return (
            <div key={day.toISOString()} className="border-r last:border-r-0 p-3 text-center">
              <div className="text-sm text-muted-foreground mb-1">
                {format(day, 'EEE')}
              </div>
              <div className={cn(
                'text-lg font-semibold',
                isToday && 'bg-primary text-primary-foreground rounded-full w-8 h-8 flex items-center justify-center mx-auto'
              )}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Time grid */}
      <div className="flex-1 overflow-auto">
        <div className="relative grid grid-cols-8" style={{ height: containerHeight }}>
          {/* Time labels */}
          <TimeGrid timeSlots={timeSlots} />
          
          {/* Day columns */}
          {weekDays.map((day) => {
            const dayString = format(day, 'yyyy-MM-dd');
            const dayEvents = weekEvents.filter(event => 
              !event.allDay && format(new Date(event.start), 'yyyy-MM-dd') === dayString
            );
            const eventsWithColumns = calculateEventColumns(dayEvents);
            
            return (
              <div
                key={dayString}
                className="relative border-r last:border-r-0"
                style={{ height: containerHeight }}
              >
                {/* Hour grid lines */}
                {timeSlots.map((slot) => (
                  <div
                    key={slot}
                    className="absolute w-full border-b hover:bg-accent/20 cursor-pointer transition-colors"
                    style={{
                      top: getYFromTimeSlot(`2023-01-01T${slot}:00`, containerHeight),
                      height: '60px',
                    }}
                    onClick={() => handleTimeSlotClick(day, slot)}
                  />
                ))}
                
                {/* Events */}
                {eventsWithColumns.map((event) => {
                  const startY = getYFromTimeSlot(event.start, containerHeight);
                  const endY = getYFromTimeSlot(event.end, containerHeight);
                  const height = endY - startY;
                  const width = `${90 / event.maxColumns}%`;
                  const left = `${(event.column * 90) / event.maxColumns}%`;
                  
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
                      <EventBlock event={event} view="week" />
                    </div>
                  );
                })}
                
                {/* Now indicator */}
                <NowIndicator 
                  currentTime={getCurrentTime()}
                  containerHeight={containerHeight}
                  show={format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}