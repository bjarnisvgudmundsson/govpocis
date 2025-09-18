
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { 
  CheckCircle, 
  Briefcase,
  Files,
  FileText as FileTextIcon, // Renamed to avoid conflict with component
  AlertTriangle,
  Clock,
  Link as LinkIcon, // Renamed to avoid conflict
  Loader2
} from 'lucide-react';
import { getStoredCredentials } from '@/lib/api-client';
import { cn } from '@/lib/utils';

// Simulating moduleColors and priorityBackgrounds from prompt
const moduleColors = {
  dashboard: { border: 'border-l-blue-600', bg: 'bg-blue-50', icon: 'text-blue-600' },
  cases: { border: 'border-l-purple-600', bg: 'bg-purple-50', icon: 'text-purple-600' },
  contracts: { border: 'border-l-green-600', bg: 'bg-green-50', icon: 'text-green-600' },
  approvals: { border: 'border-l-orange-600', bg: 'bg-orange-50', icon: 'text-orange-600' },
  tasks: { border: 'border-l-red-600', bg: 'bg-red-50', icon: 'text-red-600' },
  documents: { border: 'border-l-indigo-600', bg: 'bg-indigo-50', icon: 'text-indigo-600' }
};

const priorityBackgrounds = {
  critical: 'bg-red-50', // VANSKIL
  high: 'bg-orange-50', // EINDAGI Í DAG
  medium: 'bg-yellow-50', // DRÖG / BÍÐUR SAMÞYKKIS (example)
  low: 'bg-gray-50' // VÆNTANLEGT
};


