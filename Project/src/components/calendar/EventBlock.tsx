import { Event } from '@/features/events/types';
import { getEventColor, formatEventTime } from '@/features/events/utils';
import { motion } from 'framer-motion';
import { Clock, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventBlockProps {
  event: Event;
  view: 'month' | 'week' | 'day';
  style?: React.CSSProperties;
  onClick?: () => void;
}

export default function EventBlock({ event, view, style, onClick }: EventBlockProps) {
  const colorScheme = getEventColor(event.color || 'blue');
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClick) {
      onClick();
    } else {
      // TODO: Open event details/edit modal
      console.log('Edit event:', event);
    }
  };

  const showDetails = view !== 'month';

  return (
    <motion.div
      className={cn(
        'rounded-md border cursor-pointer transition-all hover:shadow-sm',
        'text-xs p-1 overflow-hidden'
      )}
      style={{
        backgroundColor: colorScheme.bg,
        borderColor: colorScheme.value,
        color: colorScheme.text,
        ...style,
      }}
      onClick={handleClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 2 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div className="font-medium truncate">
        {event.title}
      </div>
      
      {showDetails && (
        <div className="space-y-1 mt-1">
          {!event.allDay && (
            <div className="flex items-center gap-1 text-xs opacity-75">
              <Clock className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{formatEventTime(event)}</span>
            </div>
          )}
          
          {event.location && (
            <div className="flex items-center gap-1 text-xs opacity-75">
              <MapPin className="h-3 w-3 flex-shrink-0" />
              <span className="truncate">{event.location}</span>
            </div>
          )}
          
          {view === 'day' && event.description && (
            <div className="text-xs opacity-75 line-clamp-2">
              {event.description}
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}