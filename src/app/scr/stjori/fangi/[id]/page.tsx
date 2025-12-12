'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ChevronLeft,
  FileText,
  Upload,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { TimelineVis } from '@/components/fms/TimelineVis';
import { TimelineEventSheet } from '@/components/fms/TimelineEventSheet';
import { ActivityMiniMap } from '@/components/fms/ActivityMiniMap';
import { PinnedHighlights } from '@/components/fms/PinnedHighlights';
import { ExternalSummaryDialog } from '@/components/fms/ExternalSummaryDialog';

import {
  getPrisonerHistory,
  type TimelineEvent,
} from '@/lib/fms/mockPrisonerHistory';
import {
  buildExternalSummary,
  type ExternalSummaryData,
} from '@/lib/fms/externalSummary';

import photoMap from '@/app/data/prisonerPhotos.json';

const MOCK_PRISONERS = [
  {
    id: 'p-001',
    prisonerNumber: '5301-001',
    kennitala: '010180-1234',
    name: 'Snorri Sturluson',
    prisonName: 'Hólmsheiði',
    department: 'Karladeild',
    cell: '5301',
    status: 'Afplánun',
  },
  {
    id: 'p-002',
    prisonerNumber: '5308-004',
    kennitala: '150279-5678',
    name: 'Vaka Dagsdóttir',
    prisonName: 'Litla-Hraun',
    department: 'Kvennadeild',
    cell: '5308',
    status: 'Gæsluvarðhald',
  },
];

const STADA_STYLES: Record<string, string> = {
  "Afplánun": "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  "Gæsluvarðhald": "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200",
  "Einangrun": "bg-red-100 text-red-800 ring-1 ring-red-200",
};