export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const hasCheckedRef = useRef(false);
  
  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;
    
    const { token } = getStoredCredentials();
    if (!token) {
      router.push('/');
      return;
    }
    // Simulate data fetching if needed
    setTimeout(() => setLoading(false), 500); // Simulate loading delay
  }, [router]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--nav-height,80px))]">
         <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Hleður mælaborði...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const kpiData = [
    {
      title: 'SAMÞYKKTIR',
      total: 15,
      overdue: 3,
      dueToday: 4,
      moduleStyle: moduleColors.approvals,
      icon: CheckCircle,
      href: '/approvals'
    },
    {
      title: 'VERK',
      total: 34,
      overdue: 7,
      dueToday: 9,
      moduleStyle: moduleColors.tasks,
      icon: Briefcase,
      href: '/tasks'
    },
    {
      title: 'SKJÖL Í VINNSLU',
      total: 12,
      overdue: 2,
      dueToday: 3,
      moduleStyle: moduleColors.documents,
      icon: Files,
      href: '/documents'
    },
    {
      title: 'MÁL',
      total: 22,
      overdue: 2,
      dueToday: 5,
      moduleStyle: moduleColors.cases,
      icon: FileTextIcon,
      href: '/mycases'
    },
    {
      title: 'SAMNINGAR',
      total: 10,
      overdue: 1,
      dueToday: 2,
      moduleStyle: moduleColors.contracts,
      icon: FileTextIcon, // Using FileTextIcon for contracts as well
      href: '/contracts'
    }
  ];
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline text-gray-900">MÆLABORÐ</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {kpiData.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card 
              key={kpi.title} 
              className={cn(
                'border-l-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer', 
                kpi.moduleStyle.border, 
                kpi.moduleStyle.bg
              )}
              onClick={() => router.push(kpi.href)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 uppercase">{kpi.title}</p>
                    <p className="text-3xl font-bold mt-1">{kpi.total}</p>
                    {kpi.overdue > 0 && <p className="text-xs text-red-600 font-medium mt-1">{kpi.overdue} Í VANSKILUM</p>}
                  </div>
                  <Icon className={cn('w-10 h-10 opacity-20', kpi.moduleStyle.icon)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg font-headline">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              ÁRÍÐANDI - KREFST AÐGERÐA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 max-h-[400px] overflow-y-auto">
            {/* Critical Item 1 */}
            <div className={cn("p-4 rounded-lg border", priorityBackgrounds.critical, moduleColors.approvals.border.replace('-l-','-'))}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <StatusBadge status="VANSKIL" />
                  <p className="font-medium mt-3">Öryggisbúnaður: Litla Hraun</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                    <span className="font-medium">450.000 kr</span>
                    <span>•</span>
                    <span>Öryggisdeild</span>
                    <span>•</span>
                    <span>Eindagi: 27.05.2025</span>
                  </div>
                  <a href="#" className="text-sm text-purple-600 hover:underline mt-2 inline-flex items-center">
                    <LinkIcon className="w-3 h-3 mr-1" />
                    Öryggismyndavélakerfi uppfærsla
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">SKOÐA</Button>
                  <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800">
                    SAMÞYKKJA
                  </Button>
                </div>
              </div>
            </div>

            {/* Critical Item 2 */}
            <div className={cn("p-4 rounded-lg border", priorityBackgrounds.high, moduleColors.approvals.border.replace('-l-','-'))}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <StatusBadge status="EINDAGI Í DAG" />
                  <p className="font-medium mt-3">Fangaflutningar: Þyrluþjónusta</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                    <span className="font-medium">3.200.000 kr</span>
                    <span>•</span>
                    <span>Flutningsdeild</span>
                    <span>•</span>
                    <span>Eindagi: 28.05.2025</span>
                  </div>
                  <div className="mt-3">
                    <Badge variant="secondary" className="bg-gray-900 text-white text-xs">
                      Landhelgisgæslan - þjónustusamningur
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">SKOÐA</Button>
                  <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800">
                    SAMÞYKKJA
                  </Button>
                </div>
              </div>
            </div>

            {/* Critical Item 3 */}
            <div className={cn("p-4 rounded-lg border", priorityBackgrounds.critical, moduleColors.tasks.border.replace('-l-','-'))}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <StatusBadge status="VANSKIL" />
                  <p className="font-medium mt-3">Öryggisúttekt: Hólmsheiði</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                    <span>3 dagar</span>
                    <span>•</span>
                    <span>Guðmundur Þórsson</span>
                    <span>•</span>
                    <span>Eindagi: 26.05.2025</span>
                  </div>
                  <div className="mt-3">
                    <Badge variant="secondary" className="bg-gray-900 text-white text-xs">
                      Mánaðarleg öryggisúttekt
                    </Badge>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">SKOÐA</Button>
                  <Button size="sm" variant="outline">OPNA</Button>
                </div>
              </div>
            </div>

            {/* Critical Item 4 */}
            <div className={cn("p-4 rounded-lg border", priorityBackgrounds.high, moduleColors.documents.border.replace('-l-','-'))}>
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  <StatusBadge status="EINDAGI Í DAG" />
                  <p className="font-medium mt-3">Endurhæfingaráætlun 2025</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                    <span>5 dagar</span>
                    <span>•</span>
                    <span>Sigríður Haraldsdóttir</span>
                    <span>•</span>
                    <span>Eindagi: 28.05.2025</span>
                  </div>
                  <a href="#" className="text-sm text-purple-600 hover:underline mt-3 inline-flex items-center">
                    <LinkIcon className="w-3 h-3 mr-1" />
                    Ársáætlun endurhæfingardeildar
                  </a>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">SKOÐA</Button>
                  <Button size="sm" variant="outline">OPNA</Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg font-headline">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              VÆNTANLEGT - NÆSTU 7 DAGAR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-y-auto">
             {/* Example Upcoming Item 1 */}
            <div className="p-3 hover:bg-gray-50 rounded-lg transition-colors border">
              <div className="flex items-start justify-between">
                <div>
                  <StatusBadge status="VÆNTANLEGT" />
                  <p className="font-medium mt-2">Ráðning: Fangavörður - Litla-Hraun</p>
                  <p className="text-sm text-gray-600 mt-1">Eindagi: 29.05.2025</p>
                </div>
                <Button size="sm" variant="link" className="text-sm font-medium text-primary">SKOÐA</Button>
              </div>
            </div>
            {/* Example Upcoming Item 2 */}
            <div className="p-3 hover:bg-gray-50 rounded-lg transition-colors border">
              <div className="flex items-start justify-between">
                <div>
                  <StatusBadge status="Í VINNSLU" />
                  <p className="font-medium mt-2">Öryggisleiðbeiningar uppfærsla</p>
                  <p className="text-sm text-gray-600 mt-1">Eindagi: 30.05.2025</p>
                </div>
                <Button size="sm" variant="link" className="text-sm font-medium text-primary">OPNA</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    