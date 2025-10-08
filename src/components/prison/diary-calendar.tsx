'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { prisonDataService, type Incident, type PrisonAction, type LogEntry } from '@/lib/prison-data';

interface DiaryEntry {
  id: string;
  time: string;
  type: 'Atvik' | 'Aðgerð' | 'Leit' | 'Lausagæsla' | 'Afplánunarfangi' | 'Ónnur leyfi' | 'Skýrsla' | 'Vaktskýrsla varðstjóra';
  description: string;
  prisoner?: string;
  location: string;
  reporter: string;
  status: string;
}

export function DiaryCalendar() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formattedDate, setFormattedDate] = useState('');

  // Update formatted date when selectedDate changes - Icelandic weekday
  useEffect(() => {
    const dateStr = selectedDate.toLocaleDateString('is-IS', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const capitalized = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    setFormattedDate(capitalized);
  }, [selectedDate]);

  useEffect(() => {
    const loadDiaryData = async () => {
      try {
        const [incidents, actions, logEntries] = await Promise.all([
          prisonDataService.getIncidents(),
          prisonDataService.getActions(),
          prisonDataService.getLogEntries()
        ]);

        // Convert all data to diary entries format
        const allEntries: DiaryEntry[] = [
          // Incidents
          ...incidents.map(incident => ({
            id: `incident-${incident.id}`,
            time: incident.timestamp.toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' }),
            type: incident.type as any,
            description: incident.description,
            prisoner: incident.prisoners.length > 0 ? getPrisonerName(incident.prisoners[0]) : undefined,
            location: `HH - Fangelisið Hólmsheiði`, // Default location based on your image
            reporter: incident.reporter,
            status: incident.status
          })),
          // Actions
          ...actions.map(action => ({
            id: `action-${action.id}`,
            time: action.timestamp.toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' }),
            type: getActionDisplayType(action.type),
            description: getActionDescription(action),
            prisoner: action.prisoner,
            location: `HH - Fangelisið Hólmsheiði`,
            reporter: action.authorizedBy,
            status: action.status
          })),
          // Add some sample shift reports
          {
            id: 'shift-1',
            time: '06:00',
            type: 'Vaktskýrsla varðstjóra',
            description: 'Fangelsið að Sogni',
            location: 'FSo - Fangelisið Sogn',
            reporter: 'Ólafur Kárason Ljósvíkingur',
            status: 'LOKIÐ'
          },
          {
            id: 'shift-2',
            time: '14:00',
            type: 'Vaktskýrsla varðstjóra',
            description: 'KV - Fangelisið Kvíabryggju',
            location: 'KV - Fangelisið Kvíabryggju',
            reporter: 'Guðný Ólafsdóttir',
            status: 'Í VINNSLU'
          },
          {
            id: 'shift-3',
            time: '22:00',
            type: 'Vaktskýrsla varðstjóra',
            description: 'Fangelsið Litla-Hrauni',
            location: 'LH - Fangelisið Litla-Hrauni',
            reporter: 'Magnús á Ljósvík',
            status: 'LOKIÐ'
          }
        ];

        // Sort by time
        allEntries.sort((a, b) => a.time.localeCompare(b.time));
        setEntries(allEntries);
      } catch (error) {
        console.error('Failed to load diary data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiaryData();
  }, [selectedDate]);

  const getPrisonerName = (prisonerId: string) => {
    const names: Record<string, string> = {
      '1': 'Bjartur í Sumarhúsum',
      '2': 'Rósa Bjartsdóttir',
      '3': 'Finnur Bjartsson',
      '4': 'Ásta Sóllilja Bjartsdóttir',
      '5': 'Hallbera Bjartsdóttir',
      '6': 'Nonni Bjartsson',
      '7': 'Helgi Bjartsson'
    };
    return names[prisonerId] || `Fangi-${prisonerId}`;
  };

  const getActionDisplayType = (type: string): any => {
    const typeMap: Record<string, string> = {
      'search': 'Leit',
      'confiscation': 'Leit',
      'separation': 'Afplánunarfangi',
      'restriction': 'Afplánunarfangi'
    };
    return typeMap[type] || type;
  };

  const getActionDescription = (action: PrisonAction) => {
    switch (action.type) {
      case 'search':
        return `Leit - ${action.details.type || 'Hefðbundin leit'}`;
      case 'confiscation':
        return `Haldlagning - ${action.details.item || 'Hlutir'}`;
      case 'separation':
        return `Aðskilnaður - ${action.details.reason || 'Öryggisráðstöfun'}`;
      default:
        return `Aðgerð - ${action.type}`;
    }
  };

  const translateType = (t?: string) => {
    if (!t) return '';
    const map: Record<string, string> = {
      'Vorubrogd': 'Upptaka',
      'Vörubrögð': 'Upptaka',
      'VORUBROGD': 'Upptaka',
      'Haldlagning': 'Upptaka',
      'Upptaka': 'Upptaka',
      'Leit': 'Leit',
      'Slagsmal': 'Slagsmál',
      'Slagsmál': 'Slagsmál',
    };
    return map[t] ?? t;
  };

  const translateStatus = (s?: string) => {
    if (!s) return '';
    const key = s.toLowerCase();
    const map: Record<string, string> = {
      'completed': 'Afgreitt',
      'complete': 'Afgreitt',
      'done': 'Afgreitt',
      'lokið': 'Afgreitt',
      'processing': 'Óafgreitt',
      'in_progress': 'Óafgreitt',
      'pending': 'Óafgreitt',
      'í vinnslu': 'Óafgreitt',
      'urgent': 'Áríðandi',
      'critical': 'Áríðandi',
      'priority': 'Áríðandi',
    };
    return map[key] ?? s;
  };

  const translateTags = (tags?: string[]) => {
    if (!tags?.length) return [];
    const map: Record<string, {label: string; className: string}> = {
      'Upptaka': { label: 'Upptaka', className: 'bg-sky-100 text-sky-800 border-sky-300' },
      'Slagsmál': { label: 'Slagsmál', className: 'bg-rose-100 text-rose-800 border-rose-300' },
      'Leit': { label: 'Leit', className: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    };
    return tags
      .map(t => map[translateType(t)])
      .filter(Boolean)
      .map((t, idx) => ({ ...t, key: `${t!.label}-${idx}` }));
  };

  const statusClasses = (label: string) => {
    switch (label) {
      case 'Afgreitt':   return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Óafgreitt':  return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Áríðandi':   return 'bg-red-100 text-red-800 border-red-300';
      default:           return 'bg-slate-100 text-slate-700 border-slate-300';
    }
  };

  const getTypeColor = (type: string) => {
    const translatedType = translateType(type);
    switch (translatedType) {
      case 'Leit':
        return 'bg-primary text-primary-foreground';
      case 'Lausagæsla':
        return 'bg-success text-success-foreground';
      case 'Afplánunarfangi':
        return 'bg-warning text-warning-foreground';
      case 'Slagsmál':
      case 'Haldlagning':
        return 'bg-destructive text-destructive-foreground';
      case 'Vaktskýrsla varðstjóra':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };


  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="space-y-2">
          <CardTitle className="text-lg">Dagbók</CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{formattedDate}</p>
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() - 1)))}
              >
                ←
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date())}
              >
                Í dag
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedDate(new Date(selectedDate.setDate(selectedDate.getDate() + 1)))}
              >
                →
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Hleður dagbók...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Engar færslur fyrir þennan dag
          </div>
        ) : (
          <div className="rounded-lg border mx-4 mb-4 overflow-hidden">
            <ul className="divide-y h-full overflow-y-auto max-h-[calc(100vh-24rem)]">
              {entries.map((entry) => {
                const status = translateStatus(entry.status);
                const tags = translateTags([entry.type]);

                return (
                  <li
                    key={entry.id}
                    className="px-2 py-2 hover:bg-muted/30 transition-colors"
                  >
                    <div className="grid grid-cols-[56px_1fr_auto] items-start gap-2">
                      <span className="text-[12px] text-muted-foreground tabular-nums leading-tight">
                        {entry.time}
                      </span>

                      <div className="space-y-0.5">
                        <div className="text-[12px] leading-tight font-medium">
                          {translateType(entry.type)} — {entry.description}
                        </div>
                        {entry.location && (
                          <div className="text-[11px] text-muted-foreground leading-tight">
                            {entry.location}
                          </div>
                        )}
                        {tags?.length ? (
                          <div className="flex flex-wrap gap-1 pt-0.5">
                            {tags.slice(0, 2).map(t => (
                              <span key={t.key} className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] ${t.className}`}>
                                {t.label}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>

                      <StatusBadge status={status} />
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
