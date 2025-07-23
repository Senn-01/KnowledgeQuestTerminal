import { useState, useEffect, useRef } from 'react';

export function useTimer(initialMinutes: number, initialSeconds: number = 0) {
  const [timeLeft, setTimeLeft] = useState(initialMinutes * 60 + initialSeconds);
  const [isActive, setIsActive] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const intervalRef = useRef<number | null>(null);

  const start = () => {
    if (!isActive && timeLeft > 0) {
      setIsActive(true);
    }
  };

  const pause = () => {
    setIsActive(false);
  };

  const reset = (minutes?: number, seconds?: number) => {
    setIsActive(false);
    setIsExpired(false);
    setTimeLeft((minutes || initialMinutes) * 60 + (seconds || initialSeconds));
  };

  const stop = () => {
    setIsActive(false);
    setTimeLeft(0);
    setIsExpired(true);
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = window.setInterval(() => {
        setTimeLeft(time => {
          if (time <= 1) {
            setIsActive(false);
            setIsExpired(true);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, timeLeft]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getColorClass = (): string => {
    if (timeLeft > 30) return 'text-[var(--terminal-green)]';
    if (timeLeft > 10) return 'text-[var(--terminal-yellow)]';
    return 'text-red-400';
  };

  return {
    timeLeft,
    formattedTime: formatTime(timeLeft),
    colorClass: getColorClass(),
    isActive,
    isExpired,
    start,
    pause,
    reset,
    stop
  };
}
