'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatCard } from '@/components/prison/stat-card';
import { prisonDataService, type Facility } from '@/lib/prison-data';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

/* ----------------------------- New local types ----------------------------- */

type CustodyStatus = 'Gæsluvarðhald' | 'Afplánun';

type Prisoner = {
  id: string;
  prisonerNumber: string;    // Fanganúmer
  kennitala: string;
  name: string;
  prisonId: string;
  prisonName: string;
  department: string;        // Deild
  cell: string;              // Klefi
  lawyer?: string;
  lawyerPhone?: string;
  status: CustodyStatus;     // Staða
  notes?: string;            // Athugasemdir
  medical?: {
    allergies?: string;
    meds?: string;
    risks?: string;
  };
  photoUrl?: string;         // Optional portrait
};

/* --------------------- Mock data + service shim (safe) --------------------- */
/* Replace this with prisonDataService.getPrisoners() when available. */
async function getMockPrisoners(): Promise<Prisoner[]> {
  const data: Prisoner[] = [
    {
      id: 'p-001',
      prisonerNumber: '5301-001',
      kennitala: '010180-1234',
      name: 'Snorri Sturluson',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Karladeild',
      cell: '5301',
      lawyer: 'Leifur Runólfsson',
      lawyerPhone: '662-4600',
      status: 'Afplánun',
      notes: 'Ofnæmi fyrir fiski',
      medical: { allergies: 'Fiskur', meds: '—', risks: '—' },
      photoUrl: ''
    },
    {
      id: 'p-002',
      prisonerNumber: '5308-004',
      kennitala: '150279-5678',
      name: 'Vaka Dagsdóttir',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Kvennadeild',
      cell: '5308',
      lawyer: 'Vaka Dagsdóttir',
      lawyerPhone: '848-9608',
      status: 'Gæsluvarðhald',
      notes: 'Bjallan bilað – hafið samband við verkstjóra',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: ''
    },
    {
      id: 'p-003',
      prisonerNumber: '5314-007',
      kennitala: '220388-2222',
      name: 'Lilja Margrét Olsen',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5314',
      lawyer: 'Lilja Margrét Olsen',
      lawyerPhone: '862-4642',
      status: 'Afplánun',
      notes: 'Sjónvarp bilað / þrifur rækt',
      medical: { allergies: 'Ryk', meds: 'Antihistamín', risks: '—' },
      photoUrl: ''
    },
    {
      id: 'p-004',
      prisonerNumber: '5312-011',
      kennitala: '120190-0009',
      name: 'Ásta Sóllilja',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5312',
      lawyer: 'Sverrir Arnarson',
      lawyerPhone: '771-1122',
      status: 'Gæsluvarðhald',
      notes: 'Viðkvæm fyrir lyktarefnum',
      medical: { allergies: 'Ilmefni', meds: '—', risks: '—' },
      photoUrl: ''
    },
    {
      id: 'p-005',
      prisonerNumber: '5305-003',
      kennitala: '010175-1111',
      name: 'Bjartur Guðmundsson',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Karladeild',
      cell: '5305',
      lawyer: 'Hrefna Hauksdóttir',
      lawyerPhone: '780-3344',
      status: 'Afplánun',
      notes: 'Sykursýki II',
      medical: { allergies: '—', meds: 'Metformin', risks: 'Blóðsykursföll' },
      photoUrl: ''
    },
    {
      id: 'p-006',
      prisonerNumber: '5310-008',
      kennitala: '090284-2222',
      name: 'Gvendur Ketilsson',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Karladeild',
      cell: '5310',
      lawyer: 'Tinna Guðrún',
      lawyerPhone: '690-7788',
      status: 'Afplánun',
      notes: 'Bið um læknistíma vikulega',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: ''
    },
    {
      id: 'p-007',
      prisonerNumber: '5302-014',
      kennitala: '230393-3333',
      name: 'Rósa Ingibjörg',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5302',
      lawyer: 'Aron Gíslason',
      lawyerPhone: '661-9900',
      status: 'Gæsluvarðhald',
      notes: 'Ofnæmi: Hnetur',
      medical: { allergies: 'Hnetur', meds: 'Adrenalínpenni', risks: 'Ofnæmislost' },
      photoUrl: ''
    },
    {
      id: 'p-008',
      prisonerNumber: '5307-019',
      kennitala: '110172-4444',
      name: 'Nonni Jónsson',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Karladeild',
      cell: '5307',
      lawyer: 'Elísabet Þórarinsdóttir',
      lawyerPhone: '772-5566',
      status: 'Afplánun',
      notes: 'Gleraugu brotin – pöntun í gangi',
      medical: { allergies: '—', meds: 'Blóðþrýstingslyf', risks: '—' },
      photoUrl: ''
    },
    {
      id: 'p-009',
      prisonerNumber: '5316-002',
      kennitala: '300489-5555',
      name: 'Sólveig Hrefna',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5316',
      lawyer: 'Snorri Þráinsson',
      lawyerPhone: '775-8899',
      status: 'Gæsluvarðhald',
      notes: 'Tungumálastuðningur: EN/IS',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: ''
    },
    {
      id: 'p-010',
      prisonerNumber: '5319-006',
      kennitala: '050180-6666',
      name: 'Ágúst Einar',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Karladeild',
      cell: '5319',
      lawyer: 'Lilja Sif',
      lawyerPhone: '780-1234',
      status: 'Afplánun',
      notes: 'Fæði: Grænmetisfæði',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: ''
    },
    {
      id: 'p-011',
      prisonerNumber: '5304-017',
      kennitala: '141290-7777',
      name: 'Guðmundur Kári',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Karladeild',
      cell: '5304',
      lawyer: 'Berglind Ósk',
      lawyerPhone: '696-7000',
      status: 'Gæsluvarðhald',
      notes: 'Forðast sterk hljóð (heyrnartæki)',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: ''
    },
    {
      id: 'p-012',
      prisonerNumber: '5318-012',
      kennitala: '201279-8888',
      name: 'Þórhildur Ragna',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5318',
      lawyer: 'Hlynur Magnússon',
      lawyerPhone: '820-5565',
      status: 'Afplánun',
      notes: 'Hreyfing: Sjóntaugasjúkdómur (létt verkefni)',
      medical: { allergies: '—', meds: 'Augndropar', risks: '—' },
      photoUrl: ''
    }
  ];

  return data.map(p => ({
    ...p,
    photoUrl: p.photoUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(p.name)}`
  }));
}

/* --------------------------------- Page ----------------------------------- */

export default function StjoriPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  const directorStats = prisonDataService.getDirectorStats();

  // New: prisoners state
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [loadingPrisoners, setLoadingPrisoners] = useState(true);

  // New: filters
  const [prisonFilter, setPrisonFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | CustodyStatus>('all');
  const [query, setQuery] = useState('');

  // New: selection / modal
  const [selected, setSelected] = useState<Prisoner | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const facilitiesData = await prisonDataService.getFacilities();
        setFacilities(facilitiesData);
      } catch (error) {
        console.error('Failed to load facilities:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const loadPrisoners = async () => {
      try {
        // Swap to: const rows = await prisonDataService.getPrisoners();
        const rows = await getMockPrisoners();
        setPrisoners(rows);
      } catch (e) {
        console.error('Failed to load prisoners:', e);
      } finally {
        setLoadingPrisoners(false);
      }
    };
    loadPrisoners();
  }, []);

  const filteredPrisoners = useMemo(() => {
    const q = query.trim().toLowerCase();
    return prisoners.filter(p => {
      const matchesPrison = prisonFilter === 'all' || p.prisonId === prisonFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        p.kennitala.replace('-', '').includes(q.replace('-', '')) ||
        p.prisonerNumber.toLowerCase().includes(q);
      return matchesPrison && matchesStatus && matchesQuery;
    });
  }, [prisoners, prisonFilter, statusFilter, query]);

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 95) return 'bg-destructive';
    if (utilization >= 85) return 'bg-warning';
    return 'bg-success';
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'normal': return 'EÐLILEGT';
      case 'alert': return 'VIÐVÖRUN';
      case 'critical': return 'BRÝNT';
      default: return status.toUpperCase();
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline">Stjórnendayfirlit</h1>
        </div>
      </div>

      {/* System Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Heildarfjöldi fanga"
          value={directorStats.totalPrisoners.total}
          subtitle={`${directorStats.totalPrisoners.percentage}% nýting`}
          trend={directorStats.totalPrisoners.percentage > 90 ? 'up' : 'neutral'}
        />
        <StatCard
          title="Biðlisti"
          value={directorStats.waitlist.total}
          subtitle={`Meðalbiðtími: ${directorStats.waitlist.averageWait}`}
        />
        <StatCard
          title="Starfsmenn"
          value={`${directorStats.staff.onDuty}/${directorStats.staff.total}`}
          subtitle="á vakt / heildarfjöldi"
        />
        <StatCard
          title="Atvik í viku"
          value={directorStats.weeklyIncidents.total}
          subtitle="Stefna: Lækkandi"
          trend={directorStats.weeklyIncidents.trend}
        />
      </div>

      {/* Facility Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Yfirlit Fangelsa</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Hleður...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm leading-tight">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2 font-medium">Fangelsi</th>
                    <th className="text-left p-2 font-medium">Fangar</th>
                    <th className="text-left p-2 font-medium">Rými</th>
                    <th className="text-left p-2 font-medium">Nýting</th>
                    <th className="text-left p-2 font-medium">Starfsmenn</th>
                    <th className="text-left p-2 font-medium">Atvik í dag</th>
                    <th className="text-left p-2 font-medium">Vikuleg atvik</th>
                    <th className="text-left p-2 font-medium">Staða</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((facility) => {
                    const utilization = Math.round((facility.prisoners / facility.capacity) * 100);
                    return (
                      <tr key={facility.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium text-xs md:text-sm">
                          {facility.name}
                        </td>
                        <td className="p-2 text-xs md:text-sm">
                          {facility.prisoners}
                        </td>
                        <td className="p-2 text-xs md:text-sm">
                          {facility.capacity}
                        </td>
                        <td className="p-2">
                          <div className="flex items-center space-x-2">
                            <div className="w-20">
                              <Progress
                                value={utilization}
                                className="h-2"
                              />
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {utilization}%
                            </span>
                          </div>
                        </td>
                        <td className="p-2 text-xs md:text-sm">
                          {facility.staff}
                        </td>
                        <td className="p-2 text-xs md:text-sm">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            facility.todayIncidents === 0 ? 'bg-success text-success-foreground' :
                            facility.todayIncidents <= 2 ? 'bg-warning text-warning-foreground' :
                            'bg-destructive text-destructive-foreground'
                          }`}>
                            {facility.todayIncidents}
                          </span>
                        </td>
                        <td className="p-2 text-xs md:text-sm">
                          <span className={`inline-flex items-center justify-center w-8 h-6 rounded-full text-xs font-medium ${
                            facility.weeklyIncidents <= 5 ? 'bg-success text-success-foreground' :
                            facility.weeklyIncidents <= 10 ? 'bg-warning text-warning-foreground' :
                            'bg-destructive text-destructive-foreground'
                          }`}>
                            {facility.weeklyIncidents}
                          </span>
                        </td>
                        <td className="p-2">
                          <StatusBadge status={getStatusVariant(facility.status)} />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Additional Management Cards - Temporarily hidden */}
      {/*
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Dagleg samantekt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Innkomur í dag</span>
              <span className="font-medium">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Útskriftir í dag</span>
              <span className="font-medium">1</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Einangranir</span>
              <span className="font-medium">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Læknisvisitanir</span>
              <span className="font-medium">5</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Starfsmannavaktir</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Morgunvakt</span>
              <span className="font-medium">23/25</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Dagvakt</span>
              <span className="font-medium">28/30</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Kvöldvakt</span>
              <span className="font-medium">16/20</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Næturvakt</span>
              <span className="font-medium">12/15</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Kerfisstöðugleiki</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">API tengingar</span>
              <StatusBadge status="VIRKT" className="text-xs" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Öryggiskerfi</span>
              <StatusBadge status="VIRKT" className="text-xs" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Gagnasamstilling</span>
              <StatusBadge status="Í VINNSLU" className="text-xs" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Öryggisafrit</span>
              <StatusBadge status="LOKIÐ" className="text-xs" />
            </div>
          </CardContent>
        </Card>
      </div>
      */}

      {/* ----------------------- Prisoner Directory (NEW) ---------------------- */}
      <Card>
        <CardHeader>
          <CardTitle>Fangar – Yfirlit</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="w-full md:w-56">
              <label className="text-sm text-muted-foreground">Fangelsi</label>
              <Select value={prisonFilter} onValueChange={setPrisonFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Veldu fangelsi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Allt</SelectItem>
                  {facilities.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-56">
              <label className="text-sm text-muted-foreground">Staða</label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Veldu stöðu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Allt</SelectItem>
                  <SelectItem value="Gæsluvarðhald">Gæsluvarðhald</SelectItem>
                  <SelectItem value="Afplánun">Afplánun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Leit</label>
              <Input
                className="mt-1"
                placeholder="Leita að nafni, kennitölu eða fanganúmeri…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Button variant="outline" onClick={() => { setPrisonFilter('all'); setStatusFilter('all'); setQuery(''); }}>
              Endurstilla síur
            </Button>
          </div>

          {/* Table */}
          {loadingPrisoners ? (
            <div className="text-center py-8 text-muted-foreground">Hleður…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Nafn fanga</th>
                    <th className="text-left p-3 font-medium">Fanganúmer</th>
                    <th className="text-left p-3 font-medium">Kennitala</th>
                    <th className="text-left p-3 font-medium">Fangelsi</th>
                    <th className="text-left p-3 font-medium">Deild</th>
                    <th className="text-left p-3 font-medium">Klefi</th>
                    <th className="text-left p-3 font-medium">Lögmaður</th>
                    <th className="text-left p-3 font-medium">Staða</th>
                    <th className="text-left p-3 font-medium">Athugasemdir</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrisoners.map(p => (
                    <tr
                      key={p.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelected(p)}
                    >
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={p.photoUrl} alt={p.name} />
                            <AvatarFallback>{p.name.split(' ').map(s => s[0]).join('').slice(0,2)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-3 text-sm">{p.prisonerNumber}</td>
                      <td className="p-3 text-sm">{p.kennitala}</td>
                      <td className="p-3 text-sm">{p.prisonName}</td>
                      <td className="p-3 text-sm">{p.department}</td>
                      <td className="p-3 text-sm">{p.cell}</td>
                      <td className="p-3 text-sm">{p.lawyer}</td>
                      <td className="p-3 text-sm">
                        <Badge variant={p.status === 'Afplánun' ? 'default' : 'secondary'}>
                          {p.status}
                        </Badge>
                      </td>
                      <td className="p-3 text-sm">{p.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPrisoners.length === 0 && (
                <div className="text-sm text-muted-foreground py-4">Engar færslur fundust.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ----------------------------- Details Modal --------------------------- */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Yfirlit um fanga</DialogDescription>
              </DialogHeader>

              <div className="flex gap-6">
                <div className="shrink-0">
                  <Avatar className="h-24 w-24 rounded-xl">
                    <AvatarImage src={selected.photoUrl} alt={selected.name} />
                    <AvatarFallback className="text-xl">
                      {selected.name.split(' ').map(s => s[0]).join('').slice(0,2)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <ScrollArea className="h-[320px] w-full pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Info label="Fanganúmer" value={selected.prisonerNumber} />
                    <Info label="Kennitala" value={selected.kennitala} />
                    <Info label="Fangelsi" value={selected.prisonName} />
                    <Info label="Deild" value={selected.department} />
                    <Info label="Klefi" value={selected.cell} />
                    <Info label="Staða" value={selected.status} />
                    <Info label="Lögmaður" value={selected.lawyer} />
                    <Info label="Sími lögmanns" value={selected.lawyerPhone} />
                    <Info label="Athugasemdir" value={selected.notes ?? '—'} />
                    <Info label="Ofnæmi" value={selected.medical?.allergies ?? '—'} />
                    <Info label="Lyf" value={selected.medical?.meds ?? '—'} />
                    <Info label="Áhætta" value={selected.medical?.risks ?? '—'} />
                  </div>
                </ScrollArea>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Loka</Button>
                <Button>Opna málaskrá</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ Small helpers ----------------------------- */

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value ?? '—'}</div>
    </div>
  );
}