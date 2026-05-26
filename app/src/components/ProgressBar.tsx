import { motion } from 'framer-motion';

interface ProgressBarProps {
  progress: number;
  showLabel?: boolean;
  size?: 'sm' | 'md';
}

export default function ProgressBar({ progress, showLabel = true, size = 'md' }: ProgressBarProps) {
  const height = size === 'sm' ? 'h-2' : 'h-2';
  return (
    <div className="w-full">
      <div className={`w-full ${height} bg-gray-100 rounded-full overflow-hidden`}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500 mt-1.5 font-medium">{progress}% complete</p>
      )}
    </div>
  );
}
