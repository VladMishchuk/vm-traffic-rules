import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseSessionTimerProps {
  isStrictExam: boolean;
  timeLimitSeconds?: number;
  isFinished: boolean;
  onTimeout: () => void;
}

/**
 * Уніфікований таймер тестової сесії: відраховує зворотний час для суворого іспиту
 * та секундомір тривалості для всіх режимів.
 */
export function useSessionTimer({
  isStrictExam,
  timeLimitSeconds = 1200,
  isFinished,
  onTimeout,
}: UseSessionTimerProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] =
    useState<number>(timeLimitSeconds);

  const onTimeoutRef = useRef(onTimeout);
  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  const resetTimer = useCallback(
    (newLimit?: number) => {
      setElapsedSeconds(0);
      setRemainingSeconds(newLimit ?? timeLimitSeconds);
    },
    [timeLimitSeconds]
  );

  useEffect(() => {
    if (isFinished) return;

    const interval = setInterval(() => {
      setElapsedSeconds((s) => s + 1);

      if (isStrictExam) {
        setRemainingSeconds((rem) => {
          if (rem <= 1) {
            clearInterval(interval);
            onTimeoutRef.current();
            return 0;
          }
          return rem - 1;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isStrictExam, isFinished]);

  const formatTime = useCallback((secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }, []);

  return {
    elapsedSeconds,
    remainingSeconds,
    resetTimer,
    formatTime,
  };
}

export { useSessionTimer as useTestTimer };
