import { formatTime } from '@/lib/time';

interface TimeGridProps {
  timeSlots: string[];
}

export default function TimeGrid({ timeSlots }: TimeGridProps) {
  return (
    <div className="w-16 border-r">
      {timeSlots.map((slot, index) => (
        <div
          key={slot}
          className="relative border-b text-xs text-muted-foreground text-right pr-2"
          style={{ height: '60px' }}
        >
          {index > 0 && (
            <span className="absolute -top-2 right-2">
              {formatTime(`2023-01-01T${slot}:00`)}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}