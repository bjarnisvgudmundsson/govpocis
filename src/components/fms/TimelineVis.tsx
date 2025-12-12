'use client';

import { useEffect, useRef, useState } from 'react';
import { Timeline, DataSet } from 'vis-timeline/standalone';
import type { TimelineEvent } from '@/lib/fms/mockPrisonerHistory';
import { Button } from '@/components/ui/button';
import 'vis-timeline/styles/vis-timeline-graph2d.css';
import '@/styles/vis-fms.css';

interface TimelineVisProps {
  events: TimelineEvent[];
  filterType?: string;
  majorOnly?: boolean;
  windowStart: Date;
  windowEnd: Date;
  onWindowChange?: (start: Date, end: Date) => void;
  onEventSelect?: (event: TimelineEvent | null) => void;
}

const TYPE_GROUPS = [
  { id: 'Atvik', content: 'Atvik', order: 1 },
  { id: 'Mál', content: 'Mál', order: 2 },
  { id: 'Skjal', content: 'Skjal', order: 3 },
  { id: 'Flutningur', content: 'Flutningur', order: 4 },
  { id: 'Heilsufar', content: 'Heilsufar', order: 5 },
  { id: 'Heimsókn', content: 'Heimsókn', order: 6 },
];

const TYPE_CONFIG = {
  Atvik: { label: 'Atvik', color: '#fda4af', dot: '#fb7185' },
  Mál: { label: 'Mál', color: '#a5b4fc', dot: '#818cf8' },
  Skjal: { label: 'Skjal', color: '#cbd5e1', dot: '#94a3b8' },
  Flutningur: { label: 'Flutningur', color: '#fcd34d', dot: '#fbbf24' },
  Heilsufar: { label: 'Heilsufar', color: '#86efac', dot: '#4ade80' },
  Heimsókn: { label: 'Heimsókn', color: '#c4b5fd', dot: '#a78bfa' },
};

