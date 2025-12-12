'use client';

import { useMemo } from 'react';
import type { TimelineEvent, CaseItem } from '@/lib/fms/mockPrisonerHistory';

interface PinnedHighlightsProps {
  events: TimelineEvent[];
  cases: CaseItem[];
  documents: { id: string }[];
  plan: { id: string; dueDate?: string }[];
  windowDays?: number;
}

export function PinnedHighlights({ events, cases, documents, plan, windowDays = 30 }: PinnedHighlightsProps) {
  const highlights = useMemo(() => {
    const now = new Date();
    const cutoff = new Date(now);
    cutoff.setDate(cutoff.getDate() - windowDays);
    const cutoff7d = new Date(now);
    cutoff7d.setDate(cutoff7d.getDate() - 7);

    const recentEvents = events.filter((e) => new Date(e.ts) >= cutoff);
    const highEvents = recentEvents.filter((e) => e.severity === 'High' || e.major);
    const openCases = cases.filter((c) => c.status === 'Opið');
    const nextReview = plan
      .filter((p) => p.dueDate)
      .map((p) => new Date(p.dueDate!))
      .sort((a, b) => a.getTime() - b.getTime())[0];

    const recent7d = events.filter((e) => new Date(e.ts) >= cutoff7d);
    const burstWarning = recent7d.filter((e) => e.severity === 'High' || e.major).length >= 3;

    const chips = [];

    if (recentEvents.length > 0) {
      chips.push({
        id: 'events',
        label: `Atvik (30 dagar): ${recentEvents.length}`,
        color: recentEvents.length > 10 ? 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200' : 'bg-blue-100 text-blue-800 ring-1 ring-blue-200',
      });
    }

    if (highEvents.length > 0) {
      chips.push({
        id: 'high',
        label: `Helstu atvik (30 dagar): ${highEvents.length}`,
        color: 'bg-red-100 text-red-800 ring-1 ring-red-200',
      });
    }

    if (openCases.length > 0) {
      chips.push({
        id: 'cases',
        label: `Opin mál: ${openCases.length}`,
        color: openCases.length > 3 ? 'bg-red-100 text-red-800 ring-1 ring-red-200' : 'bg-purple-100 text-purple-800 ring-1 ring-purple-200',
      });
    }

    if (nextReview) {
      chips.push({
        id: 'review',
        label: `Næsta endurskoðun: ${nextReview.toLocaleDateString('is-IS', { day: '2-digit', month: '2-digit', year: 'numeric' })}`,
        color: 'bg-green-100 text-green-800 ring-1 ring-green-200',
      });
    }

    if (burstWarning) {
      chips.push({
        id: 'burst',
        label: 'Viðvörun: atvikavirkni síðustu 7 daga',
        color: 'bg-red-100 text-red-800 ring-1 ring-red-200',
      });
    }

    return chips;
  }, [events, cases, documents, plan, windowDays]);

  if (highlights.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
      <span className="text-xs font-medium text-muted-foreground mr-1">Mikilvægt:</span>
      {highlights.map((chip) => (
        <span key={chip.id} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${chip.color}`}>
          {chip.label}
        </span>
      ))}
    </div>
  );
}
