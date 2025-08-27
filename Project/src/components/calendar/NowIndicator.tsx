import { getYFromTimeSlot, isCurrentTime } from '@/lib/time';
import { motion } from 'framer-motion';

interface NowIndicatorProps {
  currentTime: Date;
  containerHeight: number;
  show: boolean;
}

export default function NowIndicator({ currentTime, containerHeight, show }: NowIndicatorProps) {
  if (!show) return null;

  const y = getYFromTimeSlot(currentTime, containerHeight);

  return (
    <motion.div
      className="absolute w-full z-50 pointer-events-none"
      style={{ top: y }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center">
        <div className="w-2 h-2 bg-red-500 rounded-full -ml-1" />
        <div className="flex-1 h-0.5 bg-red-500" />
      </div>
    </motion.div>
  );
}