export function TimelineVis({
  events,
  filterType,
  majorOnly,
  windowStart,
  windowEnd,
  onWindowChange,
  onEventSelect,
}: TimelineVisProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<Timeline | null>(null);
  const itemsRef = useRef<DataSet<any> | null>(null);
  const groupsRef = useRef<DataSet<any> | null>(null);
  const backgroundItemsRef = useRef<any[]>([]);
  const rangeChangeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [localFilterType, setLocalFilterType] = useState<string>('all');
  const [localMajorOnly, setLocalMajorOnly] = useState(false);
  const [enabledTypes, setEnabledTypes] = useState<Set<string>>(
    new Set(['Atvik', 'Mál', 'Skjal', 'Flutningur', 'Heilsufar', 'Heimsókn'])
  );

  useEffect(() => {
    if (filterType !== undefined) setLocalFilterType(filterType);
  }, [filterType]);

  useEffect(() => {
    if (majorOnly !== undefined) setLocalMajorOnly(majorOnly);
  }, [majorOnly]);

  // Initialize timeline once
  useEffect(() => {
    if (!containerRef.current || timelineRef.current) return;

    const items = new DataSet([]);
    const groups = new DataSet(TYPE_GROUPS);

    const options = {
      height: '240px',
      stack: true,
      cluster: {
        maxItems: 3,
        titleTemplate: '{count} atriði',
      },
      zoomMin: 1000 * 60 * 60 * 24 * 2,
      zoomMax: 1000 * 60 * 60 * 24 * 540,
      locale: 'is',
      orientation: 'top',
      showCurrentTime: true,
      start: windowStart,
      end: windowEnd,
    };

    const timeline = new Timeline(containerRef.current, items, groups, options);

    timeline.on('rangechanged', (props: any) => {
      if (rangeChangeTimeoutRef.current) clearTimeout(rangeChangeTimeoutRef.current);
      rangeChangeTimeoutRef.current = setTimeout(() => {
        if (onWindowChange && props.start && props.end) {
          onWindowChange(new Date(props.start), new Date(props.end));
        }
      }, 300);
    });

    timeline.on('select', (props: any) => {
      if (props.items && props.items.length > 0) {
        const itemId = props.items[0];
        const item = items.get(itemId);
        if (item && item.eventData) {
          onEventSelect?.(item.eventData);
        }
      } else {
        onEventSelect?.(null);
      }
    });

    timelineRef.current = timeline;
    itemsRef.current = items;
    groupsRef.current = groups;

    return () => {
      if (rangeChangeTimeoutRef.current) clearTimeout(rangeChangeTimeoutRef.current);
      timeline.destroy();
    };
  }, []);

  // Update window when props change
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.setWindow(windowStart, windowEnd, { animation: false });
    }
  }, [windowStart, windowEnd]);

  // Compute burst bands
  const computeBurstBands = (filteredEvents: TimelineEvent[]) => {
    const bands: any[] = [];
    const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

    const windowDays = 7;
    const highThreshold = 3;
    const mediumThreshold = 2;

    const dayMap: Record<string, { count: number; highCount: number }> = {};

    sortedEvents.forEach((e) => {
      const dayKey = new Date(e.ts).toISOString().split('T')[0];
      if (!dayMap[dayKey]) dayMap[dayKey] = { count: 0, highCount: 0 };
      dayMap[dayKey].count++;
      if (e.severity === 'High' || e.major) dayMap[dayKey].highCount++;
    });

    const days = Object.keys(dayMap).sort();

    for (let i = 0; i < days.length; i++) {
      const start = new Date(days[i]);
      const end = new Date(start);
      end.setDate(end.getDate() + windowDays);

      let totalHigh = 0;
      let totalCount = 0;

      for (let j = i; j < days.length; j++) {
        const d = new Date(days[j]);
        if (d >= start && d < end) {
          totalHigh += dayMap[days[j]].highCount;
          totalCount += dayMap[days[j]].count;
        }
      }

      if (totalHigh >= highThreshold) {
        bands.push({
          id: `burst-high-${i}`,
          start: start,
          end: end,
          type: 'background',
          className: 'vis-burst-high',
        });
      } else if (totalCount >= mediumThreshold) {
        bands.push({
          id: `burst-medium-${i}`,
          start: start,
          end: end,
          type: 'background',
          className: 'vis-burst-medium',
        });
      }
    }

    return bands;
  };

  // Update items when events or filters change
  useEffect(() => {
    if (!itemsRef.current) return;

    let filtered = events;

    // Apply legend toggles
    filtered = filtered.filter((e) => enabledTypes.has(e.type));

    // Apply dropdown filter
    if (localFilterType !== 'all') {
      filtered = filtered.filter((e) => e.type === localFilterType);
    }

    // Apply major only filter
    if (localMajorOnly) {
      filtered = filtered.filter((e) => e.severity === 'High' || e.major);
    }

    const burstBands = computeBurstBands(filtered);

    const visItems = filtered.map((event) => {
      const isIncident = event.type === 'Atvik' || event.severity === 'High';
      const truncatedTitle = event.title.length > 24 ? event.title.substring(0, 24) + '...' : event.title;

      const sevIcelandic = event.severity === 'High' ? 'Hátt' : event.severity === 'Medium' ? 'Miðlungs' : 'Lágt';

      const title = `
        <div style="font-size: 12px; line-height: 1.4;">
          <div style="font-weight: 600; margin-bottom: 4px;">${event.title}</div>
          <div style="color: #666; margin-bottom: 4px;">${new Date(event.ts).toLocaleString('is-IS', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
          <div>
            <span style="background: #e0e7ff; color: #3730a3; padding: 2px 6px; border-radius: 4px; font-size: 11px; margin-right: 4px;">${event.type}</span>
            <span style="background: ${event.severity === 'High' ? '#fee2e2' : event.severity === 'Medium' ? '#fef3c7' : '#dbeafe'};
                         color: ${event.severity === 'High' ? '#991b1b' : event.severity === 'Medium' ? '#92400e' : '#1e3a8a'};
                         padding: 2px 6px; border-radius: 4px; font-size: 11px;">${sevIcelandic}</span>
          </div>
        </div>
      `;

      let className = `fms-type-${event.type.toLowerCase()} fms-sev-${event.severity.toLowerCase()}`;
      if (event.major) className += ' fms-item-major';

      return {
        id: event.id,
        content: isIncident ? '' : truncatedTitle,
        start: new Date(event.ts),
        group: event.type,
        className,
        type: isIncident ? 'point' : 'box',
        title,
        eventData: event,
      };
    });

    const allItems = [...visItems, ...burstBands];

    itemsRef.current.clear();
    itemsRef.current.add(allItems);
    backgroundItemsRef.current = burstBands;
  }, [events, localFilterType, localMajorOnly, enabledTypes]);

  const toggleType = (type: string) => {
    setEnabledTypes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-2">
      {/* Legend with toggles */}
      <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 rounded-lg border text-xs">
        <span className="text-muted-foreground font-medium">Tegundir:</span>
        {Object.entries(TYPE_CONFIG).map(([type, config]) => (
          <button
            key={type}
            onClick={() => toggleType(type)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded transition-opacity ${
              enabledTypes.has(type) ? 'opacity-100' : 'opacity-40'
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: config.dot }}
            />
            <span className="text-foreground">{config.label}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-3 px-3 py-2 bg-muted/30 rounded-lg border text-xs">
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Tegund:</span>
            <select
              value={localFilterType}
              onChange={(e) => setLocalFilterType(e.target.value)}
              className="px-2 py-1 border rounded bg-background text-xs"
            >
              <option value="all">Allar</option>
              <option value="Atvik">Atvik</option>
              <option value="Mál">Mál</option>
              <option value="Skjal">Skjöl</option>
              <option value="Flutningur">Flutningur</option>
              <option value="Heilsufar">Heilsufar</option>
              <option value="Heimsókn">Heimsókn</option>
            </select>
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={localMajorOnly}
              onChange={(e) => setLocalMajorOnly(e.target.checked)}
              className="w-3.5 h-3.5"
            />
            <span className="text-muted-foreground">Aðeins helstu atriði</span>
          </label>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              const now = new Date();
              onWindowChange?.(new Date(now.getTime() - 1000 * 60 * 60 * 24), new Date(now.getTime() + 1000 * 60 * 60 * 24));
            }}
          >
            Í dag
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              const now = new Date();
              onWindowChange?.(new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), now);
            }}
          >
            30 d.
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              const now = new Date();
              onWindowChange?.(new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), now);
            }}
          >
            60 d.
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              const now = new Date();
              onWindowChange?.(new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000), now);
            }}
          >
            6 mán.
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-6 px-2 text-xs"
            onClick={() => {
              if (events.length > 0) {
                const dates = events.map((e) => new Date(e.ts).getTime());
                const min = new Date(Math.min(...dates));
                const max = new Date(Math.max(...dates));
                onWindowChange?.(min, max);
              }
            }}
          >
            Allt
          </Button>
        </div>
      </div>
      <div ref={containerRef} className="fms-timeline-container border rounded-lg bg-white" />
    </div>
  );
}
