
'use client';

import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface FramvindaBarProps {
  creationDate?: string | null;
  closingDate?: string | null;
  className?: string;
}

export function FramvindaBar({ creationDate, closingDate, className }: FramvindaBarProps) {
  const [progressState, setProgressState] = useState({
    displayValue: "N/A",
    progress: null as number | null,
    colorClass: "bg-muted", // Default color for N/A or invalid
  });

  useEffect(() => {
    if (!creationDate || !closingDate) {
      setProgressState({ displayValue: "N/A", progress: null, colorClass: "bg-muted" });
      return;
    }

    const start = new Date(creationDate);
    const end = new Date(closingDate);
    const today = new Date();

    // Normalize dates to midnight for day-based comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end.getTime() < start.getTime()) {
      setProgressState({ displayValue: "N/A", progress: null, colorClass: "bg-muted" });
      return;
    }

    if (today.getTime() < start.getTime()) {
      setProgressState({ displayValue: "0%", progress: 0, colorClass: "bg-destructive" });
      return;
    }

    // If closingDate is in the past (or today), progress is 100%
    // This also covers the case where creationDate === closingDate and today is on or after that date.
    if (today.getTime() >= end.getTime()) {
      setProgressState({ displayValue: "100%", progress: 100, colorClass: "bg-success" });
      return;
    }
    
    // At this point, start <= today < end, and start < end.
    const totalDuration = end.getTime() - start.getTime();
    const elapsedDuration = today.getTime() - start.getTime();
    
    // totalDuration should not be zero here due to `today.getTime() >= end.getTime()` check handling `start === end`
    // and `end.getTime() < start.getTime()` check.
    // However, as a safeguard for any floating point or unexpected date string issues:
    if (totalDuration <= 0) { // Should be start < end, so totalDuration > 0
        setProgressState({ displayValue: "100%", progress: 100, colorClass: "bg-success" }); // Or N/A if considered invalid
        return;
    }

    const calculatedProgress = Math.max(0, Math.min(100, Math.round((elapsedDuration / totalDuration) * 100)));
    
    let color = "bg-success"; // Default to green for 67-100%
    if (calculatedProgress <= 33) {
      color = "bg-destructive";
    } else if (calculatedProgress <= 66) {
      color = "bg-warning";
    }

    setProgressState({
      displayValue: `${calculatedProgress}%`,
      progress: calculatedProgress,
      colorClass: color,
    });
  }, [creationDate, closingDate]);

  if (progressState.progress === null) {
    return <span className={cn("text-xs text-muted-foreground", className)}>{progressState.displayValue}</span>;
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-2 transition-all duration-300", progressState.colorClass)}
          style={{ width: `${progressState.progress}%` }}
          aria-valuenow={progressState.progress}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
      <div className="text-xs mt-1 text-foreground text-right">{progressState.displayValue}</div>
    </div>
  );
}
