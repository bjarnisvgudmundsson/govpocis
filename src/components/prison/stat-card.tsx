import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}

export function StatCard({ title, value, subtitle, trend, className }: StatCardProps) {
  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 px-4 pt-3">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          {title}
        </CardTitle>
        {trend && (
          <div className={cn(
            "text-xs",
            trend === 'up' && "text-destructive",
            trend === 'down' && "text-success",
            trend === 'neutral' && "text-muted-foreground"
          )}>
            {trend === 'up' && '↗'}
            {trend === 'down' && '↘'}
            {trend === 'neutral' && '→'}
          </div>
        )}
      </CardHeader>
      <CardContent className="px-4 pb-3">
        <div className="text-xl font-bold">{value}</div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}