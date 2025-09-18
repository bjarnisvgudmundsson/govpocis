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

  // Update formatted date when selectedDate changes
  useEffect(() => {
    setFormattedDate(formatDate(selectedDate));
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
            description: 'Vaktskýrsla varðstjóra - FSo - Fangelisið Sogn',
            location: 'FSo - Fangelisið Sogn',
            reporter: 'Ólafur Kárason Ljósvíkingur',
            status: 'LOKIÐ'
          },
          {
            id: 'shift-2', 
            time: '14:00',
            type: 'Vaktskýrsla varðstjóra',
            description: 'Vaktskýrsla varðstjóra - KV - Fangelisið Kvíabryggju',
            location: 'KV - Fangelisið Kvíabryggju',
            reporter: 'Guðný Ólafsdóttir',
            status: 'Í VINNSLU'
          },
          {
            id: 'shift-3',
            time: '22:00',
            type: 'Vaktskýrsla varðstjóra',
            description: 'Vaktskýrsla varðstjóra - LH - Fangelisið Litla-Hrauni',
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

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Leit':
        return 'bg-primary text-primary-foreground';
      case 'Lausagæsla':
        return 'bg-success text-success-foreground';
      case 'Afplánunarfangi':
        return 'bg-warning text-warning-foreground';
      case 'Slagsmál':
      case 'Vörubrögð':
        return 'bg-destructive text-destructive-foreground';
      case 'Vaktskýrsla varðstjóra':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('is-IS', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
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
      <CardContent className="h-full overflow-hidden">
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Hleður dagbók...
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Engar færslur fyrir þennan dag
          </div>
        ) : (
          <div className="space-y-2 h-full overflow-y-auto">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="text-sm font-mono text-muted-foreground min-w-[40px]">
                      {entry.time}
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center space-x-2">
                        <Badge className={getTypeColor(entry.type)} size="sm">
                          {entry.type}
                        </Badge>
                        {entry.prisoner && (
                          <span className="text-base font-medium text-foreground">
                            {entry.prisoner}
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-foreground">
                        {entry.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{entry.location}</span>
                        <StatusBadge status={entry.status} className="text-xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}