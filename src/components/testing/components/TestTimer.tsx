import React from 'react';
import { Clock } from 'lucide-react';

interface TestTimerProps {
  remainingSeconds: number;
  formattedTime: string;
}

export const TestTimer: React.FC<TestTimerProps> = ({
  remainingSeconds,
  formattedTime,
}) => {
  const isUrgent = remainingSeconds <= 60;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-mono text-xs sm:text-sm font-bold border transition ${
        isUrgent
          ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500 animate-pulse'
          : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
      }`}
      title="Залишок часу на офіційний іспит"
    >
      <Clock className="w-4 h-4" />
      <span>{formattedTime}</span>
    </div>
  );
};
