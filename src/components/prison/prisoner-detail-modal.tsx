'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { prisonDataService, type Prisoner, type LogEntry } from '@/lib/prison-data';
import { StatusBadge } from '@/components/ui/status-badge';

interface PrisonerDetailModalProps {
  cellId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PrisonerDetailModal({ cellId, open, onOpenChange }: PrisonerDetailModalProps) {
  const [prisoner, setPrisoner] = useState<Prisoner | null>(null);
  const [recentLogs, setRecentLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cellId && open) {
      setLoading(true);
      const foundPrisoner = prisonDataService.getPrisonerByCell(cellId);

      if (foundPrisoner) {
        setPrisoner(foundPrisoner);
        const logs = prisonDataService.getPrisonerRecentLogs(foundPrisoner.id);
        setRecentLogs(logs);
      } else {
        setPrisoner(null);
        setRecentLogs([]);
      }

      setLoading(false);
    }
  }, [cellId, open]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'medical':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'isolation':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleString('is-IS', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Klef {cellId}
            {prisoner && (
              <Badge className={getStatusColor(prisoner.status)}>
                {prisoner.status === 'normal' && 'Venjuleg staða'}
                {prisoner.status === 'medical' && 'Þarfnast læknishjálpar'}
                {prisoner.status === 'isolation' && 'Einangrun'}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Hleður...</div>
            </div>
          )}

          {!loading && !prisoner && (
            <div className="text-center py-8">
              <div className="text-muted-foreground">Klef {cellId} er tómt</div>
            </div>
          )}

          {!loading && prisoner && (
            <>
              {/* Prisoner Information */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Fangi upplýsingar</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Nafn</div>
                      <div className="font-semibold">{prisoner.name}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">ID</div>
                      <div className="font-mono text-sm">{prisoner.id}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Kennitala</div>
                      <div className="font-mono text-sm">{prisoner.kennitala}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Deild</div>
                      <div>{prisoner.ward}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Log (Last 24h) */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Virkni síðustu 24 klst</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px] pr-4">
                    <div className="space-y-3">
                      {recentLogs.map((log) => (
                        <div
                          key={log.id}
                          className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{log.type}</span>
                              <StatusBadge status={log.status} size="sm" />
                              <span className="text-xs text-muted-foreground ml-auto">
                                {formatTime(log.timestamp)}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {log.description}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Skráð af: {log.reporter}
                            </p>
                          </div>
                        </div>
                      ))}

                      {recentLogs.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          Engin virkni skráð síðustu 24 klst
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}