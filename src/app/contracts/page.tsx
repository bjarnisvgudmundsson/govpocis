'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Calendar, Building, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';

// Color themes for different contract statuses
const statusColors = {
  'VIRKUR': { border: 'border-l-green-600', bg: 'bg-green-50' },
  'ENDURNÝJUN': { border: 'border-l-orange-600', bg: 'bg-orange-50' },
  'Í ENDURSKOÐUN': { border: 'border-l-yellow-600', bg: 'bg-yellow-50' },
  'ÚTRUNNINN': { border: 'border-l-red-600', bg: 'bg-red-50' }
};

const contracts = [
  {
    id: 1,
    title: 'Landhelgisgæslan - Fangaflutningar',
    vendor: 'Landhelgisgæslan',
    value: 'kr. 45.000.000',
    endDate: '31.12.2025',
    status: 'VIRKUR',
    type: 'Þjónustusamningur',
    department: 'Flutningsdeild',
    contractUrl: 'https://demo.gopro.net/demo-is/gopro/site/caseworker/#!/form/?id=513a4d43-d335-4b1f-a302-e286c4c4ac06&docType=10022&system=views'
  },
  {
    id: 2,
    title: 'Matvælabirgðir - Ölgerðin Egill Skallagrímsson',
    vendor: 'Ölgerðin Egill Skallagrímsson',
    value: 'kr. 18.500.000',
    endDate: '30.06.2025',
    status: 'ENDURNÝJUN',
    type: 'Vörusamningur',
    department: 'Eldhús',
    contractUrl: 'https://demo.gopro.net/demo-is/gopro/site/caseworker/#!/form/?id=513a4d43-d335-4b1f-a302-e286c4c4ac06&docType=10022&system=views'
  },
  {
    id: 3,
    title: 'Heilbrigðisþjónusta - Heilsugæsla höfuðborgarsvæðisins',
    vendor: 'Heilsugæsla höfuðborgarsvæðisins',
    value: 'kr. 62.000.000',
    endDate: '31.12.2026',
    status: 'VIRKUR',
    type: 'Þjónustusamningur',
    department: 'Heilbrigðisdeild',
    contractUrl: 'https://demo.gopro.net/demo-is/gopro/site/caseworker/#!/form/?id=513a4d43-d335-4b1f-a302-e286c4c4ac06&docType=10022&system=views'
  },
  {
    id: 4,
    title: 'Öryggismyndavélakerfi - Securitas',
    vendor: 'Securitas',
    value: 'kr. 24.000.000',
    endDate: '30.09.2025',
    status: 'Í ENDURSKOÐUN',
    type: 'Þjónustu- og viðhaldssamningur',
    department: 'Öryggisdeild',
    contractUrl: 'https://demo.gopro.net/demo-is/gopro/site/caseworker/#!/form/?id=513a4d43-d335-4b1f-a302-e286c4c4ac06&docType=10022&system=views'
  },
  {
    id: 5,
    title: 'Samningur við Öryggismiðstöðina',
    vendor: 'Örryggismiðstöðin',
    value: 'kr. 3.400.000',
    endDate: '31.01.2026',
    status: 'VIRKUR',
    type: 'Þjónustusamningur',
    department: 'Rekstur og upplýsingatækni',
    contractUrl: 'https://demo.gopro.net/demo-is/gopro/site/caseworker/#!/form/?id=513a4d43-d335-4b1f-a302-e286c4c4ac06&docType=10022&system=views'
  }
];

export default function ContractsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline text-gray-900">SAMNINGAR</h1>
        <p className="text-muted-foreground mt-2">10 virkir samningar</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {contracts.map((contract) => {
          const colorTheme = statusColors[contract.status as keyof typeof statusColors] || statusColors.VIRKUR;
          return (
            <Card key={contract.id} className={cn(
              "hover:shadow-lg transition-shadow border-l-4",
              colorTheme.border,
              colorTheme.bg
            )}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg leading-tight">{contract.title}</CardTitle>
                  <div className="ml-2 flex-shrink-0">
                    <StatusBadge status={contract.status} />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>{contract.vendor}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="font-medium">{contract.value}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Gildir til: {contract.endDate}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{contract.type}</Badge>
                  <Badge variant="secondary">{contract.department}</Badge>
                </div>
                <div className="pt-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => window.open(contract.contractUrl, '_blank')}
                  >
                    SKOÐA SAMNING
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}