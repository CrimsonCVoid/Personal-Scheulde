import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameMonth, isToday } from 'date-fns';
import { useEventsStore } from '@/features/events/store';
import EventBlock from './EventBlock';
import { cn } from '@/lib/utils';

interface MonthViewProps {
  date: Date;
}

export default function MonthView({ date }: MonthViewProps) {
  const { getEventsByDate, setSelectedDate } = useEventsStore();
  
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Add padding days to start from Sunday
  const startPadding = getDay(monthStart);
  const paddingDays = Array.from({ length: startPadding }, (_, i) => {
    const day = new Date(monthStart);
    day.setDate(day.getDate() - (startPadding - i));
    return day;
  });
  
  const allDays = [...paddingDays, ...monthDays];
  
  // Group into weeks
  const weeks: Date[][] = [];
  for (let i = 0; i < allDays.length; i += 7) {
    weeks.push(allDays.slice(i, i + 7));
  }

  const handleDayClick = (day: Date) => {
    setSelectedDate(format(day, 'yyyy-MM-dd'));
  };

  return (
    <div className="flex flex-col h-full">
      {/* Week header */}
      <div className="grid grid-cols-7 border-b bg-muted/50">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-3 text-sm font-medium text-center border-r last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="flex-1 grid grid-rows-6">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 border-b last:border-b-0">
            {week.map((day, dayIndex) => {
              const dayString = format(day, 'yyyy-MM-dd');
              const dayEvents = getEventsByDate(dayString);
              const isCurrentMonth = isSameMonth(day, date);
              const isTodayDate = isToday(day);
              
              return (
                <div
                  key={dayIndex}
                  className={cn(
                    'relative border-r last:border-r-0 p-2 min-h-24 cursor-pointer hover:bg-accent/50 transition-colors',
                    !isCurrentMonth && 'bg-muted/20 text-muted-foreground'
                  )}
                  onClick={() => handleDayClick(day)}
                >
                  <div className={cn(
                    'text-sm font-medium mb-1',
                    isTodayDate && 'bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center'
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayEvents.slice(0, 3).map((event) => (
                      <EventBlock
                        key={event.id}
                        event={event}
                        view="month"
                        style={{ fontSize: '10px', padding: '2px 4px' }}
                      />
                    ))}
                    {dayEvents.length > 3 && (
                      <div className="text-xs text-muted-foreground px-1">
                        +{dayEvents.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}