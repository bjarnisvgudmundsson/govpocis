// Mock data services for prison portals

export interface Prisoner {
  id: string;
  name: string;
  kennitala: string;
  ward: string;
  status: 'normal' | 'isolation' | 'medical';
  cell: string;
}

export interface Incident {
  id: string;
  timestamp: Date;
  type: string;
  prisoners: string[];
  description: string;
  reporter: string;
  status: 'pending' | 'processing' | 'completed';
  severity: 'low' | 'medium' | 'high';
}

export interface PrisonAction {
  id: string;
  timestamp: Date;
  type: 'search' | 'confiscation' | 'separation' | 'restriction';
  details: any;
  authorizedBy: string;
  status: string;
  prisoner?: string;
  progress: number;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  type: string;
  prisoner?: string;
  description: string;
  reporter: string;
  status: string;
  progress: number;
}

export interface Facility {
  id: string;
  name: string;
  prisoners: number;
  capacity: number;
  staff: number;
  todayIncidents: number;
  weeklyIncidents: number;
  status: 'normal' | 'alert' | 'critical';
}

// Mock data
const mockPrisoners: Prisoner[] = [
  // A-álma
  { id: '1', name: 'Bjartur í Sumarhúsum', kennitala: '1234567890', ward: 'A-álma', status: 'normal', cell: 'A01' },
  { id: '2', name: 'Pétur Pétursson', kennitala: '2345678901', ward: 'A-álma', status: 'normal', cell: 'A02' },
  { id: '3', name: 'Gunnar Guðmundsson', kennitala: '3456789012', ward: 'A-álma', status: 'normal', cell: 'A03' },
  { id: '4', name: 'Ásta Sóllilja Bjartsdóttir', kennitala: '4567890123', ward: 'A-álma', status: 'normal', cell: 'A04' },
  { id: '5', name: 'Helgi Bjartsson', kennitala: '7890123456', ward: 'A-álma', status: 'normal', cell: 'A05' },

  // B-álma
  { id: '6', name: 'Sigurður Sigurðsson', kennitala: '5678901234', ward: 'B-álma', status: 'normal', cell: 'B01' },
  { id: '7', name: 'Kristján Kristjánsson', kennitala: '6789012345', ward: 'B-álma', status: 'normal', cell: 'B02' },
  { id: '8', name: 'María Ósk Marinósdóttir', kennitala: '7890123456', ward: 'B-álma', status: 'normal', cell: 'B03' },
  { id: '9', name: 'Steingrímur Steingrímsson', kennitala: '8901234567', ward: 'B-álma', status: 'normal', cell: 'B04' },
  { id: '10', name: 'Hallbera Bjartsdóttir', kennitala: '9012345678', ward: 'B-álma', status: 'medical', cell: 'B05' },

  // C-álma
  { id: '11', name: 'Einar Einarsson', kennitala: '0123456789', ward: 'C-álma', status: 'normal', cell: 'C01' },
  { id: '12', name: 'Haukur Hauksson', kennitala: '1234567891', ward: 'C-álma', status: 'normal', cell: 'C02' },
  { id: '13', name: 'Ívar Ívarsson', kennitala: '2345678902', ward: 'C-álma', status: 'normal', cell: 'C03' },
  { id: '14', name: 'Finnur Bjartsson', kennitala: '3456789013', ward: 'C-álma', status: 'medical', cell: 'C04' },

  // Einangrun
  { id: '15', name: 'Rósa Bjartsdóttir', kennitala: '4567890124', ward: 'Einangrun', status: 'isolation', cell: 'E01' },
  { id: '16', name: 'Nonni Bjartsson', kennitala: '5678901235', ward: 'Einangrun', status: 'isolation', cell: 'E02' },

  // Gæsluvarðhald
  { id: '17', name: 'Ólafur Ólafsson', kennitala: '6789012346', ward: 'Gæsluvarðhald', status: 'isolation', cell: 'G01' },
  { id: '18', name: 'Ragnar Ragnarsson', kennitala: '7890123457', ward: 'Gæsluvarðhald', status: 'isolation', cell: 'G02' },
];

const mockIncidents: Incident[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'Slagsmál',
    prisoners: ['1', '2'],
    description: 'Rifrildi í matsal milli Bjartur í Sumarhúsum og Rósa Bjartsdóttir',
    reporter: 'Ólafur Kárason Ljósvíkingur',
    status: 'processing',
    severity: 'medium'
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    type: 'Vörubrögð',
    prisoners: ['3'],
    description: 'Fannst bannað efni í klefa hjá Finnur Bjartsson',
    reporter: 'Guðný Ólafsdóttir',
    status: 'completed',
    severity: 'high'
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
    type: 'Leit',
    prisoners: ['4'],
    description: 'Hefðbundin leit í klefa hjá Ásta Sóllilja Bjartsdóttir',
    reporter: 'Magnús á Ljósvík',
    status: 'completed',
    severity: 'low'
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
    type: 'Afplánunarfangi',
    prisoners: ['6'],
    description: 'Nonni Bjartsson fluttur í einangrun vegna hegðunar',
    reporter: 'Jón Hreggviðsson',
    status: 'completed',
    severity: 'medium'
  }
];

