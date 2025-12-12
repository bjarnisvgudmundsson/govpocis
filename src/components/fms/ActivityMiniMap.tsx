'use client';

import { useMemo, useRef, useState, useEffect } from 'react';
import type { TimelineEvent } from '@/lib/fms/mockPrisonerHistory';

interface ActivityMiniMapProps {
  events: TimelineEvent[];
  domainStart: Date;
  domainEnd: Date;
  windowStart: Date;
  windowEnd: Date;
  onWindowChange: (start: Date, end: Date) => void;
}

export function ActivityMiniMap({
  events,
  domainStart,
  domainEnd,
  windowStart,
  windowEnd,
  onWindowChange,
}: ActivityMiniMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [dragStartWindowStart, setDragStartWindowStart] = useState<Date>(windowStart || new Date());
  const [dragStartWindowEnd, setDragStartWindowEnd] = useState<Date>(windowEnd || new Date());

  // Prevent SSR hydration mismatch by only rendering on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const width = 1200;
  const height = 80;
  const padding = 40;
  const chartWidth = width - padding * 2;
  const chartHeight = height - 30;

  const dailyData = useMemo(() => {
    // Safety check - should never happen based on interface, but guard against runtime errors
    if (!domainStart || !domainEnd) {
      console.warn('ActivityMiniMap: domainStart or domainEnd is undefined', { domainStart, domainEnd });
      return [];
    }

    const dayMap: Record<string, number> = {};
    const domain = domainEnd.getTime() - domainStart.getTime();
    const days = Math.ceil(domain / (1000 * 60 * 60 * 24));

    for (let i = 0; i < days; i++) {
      const d = new Date(domainStart.getTime() + i * 24 * 60 * 60 * 1000);
      const key = d.toISOString().split('T')[0];
      dayMap[key] = 0;
    }

    events.forEach((e) => {
      const key = new Date(e.ts).toISOString().split('T')[0];
      if (dayMap[key] !== undefined) dayMap[key]++;
    });

    return Object.entries(dayMap)
      .map(([date, count]) => ({ date: new Date(date), count }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [events, domainStart, domainEnd]);

  const maxCount = useMemo(() => Math.max(...dailyData.map((d) => d.count), 1), [dailyData]);

  const timeToX = (time: Date) => {
    const domainRange = domainEnd.getTime() - domainStart.getTime();
    const offset = time.getTime() - domainStart.getTime();
    return padding + (offset / domainRange) * chartWidth;
  };

  const xToTime = (x: number) => {
    const domainRange = domainEnd.getTime() - domainStart.getTime();
    const offset = ((x - padding) / chartWidth) * domainRange;
    return new Date(domainStart.getTime() + offset);
  };

  const selectionX1 = timeToX(windowStart);
  const selectionX2 = timeToX(windowEnd);

  const handleMouseDown = (e: React.MouseEvent<SVGRectElement>, mode: 'drag' | 'left' | 'right') => {
    e.preventDefault();
    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;

    setDragStartX(x);
    setDragStartWindowStart(windowStart);
    setDragStartWindowEnd(windowEnd);

    if (mode === 'drag') setIsDragging(true);
    else if (mode === 'left') setIsResizingLeft(true);
    else if (mode === 'right') setIsResizingRight(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const svg = svgRef.current;
    if (!svg || (!isDragging && !isResizingLeft && !isResizingRight)) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const deltaX = x - dragStartX;
    const domainRange = domainEnd.getTime() - domainStart.getTime();
    const deltaTime = (deltaX / chartWidth) * domainRange;

    if (isDragging) {
      const newStart = new Date(dragStartWindowStart.getTime() + deltaTime);
      const newEnd = new Date(dragStartWindowEnd.getTime() + deltaTime);
      onWindowChange(newStart, newEnd);
    } else if (isResizingLeft) {
      const newStart = new Date(dragStartWindowStart.getTime() + deltaTime);
      if (newStart < dragStartWindowEnd) {
        onWindowChange(newStart, dragStartWindowEnd);
      }
    } else if (isResizingRight) {
      const newEnd = new Date(dragStartWindowEnd.getTime() + deltaTime);
      if (newEnd > dragStartWindowStart) {
        onWindowChange(dragStartWindowStart, newEnd);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizingLeft(false);
    setIsResizingRight(false);
  };

  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (isDragging || isResizingLeft || isResizingRight) return;

    const svg = svgRef.current;
    if (!svg) return;

    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const clickedTime = xToTime(x);

    const windowDuration = windowEnd.getTime() - windowStart.getTime();
    const newStart = new Date(clickedTime.getTime() - windowDuration / 2);
    const newEnd = new Date(clickedTime.getTime() + windowDuration / 2);

    onWindowChange(newStart, newEnd);
  };

  useEffect(() => {
    if (isDragging || isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizingLeft, isResizingRight, dragStartX, dragStartWindowStart, dragStartWindowEnd]);

  // Prevent hydration mismatch - only render on client after mount
  if (!isMounted) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg border" style={{ height: '80px' }}>
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Virkni síðustu 365–540 daga</h4>
      </div>
    );
  }

  // Guard clause: ensure dates are valid before rendering
  if (!domainStart || !domainEnd || !windowStart || !windowEnd) {
    return (
      <div className="p-3 bg-muted/30 rounded-lg border">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Virkni síðustu 365–540 daga</h4>
        <div className="text-xs text-muted-foreground">Hleður...</div>
      </div>
    );
  }

  return (
    <div className="p-3 bg-muted/30 rounded-lg border">
      <h4 className="text-xs font-medium text-muted-foreground mb-2">Virkni síðustu 365–540 daga</h4>
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        className="cursor-crosshair"
        onClick={handleSvgClick}
      >
        {/* Needles */}
        {dailyData.map((d, i) => {
          const x = timeToX(d.date);
          const barHeight = (d.count / maxCount) * chartHeight;
          return (
            <rect
              key={i}
              x={x}
              y={chartHeight - barHeight + 10}
              width={2}
              height={barHeight}
              fill="#3b82f6"
              opacity={0.7}
            />
          );
        })}

        {/* Selection window overlay */}
        <rect
          x={selectionX1}
          y={10}
          width={selectionX2 - selectionX1}
          height={chartHeight}
          fill="rgba(59, 130, 246, 0.15)"
          stroke="#3b82f6"
          strokeWidth={1}
          className="cursor-move"
          onMouseDown={(e) => handleMouseDown(e, 'drag')}
        />

        {/* Left resize handle */}
        <rect
          x={selectionX1 - 3}
          y={10}
          width={6}
          height={chartHeight}
          fill="#3b82f6"
          className="cursor-ew-resize"
          onMouseDown={(e) => handleMouseDown(e, 'left')}
        />

        {/* Right resize handle */}
        <rect
          x={selectionX2 - 3}
          y={10}
          width={6}
          height={chartHeight}
          fill="#3b82f6"
          className="cursor-ew-resize"
          onMouseDown={(e) => handleMouseDown(e, 'right')}
        />

        {/* X axis labels */}
        <text x={padding} y={height - 5} fontSize="10" fill="#666" textAnchor="start">
          {domainStart.toLocaleDateString('is-IS', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </text>
        <text x={width - padding} y={height - 5} fontSize="10" fill="#666" textAnchor="end">
          {domainEnd.toLocaleDateString('is-IS', { day: '2-digit', month: '2-digit', year: 'numeric' })}
        </text>
      </svg>
    </div>
  );
}
