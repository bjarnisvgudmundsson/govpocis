'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { StatCard } from '@/components/prison/stat-card';
import { InkomModal, AtvikModal, AdgerdModal, DagbokarfaerslaModal, VaktskyrslаModal } from '@/components/prison/prison-modals';
import { StatusBadge } from '@/components/ui/status-badge';
import { DiaryCalendar } from '@/components/prison/diary-calendar';
import PrisonMap from '@/components/prison/prison-map';
import { prisonDataService, type LogEntry } from '@/lib/prison-data';

export default function FangavordurPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [logEntries, setLogEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [inkomOpen, setInkomOpen] = useState(false);
  const [atvikOpen, setAtvikOpen] = useState(false);
  const [adgerdOpen, setAdgerdOpen] = useState(false);
  const [dagbokarOpen, setDagbokarOpen] = useState(false);
  const [vaktskyrslаOpen, setVaktskyrslаOpen] = useState(false);

  const guardStats = prisonDataService.getGuardStats();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    // Format date on client side to avoid hydration mismatch
    setCurrentDate(new Date().toLocaleDateString('is-IS', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }));
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const entries = await prisonDataService.getLogEntries();
        setLogEntries(entries);
      } catch (error) {
        console.error('Failed to load log entries:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredEntries = logEntries.filter(entry =>
    entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (entry.prisoner && entry.prisoner.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('is-IS', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Vaktabók</h1>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        <div className="flex items-center space-x-2.5">
          {/* Action Buttons */}
          <Button
            onClick={() => setInkomOpen(true)}
            size="sm"
            className="bg-success hover:bg-success/90 text-success-foreground px-2.5"
          >
            Nýr fangi
          </Button>
          <Button
            onClick={() => setAtvikOpen(true)}
            size="sm"
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground px-2.5"
          >
            Skrá atvik
          </Button>
          <Button
            onClick={() => setAdgerdOpen(true)}
            size="sm"
            className="bg-warning hover:bg-warning/90 text-warning-foreground px-2.5"
          >
            Skrá aðgerð
          </Button>
          <Button
            onClick={() => setDagbokarOpen(true)}
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-2.5"
          >
            Dagbókarfærsla
          </Button>

          {/* Search */}
          <div className="w-64">
            <Input
              placeholder="Leita í málum..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="sm"
            />
          </div>

          <Button
            size="sm"
            className="px-2.5"
            variant="secondary"
            asChild
          >
            <Link href="/scr/skyrslur">Viðburðir</Link>
          </Button>

          <Button
            onClick={() => setVaktskyrslаOpen(true)}
            size="sm"
            className="bg-muted hover:bg-muted/90 text-muted-foreground border px-2.5"
            variant="outline"
          >
            Vaktskýrsla
          </Button>
        </div>
      </div>

      {/* Compact Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <StatCard
          title="Fangar á vakt"
          value={guardStats.prisonersOnDuty.total}
          subtitle={`${guardStats.prisonersOnDuty.isolation} í einangrun`}
        />
        <StatCard
          title="Atvik í dag"
          value={guardStats.todayIncidents.total}
          subtitle={`Alvarleiki: ${guardStats.todayIncidents.severity === 'medium' ? 'Miðlungs' : guardStats.todayIncidents.severity}`}
          trend={guardStats.todayIncidents.severity === 'high' ? 'up' : 'neutral'}
        />
        <StatCard
          title="Aðgerðir"
          value={guardStats.actions.total}
          subtitle={guardStats.actions.breakdown}
        />
        <StatCard
          title="Heimsóknir"
          value={guardStats.visits.total}
          subtitle={`Næsta: ${guardStats.visits.nextScheduled}`}
        />
      </div>


      {/* Side-by-side Diary and Activity */}
      <div className="flex gap-3 h-[820px]">
        {/* Diary Calendar - Left side (25%) */}
        <div className="w-[25%]">
          <DiaryCalendar />
        </div>

        {/* Prison Map - Right side (75%) */}
        <div className="w-[75%]">
          <Card className="h-full overflow-hidden">
            <CardContent className="h-full p-0">
              <PrisonMap
                onCreateAtvik={() => setAtvikOpen(true)}
                onCreateDagbok={() => setDagbokarOpen(true)}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modals */}
      <InkomModal open={inkomOpen} onOpenChange={setInkomOpen} />
      <AtvikModal open={atvikOpen} onOpenChange={setAtvikOpen} />
      <AdgerdModal open={adgerdOpen} onOpenChange={setAdgerdOpen} />
      <DagbokarfaerslaModal open={dagbokarOpen} onOpenChange={setDagbokarOpen} />
      <VaktskyrslаModal open={vaktskyrslаOpen} onOpenChange={setVaktskyrslаOpen} />
    </div>
  );
}