const mockActions: PrisonAction[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
    type: 'search',
    details: { area: 'A-deild', type: 'Hefðbundin leit', results: 'Ekkert fannst' },
    authorizedBy: 'Ólafur Kárason Ljósvíkingur',
    status: 'Lokið',
    prisoner: 'Bjartur í Sumarhúsum',
    progress: 100
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
    type: 'confiscation',
    details: { item: 'Farsími', reason: 'Óleyfilegt', storage: 'Vörslukassi #12' },
    authorizedBy: 'Guðný Ólafsdóttir',
    status: 'Í vinnslu',
    prisoner: 'Rósa Bjartsdóttir',
    progress: 75
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    type: 'separation',
    details: { reason: 'Öryggisráðstöfun', duration: '24 klst', area: 'Einangradi' },
    authorizedBy: 'Magnús á Ljósvík',
    status: 'Í vinnslu',
    prisoner: 'Nonni Bjartsson',
    progress: 80
  }
];

const mockLogEntries: LogEntry[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    type: 'Atvik',
    prisoner: 'Jón Jónsson',
    description: 'Hefðbundin leit A-deildar',
    reporter: 'Gunnar Guðmundsson',
    status: 'Lokið',
    progress: 100
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    type: 'Aðgerð',
    prisoner: 'María Ósk',
    description: 'Heimsókn samþykkt',
    reporter: 'Sigrid Sigurdardottir',
    status: 'Í vinnslu',
    progress: 60
  }
];

const mockFacilities: Facility[] = [
  {
    id: '1',
    name: 'Hólmsheiði',
    prisoners: 124,
    capacity: 150,
    staff: 45,
    todayIncidents: 3,
    weeklyIncidents: 12,
    status: 'normal'
  },
  {
    id: '2',
    name: 'Kvíabryggja',
    prisoners: 89,
    capacity: 95,
    staff: 32,
    todayIncidents: 1,
    weeklyIncidents: 8,
    status: 'alert'
  },
  {
    id: '3',
    name: 'Sogn',
    prisoners: 67,
    capacity: 80,
    staff: 24,
    todayIncidents: 0,
    weeklyIncidents: 4,
    status: 'normal'
  },
  {
    id: '4',
    name: 'Litla Hraun',
    prisoners: 45,
    capacity: 60,
    staff: 18,
    todayIncidents: 1,
    weeklyIncidents: 6,
    status: 'normal'
  }
];

// Service functions
export const prisonDataService = {
  getPrisoners: (): Promise<Prisoner[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockPrisoners), 500);
    });
  },

  getIncidents: (): Promise<Incident[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockIncidents), 500);
    });
  },

  getActions: (): Promise<PrisonAction[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockActions), 500);
    });
  },

  getLogEntries: (): Promise<LogEntry[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockLogEntries), 500);
    });
  },

  getFacilities: (): Promise<Facility[]> => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockFacilities), 500);
    });
  },

  // Stats for guard dashboard
  getGuardStats: () => {
    return {
      prisonersOnDuty: { total: 124, isolation: 8 },
      todayIncidents: { total: 3, severity: 'medium' as const },
      actions: { total: 7, breakdown: 'Leit: 3, Haldlagning: 2, Aðskilnaður: 1, Samskipti: 1' },
      visits: { total: 12, nextScheduled: '14:30' }
    };
  },

  // Stats for director dashboard
  getDirectorStats: () => {
    return {
      totalPrisoners: { total: 280, capacity: 325, percentage: 86 },
      waitlist: { total: 15, averageWait: '8 dagar' },
      staff: { total: 101, onDuty: 67 },
      weeklyIncidents: { total: 24, trend: 'down' as const }
    };
  },

  // Get prisoner by cell
  getPrisonerByCell: (cellId: string): Prisoner | undefined => {
    return mockPrisoners.find(p => p.cell === cellId);
  },

  // Get prisoner initials
  getPrisonerInitials: (name: string): string => {
    return name.split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  },

  // Get recent log entries for prisoner (last 24h)
  getPrisonerRecentLogs: (prisonerId: string): LogEntry[] => {
    const prisoner = mockPrisoners.find(p => p.id === prisonerId);
    if (!prisoner) return [];

    // Generate mock recent logs
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    return [
      {
        id: `log-${prisonerId}-1`,
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        type: 'Heimsókn',
        prisoner: prisoner.name,
        description: 'Heimsókn frá fjölskyldu - 30 mín',
        reporter: 'Guðrún Jónsdóttir',
        status: 'Lokið',
        progress: 100
      },
      {
        id: `log-${prisonerId}-2`,
        timestamp: new Date(now.getTime() - 6 * 60 * 60 * 1000),
        type: 'Morgunmatur',
        prisoner: prisoner.name,
        description: 'Mætti í matsölum á réttum tíma',
        reporter: 'Ólafur Kárason',
        status: 'Lokið',
        progress: 100
      },
      {
        id: `log-${prisonerId}-3`,
        timestamp: new Date(now.getTime() - 12 * 60 * 60 * 1000),
        type: 'Klefaskoðun',
        prisoner: prisoner.name,
        description: 'Hefðbundin klefaskoðun - allt í lagi',
        reporter: 'Magnús Magnússon',
        status: 'Lokið',
        progress: 100
      }
    ];
  }
};