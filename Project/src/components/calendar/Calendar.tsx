import { useState } from 'react';
import { useEventsStore } from '@/features/events/store';
import MonthView from './MonthView';
import WeekView from './WeekView';
import DayView from './DayView';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { 
  addDays, 
  addWeeks, 
  addMonths, 
  subDays, 
  subWeeks, 
  subMonths, 
  format, 
  parseISO 
} from 'date-fns';

export default function Calendar() {
  const { view, selectedDate, setSelectedDate } = useEventsStore();

  const selectedDateObj = parseISO(selectedDate);

  const navigateDate = (direction: 'prev' | 'next') => {
    let newDate: Date;
    
    switch (view) {
      case 'day':
        newDate = direction === 'next' 
          ? addDays(selectedDateObj, 1)
          : subDays(selectedDateObj, 1);
        break;
      case 'week':
        newDate = direction === 'next'
          ? addWeeks(selectedDateObj, 1)
          : subWeeks(selectedDateObj, 1);
        break;
      case 'month':
        newDate = direction === 'next'
          ? addMonths(selectedDateObj, 1)
          : subMonths(selectedDateObj, 1);
        break;
      default:
        return;
    }
    
    setSelectedDate(format(newDate, 'yyyy-MM-dd'));
  };

  const getDateRangeText = () => {
    switch (view) {
      case 'day':
        return format(selectedDateObj, 'EEEE, MMMM d, yyyy');
      case 'week':
        // Show week range
        const weekStart = new Date(selectedDateObj);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // Monday
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'month':
        return format(selectedDateObj, 'MMMM yyyy');
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" onClick={() => navigateDate('prev')}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigateDate('next')}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <h2 className="text-xl font-semibold">{getDateRangeText()}</h2>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-hidden">
        {view === 'month' && <MonthView date={selectedDateObj} />}
        {view === 'week' && <WeekView date={selectedDateObj} />}
        {view === 'day' && <DayView date={selectedDateObj} />}
      </div>
    </div>
  );
}