'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatCard } from '@/components/prison/stat-card';
import { prisonDataService, type Facility } from '@/lib/prison-data';

export default function StjoriPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  const directorStats = prisonDataService.getDirectorStats();

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
          <p className="text-muted-foreground">Allir Staðir - {new Date().toLocaleDateString('is-IS')}</p>
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
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-medium">Fangelsi</th>
                    <th className="text-left p-3 font-medium">Fangar</th>
                    <th className="text-left p-3 font-medium">Rými</th>
                    <th className="text-left p-3 font-medium">Nýting</th>
                    <th className="text-left p-3 font-medium">Starfsmenn</th>
                    <th className="text-left p-3 font-medium">Atvik í dag</th>
                    <th className="text-left p-3 font-medium">Vikuleg atvik</th>
                    <th className="text-left p-3 font-medium">Staða</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((facility) => {
                    const utilization = Math.round((facility.prisoners / facility.capacity) * 100);
                    return (
                      <tr key={facility.id} className="border-b hover:bg-muted/50">
                        <td className="p-3 font-medium">
                          {facility.name}
                        </td>
                        <td className="p-3 text-sm">
                          {facility.prisoners}
                        </td>
                        <td className="p-3 text-sm">
                          {facility.capacity}
                        </td>
                        <td className="p-3">
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
                        <td className="p-3 text-sm">
                          {facility.staff}
                        </td>
                        <td className="p-3 text-sm">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            facility.todayIncidents === 0 ? 'bg-success text-success-foreground' :
                            facility.todayIncidents <= 2 ? 'bg-warning text-warning-foreground' :
                            'bg-destructive text-destructive-foreground'
                          }`}>
                            {facility.todayIncidents}
                          </span>
                        </td>
                        <td className="p-3 text-sm">
                          <span className={`inline-flex items-center justify-center w-8 h-6 rounded-full text-xs font-medium ${
                            facility.weeklyIncidents <= 5 ? 'bg-success text-success-foreground' :
                            facility.weeklyIncidents <= 10 ? 'bg-warning text-warning-foreground' :
                            'bg-destructive text-destructive-foreground'
                          }`}>
                            {facility.weeklyIncidents}
                          </span>
                        </td>
                        <td className="p-3">
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

      {/* Additional Management Cards */}
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
    </div>
  );
}