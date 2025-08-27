import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  getDay, 
  addMonths, 
  subMonths,
  isToday,
  isSameDay,
  parseISO
} from 'date-fns';
import { useEventsStore } from '@/features/events/store';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function MiniCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { selectedDate, setSelectedDate, getEventsByDate } = useEventsStore();
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get the starting day of the week (0 = Sunday, 1 = Monday, etc.)
  const startPadding = getDay(monthStart);
  const paddingDays = Array.from({ length: startPadding }, (_, i) => null);

  const previousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  const handleDateClick = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    setSelectedDate(dateString);
    navigate('/calendar');
  };

  const selectedDateObj = parseISO(selectedDate);

  return (
    <div className="bg-card rounded-lg border p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium">
          {format(currentDate, 'MMMM yyyy')}
        </h4>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={previousMonth} className="h-6 w-6 p-0">
            <ChevronLeft className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={nextMonth} className="h-6 w-6 p-0">
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day) => (
          <div key={day} className="text-xs text-muted-foreground text-center h-6 flex items-center justify-center">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {/* Padding days for proper alignment */}
        {paddingDays.map((_, index) => (
          <div key={`padding-${index}`} className="h-6" />
        ))}
        
        {/* Month days */}
        {monthDays.map((date) => {
          const hasEvents = getEventsByDate(format(date, 'yyyy-MM-dd')).length > 0;
          const isSelected = isSameDay(date, selectedDateObj);
          const isTodayDate = isToday(date);

          return (
            <button
              key={date.toISOString()}
              onClick={() => handleDateClick(date)}
              className={cn(
                'relative h-6 w-6 text-xs rounded-sm transition-colors hover:bg-accent',
                isSelected && 'bg-primary text-primary-foreground hover:bg-primary',
                isTodayDate && !isSelected && 'bg-accent font-medium',
                'flex items-center justify-center'
              )}
            >
              {format(date, 'd')}
              {hasEvents && (
                <div className="absolute bottom-0 right-0 h-1 w-1 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}