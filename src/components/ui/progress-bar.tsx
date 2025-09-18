import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, className, showLabel = true }: ProgressBarProps) {
  const normalizedValue = Math.max(0, Math.min(100, value)); // Ensure value is between 0 and 100

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex items-center justify-end mb-1"> {/* Changed to justify-end for label */}
            <span className="text-xs font-medium text-foreground">{normalizedValue}%</span>
        </div>
      )}
      <div className="w-full bg-muted rounded-full h-2">
        <div 
          className={cn(
            "h-2 rounded-full transition-all duration-300",
            normalizedValue < 30 ? 'bg-destructive' : 
            normalizedValue < 60 ? 'bg-warning' : 
            normalizedValue < 80 ? 'bg-primary' : 'bg-success',
            className
          )}
          style={{ width: `${normalizedValue}%` }}
          aria-valuenow={normalizedValue}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
        />
      </div>
    </div>
  );
}
