'use client';

import { useState, useMemo } from 'react';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { TimelineEvent, EventType } from '@/lib/fms/mockPrisonerHistory';

interface TimelineBandProps {
  events: TimelineEvent[];
  onEventClick?: (event: TimelineEvent) => void;
}

export function TimelineBand({ events, onEventClick }: TimelineBandProps) {
  const [filterType, setFilterType] = useState<'all' | EventType>('all');
  const [daysToShow, setDaysToShow] = useState<number>(30);
  const [majorOnly, setMajorOnly] = useState(false);
  const [startDate, setStartDate] = useState<string>('');

  // Filter events
  const filteredEvents = useMemo(() => {
    let filtered = events;

    // Type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(e => e.type === filterType);
    }

    // Major events only
    if (majorOnly) {
      filtered = filtered.filter(e => e.severity === 'high' || e.severity === 'critical');
    }

    // Date range
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - daysToShow);

    filtered = filtered.filter(e => e.timestamp >= cutoff);

    // Start date filter
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(e => e.timestamp >= start);
    }

    return filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [events, filterType, daysToShow, majorOnly, startDate]);

  // Group events by week
  const groupedByWeek = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {};

    filteredEvents.forEach(event => {
      const weekStart = new Date(event.timestamp);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];

      if (!groups[weekKey]) {
        groups[weekKey] = [];
      }
      groups[weekKey].push(event);
    });

    return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
  }, [filteredEvents]);

  // Activity histogram data (events per month)
  const histogramData = useMemo(() => {
    const months: { [key: string]: number } = {};

    events.forEach(event => {
      const monthKey = `${event.timestamp.getFullYear()}-${String(event.timestamp.getMonth() + 1).padStart(2, '0')}`;
      months[monthKey] = (months[monthKey] || 0) + 1;
    });

    return Object.entries(months)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-6); // Last 6 months
  }, [events]);

  const getSeverityColor = (severity: TimelineEvent['severity']) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
      default:
        return 'bg-blue-500';
    }
  };

  const getTypeLabel = (type: EventType) => {
    const labels: Record<EventType, string> = {
      atvik: 'Atvik',
      mál: 'Mál',
      skjal: 'Skjal',
      flutningur: 'Flutningur',
      heilsufar: 'Heilsufar',
      samvinna: 'Samvinna',
    };
    return labels[type];
  };

  const formatWeekLabel = (weekKey: string) => {
    const date = new Date(weekKey);
    return date.toLocaleDateString('is-IS', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 p-4 bg-muted/30 rounded-lg border">
        <div className="w-full md:w-48">
          <label className="text-xs text-muted-foreground mb-1 block">Tegund</label>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as any)}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Allt" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Allt</SelectItem>
              <SelectItem value="atvik">Atvik</SelectItem>
              <SelectItem value="mál">Mál</SelectItem>
              <SelectItem value="skjal">Skjöl</SelectItem>
              <SelectItem value="flutningur">Flutningar</SelectItem>
              <SelectItem value="heilsufar">Heilsufar</SelectItem>
              <SelectItem value="samvinna">Samvinna</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-40">
          <label className="text-xs text-muted-foreground mb-1 block">Tímabil (dagar)</label>
          <Select value={String(daysToShow)} onValueChange={(v) => setDaysToShow(Number(v))}>
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30">30 dagar</SelectItem>
              <SelectItem value="60">60 dagar</SelectItem>
              <SelectItem value="180">180 dagar</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-48">
          <label className="text-xs text-muted-foreground mb-1 block">Frá dagsetningu</label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-9"
          />
        </div>

        <div className="flex items-end">
          <Button
            variant={majorOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setMajorOnly(!majorOnly)}
            className="h-9"
          >
            Aðeins helstu
          </Button>
        </div>

        <div className="flex items-end ml-auto">
          <span className="text-xs text-muted-foreground">
            {filteredEvents.length} atvik
          </span>
        </div>
      </div>

      {/* Activity Histogram */}
      <div className="p-4 bg-white rounded-lg border">
        <h3 className="text-sm font-medium mb-3">Virkni síðustu 6 mánuði</h3>
        <ResponsiveContainer width="100%" height={80}>
          <BarChart data={histogramData}>
            <XAxis
              dataKey="month"
              tick={{ fontSize: 11 }}
              tickFormatter={(value) => {
                const [year, month] = value.split('-');
                return `${month}/${year.slice(2)}`;
              }}
            />
            <YAxis tick={{ fontSize: 11 }} width={30} />
            <Tooltip
              formatter={(value) => [`${value} atvik`, 'Fjöldi']}
              labelFormatter={(label) => `Mánuður: ${label}`}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Timeline Band */}
      <div className="p-4 bg-white rounded-lg border">
        <h3 className="text-sm font-medium mb-3">Tímalína</h3>
        <ScrollArea className="h-[400px] w-full">
          <div className="space-y-6">
            {groupedByWeek.map(([weekKey, weekEvents]) => (
              <div key={weekKey} className="space-y-2">
                <div className="flex items-center gap-2 sticky top-0 bg-white py-1 z-10">
                  <div className="text-xs font-medium text-muted-foreground">
                    Vika {formatWeekLabel(weekKey)}
                  </div>
                  <div className="flex-1 border-t border-muted" />
                </div>

                <div className="space-y-2 pl-4">
                  {weekEvents.map((event) => (
                    <div
                      key={event.id}
                      className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => onEventClick?.(event)}
                    >
                      {/* Severity indicator */}
                      <div className={`w-1 h-full min-h-[60px] rounded-full ${getSeverityColor(event.severity)}`} />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{event.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {getTypeLabel(event.type)}
                          </Badge>
                          {event.severity === 'high' || event.severity === 'critical' ? (
                            <Badge variant="destructive" className="text-xs">
                              Mikilvægt
                            </Badge>
                          ) : null}
                        </div>

                        <p className="text-xs text-muted-foreground mb-2">
                          {event.summary}
                        </p>

                        <div className="flex items-center gap-2 flex-wrap">
                          {event.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs bg-muted rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {event.timestamp.toLocaleDateString('is-IS', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {groupedByWeek.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Engin atvik fundust fyrir valið tímabil
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
