'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiTileSegmentedProps {
  title: string;
  ok: number;
  warning: number;
  overdue: number;
  trend?: {
    value: number;
    direction: 'up' | 'down' | 'flat';
  };
  href: string;
}

export function KpiTileSegmented({
  title,
  ok,
  warning,
  overdue,
  trend,
  href
}: KpiTileSegmentedProps) {
  const router = useRouter();
  const total = ok + warning + overdue;

  const getTrendIcon = () => {
    if (!trend) return null;

    switch (trend.direction) {
      case 'up':
        return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <ArrowDown className="w-4 h-4 text-red-600" />;
      case 'flat':
        return <Minus className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';

    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      case 'flat':
        return 'text-gray-600';
    }
  };

  return (
    <Card
      className="bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow cursor-pointer overflow-hidden"
      onClick={() => router.push(href)}
    >
      <CardContent className="p-5">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="mb-4">
            <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
              {title}
            </h3>
          </div>

          {/* Total */}
          <div className="mb-4">
            <p className="text-4xl font-bold text-gray-900">{total}</p>
          </div>

          {/* Segmented bar */}
          <div className="mb-3">
            <div className="flex h-2 rounded-full overflow-hidden bg-gray-100">
              {ok > 0 && (
                <div
                  className="bg-green-500"
                  style={{ width: `${(ok / total) * 100}%` }}
                />
              )}
              {warning > 0 && (
                <div
                  className="bg-yellow-500"
                  style={{ width: `${(warning / total) * 100}%` }}
                />
              )}
              {overdue > 0 && (
                <div
                  className="bg-red-500"
                  style={{ width: `${(overdue / total) * 100}%` }}
                />
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-gray-600 mb-3">
            <div className="flex items-center gap-3">
              {ok > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span>{ok}</span>
                </div>
              )}
              {warning > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  <span>{warning}</span>
                </div>
              )}
              {overdue > 0 && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  <span>{overdue}</span>
                </div>
              )}
            </div>
          </div>

          {/* Trend */}
          {trend && (
            <div className="flex items-center gap-1 text-sm font-medium">
              {getTrendIcon()}
              <span className={getTrendColor()}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