export default function PrisonerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const prisonerId = params?.id as string;

  const prisoner = MOCK_PRISONERS.find(p => p.id === prisonerId);
  const history = useMemo(
    () => (prisoner ? getPrisonerHistory(prisoner.id) : null),
    [prisoner]
  );

  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [showExternalSummary, setShowExternalSummary] = useState(false);
  const [externalSummaryData, setExternalSummaryData] = useState<ExternalSummaryData | null>(null);

  const domainStart = useMemo(() => {
    if (!prisoner || !history || history.events.length === 0) return new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const dates = history.events.map((e) => new Date(e.ts).getTime());
    return new Date(Math.min(...dates) - 30 * 24 * 60 * 60 * 1000);
  }, [prisoner, history]);

  const domainEnd = useMemo(() => {
    if (!prisoner || !history || history.events.length === 0) return new Date();
    const dates = history.events.map((e) => new Date(e.ts).getTime());
    return new Date(Math.max(...dates) + 30 * 24 * 60 * 60 * 1000);
  }, [prisoner, history]);

  const [windowStart, setWindowStart] = useState<Date>(
    new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
  );
  const [windowEnd, setWindowEnd] = useState<Date>(new Date());

  const handleWindowChange = (start: Date, end: Date) => {
    setWindowStart(start);
    setWindowEnd(end);
  };

  if (!prisoner || !history) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold mb-2">Fangi fannst ekki</h1>
          <p className="text-muted-foreground mb-4">
            Fangi með auðkenni {prisonerId} er ekki til.
          </p>
          <Button onClick={() => router.push('/scr/stjori')}>
            <ChevronLeft className="h-4 w-4 mr-2" />
            Til baka
          </Button>
        </div>
      </div>
    );
  }

  const mapped = (photoMap as Record<string, string>)[prisoner.id];
  const base = process.env.NEXT_PUBLIC_PHOTO_BASE ?? '';
  const photoUrl = mapped
    ? `${base}${mapped}`
    : `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(prisoner.name)}`;

  const handleGenerateExternalSummary = () => {
    const summaryData = buildExternalSummary(
      prisoner,
      history.events,
      history.cases,
      30,
      true
    );
    setExternalSummaryData(summaryData);
    setShowExternalSummary(true);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header row */}
      <div className="border-b bg-white sticky top-0 z-20">
        <div className="container mx-auto px-6 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <button
                onClick={() => router.push('/scr/stjori')}
                className="hover:text-foreground"
              >
                Stjórnendayfirlit
              </button>
              <span>/</span>
              <span>Fangi</span>
              <span>/</span>
              <span className="text-foreground font-medium">{prisoner.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Skrá atvik
              </Button>
              <Button variant="outline" size="sm" className="h-8 text-xs">
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Bæta við skjali
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Breyta upplýsingum</DropdownMenuItem>
                  <DropdownMenuItem>Flytja milli deilda</DropdownMenuItem>
                  <DropdownMenuItem>Prenta skýrslu</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button size="sm" onClick={handleGenerateExternalSummary} className="h-8 text-xs">
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Gera samantekt fyrir ytri aðila
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex gap-3">
          {/* Left sticky profile rail */}
          <div className="w-64 shrink-0">
            <div className="sticky top-20 space-y-2">
              <Card>
                <CardContent className="p-3">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <Avatar className="h-24 w-24 rounded-xl">
                      <AvatarImage src={photoUrl} alt={prisoner.name} />
                      <AvatarFallback className="text-xl rounded-xl">
                        {prisoner.name
                          .split(' ')
                          .map(s => s[0])
                          .join('')
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <h2 className="text-base font-bold">{prisoner.name}</h2>
                      <p className="text-xs text-muted-foreground">
                        {prisoner.prisonerNumber}
                      </p>
                    </div>

                    <Badge
                      className={`text-xs ${STADA_STYLES[prisoner.status] ?? 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'}`}
                    >
                      {prisoner.status}
                    </Badge>
                  </div>

                  <div className="mt-4 space-y-2 text-xs">
                    <InfoRow label="Kennitala" value={prisoner.kennitala} />
                    <InfoRow label="Fangelsi" value={prisoner.prisonName} />
                    <InfoRow label="Deild" value={prisoner.department} />
                    <InfoRow label="Klefi" value={prisoner.cell} />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm">Yfirlit</CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-1.5 text-xs">
                  <InfoRow
                    label="Atvik (30 d.)"
                    value={String(
                      history.events.filter(
                        e =>
                          new Date(e.ts) >=
                          new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                      ).length
                    )}
                  />
                  <InfoRow
                    label="Opin mál"
                    value={String(
                      history.cases.filter(c => c.status === 'Opið').length
                    )}
                  />
                  <InfoRow
                    label="Gögn"
                    value={String(history.documents.length)}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <Tabs defaultValue="timeline" className="space-y-2">
              <TabsList>
                <TabsTrigger value="timeline">Tímalína & áætlun</TabsTrigger>
                <TabsTrigger value="collaboration">Samvinna & virkni</TabsTrigger>
                <TabsTrigger value="documents">Gögn</TabsTrigger>
              </TabsList>

              <TabsContent value="timeline" className="space-y-2">
                {/* Pinned highlights */}
                <PinnedHighlights
                  events={history.events}
                  cases={history.cases}
                  documents={history.documents}
                  plan={history.plan}
                />

                {/* Timeline (HERO) */}
                <TimelineVis
                  events={history.events}
                  windowStart={windowStart}
                  windowEnd={windowEnd}
                  onWindowChange={handleWindowChange}
                  onEventSelect={setSelectedEvent}
                />

                {/* Activity minimap */}
                <ActivityMiniMap
                  events={history.events}
                  domainStart={domainStart}
                  domainEnd={domainEnd}
                  windowStart={windowStart}
                  windowEnd={windowEnd}
                  onWindowChange={handleWindowChange}
                />

                {/* Below timeline: tight 2-column */}
                <div className="grid grid-cols-3 gap-2">
                  {/* Left: Plan */}
                  <Card className="col-span-2">
                    <CardHeader className="p-3 pb-2">
                      <CardTitle className="text-sm">Áætlun / Ráðstafanir</CardTitle>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <div className="space-y-1.5">
                        {history.plan.slice(0, 8).map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 text-xs"
                          >
                            <span>{item.task}</span>
                            <Badge
                              className={`text-xs ${
                                item.status === 'Lokið'
                                  ? 'bg-green-100 text-green-800 ring-1 ring-green-200'
                                  : item.status === 'Í gangi'
                                  ? 'bg-blue-100 text-blue-800 ring-1 ring-blue-200'
                                  : 'bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200'
                              }`}
                            >
                              {item.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Right: cards stack */}
                  <div className="space-y-2">
                    <Card>
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-xs">Helstu atvik</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-1.5">
                          {history.events
                            .filter(e => e.severity === 'High')
                            .slice(0, 4)
                            .map(event => (
                              <div
                                key={event.id}
                                className="p-1.5 border rounded text-xs hover:bg-muted/50 cursor-pointer"
                                onClick={() => setSelectedEvent(event)}
                              >
                                <div className="font-medium truncate">{event.title}</div>
                                <div className="text-muted-foreground">
                                  {new Date(event.ts).toLocaleDateString('is-IS', { day: '2-digit', month: '2-digit' })}
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-xs">Opin mál</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-1.5">
                          {history.cases
                            .filter(c => c.status === 'Opið')
                            .slice(0, 4)
                            .map(caseItem => (
                              <div
                                key={caseItem.id}
                                className="p-1.5 border rounded text-xs hover:bg-muted/50 cursor-pointer"
                              >
                                <div className="font-medium truncate">{caseItem.title}</div>
                                <div className="text-muted-foreground">
                                  {caseItem.type} • {caseItem.priority}
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="p-3 pb-2">
                        <CardTitle className="text-xs">Nýleg gögn</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <div className="space-y-1.5">
                          {history.documents.slice(0, 4).map(doc => (
                            <div
                              key={doc.id}
                              className="p-1.5 border rounded text-xs hover:bg-muted/50 cursor-pointer"
                            >
                              <div className="font-medium truncate">{doc.title}</div>
                              <div className="text-muted-foreground">
                                {new Date(doc.date).toLocaleDateString('is-IS', { day: '2-digit', month: '2-digit' })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="collaboration" className="space-y-2">
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">Samvinna & virkni</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0 text-sm text-muted-foreground">
                    Samvinnuatvik, fundir, félagsleg virkni birtist hér.
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="documents" className="space-y-2">
                <Card>
                  <CardHeader className="p-3">
                    <CardTitle className="text-sm">Gögn</CardTitle>
                  </CardHeader>
                  <CardContent className="p-3 pt-0">
                    <div className="space-y-1.5">
                      {history.documents.slice(0, 15).map(doc => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-2 border rounded hover:bg-muted/50 cursor-pointer text-xs"
                        >
                          <div>
                            <div className="font-medium">{doc.title}</div>
                            <div className="text-muted-foreground">
                              {doc.type} • {new Date(doc.date).toLocaleDateString('is-IS', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                            </div>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {doc.size}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      <TimelineEventSheet
        event={selectedEvent}
        open={!!selectedEvent}
        onOpenChange={(open) => !open && setSelectedEvent(null)}
      />

      <ExternalSummaryDialog
        open={showExternalSummary}
        onOpenChange={setShowExternalSummary}
        summaryData={externalSummaryData}
      />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}
