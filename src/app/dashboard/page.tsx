'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { KpiTileSegmented } from '@/components/dashboard/KpiTileSegmented';
import { ItemDetailsDialog } from '@/components/dashboard/ItemDetailsDialog';
import { ItemEditDialog } from '@/components/dashboard/ItemEditDialog';
import {
  AlertTriangle,
  Clock,
  Loader2,
  Eye,
  Edit
} from 'lucide-react';
import { getStoredCredentials } from '@/lib/api-client';

// Custom dashboard status badge component with exact specification colors
function DashboardStatusBadge({ status }: { status: string }) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'VIRKUR':
        return { backgroundColor: '#28A745', color: 'white' }; // Green
      case 'ENDURSKOÐUN':
        return { backgroundColor: '#FFC107', color: 'white' }; // Yellow
      case 'ENDURNÝJUN':
        return { backgroundColor: '#007BFF', color: 'white' }; // Blue
      case 'Í VANSKILUM':
      case 'VANSKIL':
        return { backgroundColor: '#E03131', color: 'white' }; // Red
      case 'Í VINNSLU':
        return { backgroundColor: '#007BFF', color: 'white' }; // Blue
      case 'VÆNTANLEGT':
        return { backgroundColor: '#6B7280', color: 'white' }; // Grey
      case 'EINDAGI Í DAG':
        return { backgroundColor: '#FF9800', color: 'white' }; // Orange/Amber
      default:
        return { backgroundColor: '#6B7280', color: 'white' }; // Default grey
    }
  };

  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium tracking-wide uppercase"
      style={getStatusStyle(status)}
    >
      {status}
    </span>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading] = useState(false); // Set to false by default
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    if (hasCheckedRef.current) return;
    hasCheckedRef.current = true;

    const { token } = getStoredCredentials();
    if (!token) {
      router.push('/');
      return;
    }
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
      ok: 12,
      warning: 6,
      overdue: 2,
      trend: { value: 12.5, direction: "up" as const },
      href: '/approvals'
    },
    {
      title: 'VERK',
      ok: 18,
      warning: 12,
      overdue: 8,
      trend: { value: 3.2, direction: "down" as const },
      href: '/tasks'
    },
    {
      title: 'SKJÖL Í VINNSLU',
      ok: 25,
      warning: 4,
      overdue: 1,
      trend: { value: 5.0, direction: "up" as const },
      href: '/documents'
    },
    {
      title: 'MÁL',
      ok: 8,
      warning: 9,
      overdue: 7,
      trend: { value: 0.0, direction: "flat" as const },
      href: '/mycases'
    },
    {
      title: 'SAMNINGAR',
      ok: 15,
      warning: 2,
      overdue: 3,
      trend: { value: 8.0, direction: "up" as const },
      href: '/contracts'
    }
  ];

  // Mock data for critical items
  const criticalItems = [
    {
      id: 1,
      type: 'approval' as const,
      title: 'Öryggisbúnaður: Litla Hraun',
      status: 'VANSKIL',
      amount: '450.000 kr',
      department: 'Öryggisdeild',
      deadline: '27.05.2025',
      description: 'Samþykkt þarf fyrir kaup á öryggismyndavélakerfi fyrir Litla Hraun fangelsið.',
      category: 'Öryggismyndavélakerfi uppfærsla'
    },
    {
      id: 2,
      type: 'contract' as const,
      title: 'Fangaflutningar: Þyrluþjónusta',
      status: 'EINDAGI Í DAG',
      amount: '3.200.000 kr',
      vendor: 'Landhelgisgæslan',
      department: 'Flutningsdeild',
      deadline: '28.05.2025',
      description: 'Þjónustusamningur við Landhelgisgæsluna fyrir fangaflutning með þyrlu.',
      category: 'Landhelgisgæslan - þjónustusamningur'
    },
    {
      id: 3,
      type: 'task' as const,
      title: 'Öryggisúttekt: Hólmsheiði',
      status: 'VANSKIL',
      assignee: 'Guðmundur Þórsson',
      department: 'Öryggisdeild',
      deadline: '26.05.2025',
      description: 'Mánaðarleg öryggisúttekt sem á að fara fram í Hólmsheiði fangelsi.',
      category: 'Mánaðarleg öryggisúttekt'
    },
    {
      id: 4,
      type: 'document' as const,
      title: 'Endurhæfingaráætlun 2025',
      status: 'EINDAGI Í DAG',
      assignee: 'Sigríður Haraldsdóttir',
      department: 'Endurhæfingardeild',
      deadline: '28.05.2025',
      description: 'Ársáætlun endurhæfingardeildar sem þarf að klára fyrir árið 2025.',
      category: 'Ársáætlun endurhæfingardeildar'
    }
  ];

  // Mock data for upcoming items
  const upcomingItems = [
    {
      id: 5,
      type: 'task' as const,
      title: 'Ráðning: Fangavörður - Litla-Hraun',
      status: 'VÆNTANLEGT',
      department: 'Mannauðsdeild',
      deadline: '29.05.2025',
      description: 'Ráðningarferli fyrir nýjan fangavörð í Litla Hraun.',
      assignee: 'Mannauðsdeild'
    },
    {
      id: 6,
      type: 'document' as const,
      title: 'Öryggisleiðbeiningar uppfærsla',
      status: 'Í VINNSLU',
      department: 'Öryggisdeild',
      deadline: '30.05.2025',
      description: 'Uppfærsla á öryggisleiðbeiningum fyrir allt starfsfólk.',
      assignee: 'Öryggisdeild'
    },
    {
      id: 7,
      type: 'contract' as const,
      title: 'Samningur við heilsugæslu',
      status: 'VÆNTANLEGT',
      vendor: 'Heilsugæsla höfuðborgarsvæðisins',
      department: 'Heilbrigðisdeild',
      deadline: '02.06.2025',
      description: 'Endurnýjun á samningi við heilsugæslu fyrir heilbrigðisþjónustu fanga.',
      amount: 'kr. 850.000'
    },
    {
      id: 8,
      type: 'task' as const,
      title: 'Árlegt öryggismat - Hólmsheiði',
      status: 'Í VINNSLU',
      department: 'Öryggisdeild',
      deadline: '05.06.2025',
      description: 'Árlegt öryggismat sem þarf að fara fram í Hólmsheiði fangelsi.',
      assignee: 'Öryggisdeild'
    }
  ];

  const handleItemView = (item: any) => {
    setSelectedItem(item);
    setDialogOpen(true);
  };

  const handleItemEdit = (item: any) => {
    setSelectedItem(item);
    setEditDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline text-gray-900">MÆLABORÐ</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        {kpiData.map((kpi) => (
          <KpiTileSegmented
            key={kpi.title}
            title={kpi.title}
            ok={kpi.ok}
            warning={kpi.warning}
            overdue={kpi.overdue}
            trend={kpi.trend}
            href={kpi.href}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm min-h-[44rem]">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg font-headline">
              <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
              ÁRÍÐANDI - KREFST AÐGERÐA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 h-full overflow-y-auto">
            {criticalItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <DashboardStatusBadge status={item.status} />
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mt-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                      {item.amount && <span className="font-medium">{item.amount}</span>}
                      {item.amount && <span>•</span>}
                      <span>{item.department}</span>
                      <span>•</span>
                      <span>Eindagi: {item.deadline}</span>
                    </div>
                    {item.category && (
                      <div className="mt-3">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 text-xs border border-slate-200">
                          {item.category}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleItemView(item)}>
                      <Eye className="w-4 h-4 mr-1" />
                      SKOÐA
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleItemEdit(item)}>
                      <Edit className="w-4 h-4 mr-1" />
                      BREYTA
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center text-lg font-headline">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              VÆNTANLEGT - NÆSTU 7 DAGAR
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4">
                <DashboardStatusBadge status={item.status} />
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mt-3">
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-gray-600">
                      {item.amount && <span className="font-medium">{item.amount}</span>}
                      {item.amount && <span>•</span>}
                      <span>{item.department}</span>
                      <span>•</span>
                      <span>Eindagi: {item.deadline}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleItemView(item)}>
                      <Eye className="w-4 h-4 mr-1" />
                      SKOÐA
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleItemEdit(item)}>
                      <Edit className="w-4 h-4 mr-1" />
                      BREYTA
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {selectedItem && (
        <>
          <ItemDetailsDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            item={selectedItem}
          />
          <ItemEditDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            item={selectedItem}
          />
        </>
      )}
    </div>
  );
}
