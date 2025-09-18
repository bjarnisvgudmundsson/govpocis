'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { FileText, Download, Eye, Clock } from 'lucide-react';

const documents = [
  {
    id: 1,
    title: 'Öryggisleiðbeiningar 2025',
    type: 'Leiðbeiningar',
    department: 'Öryggisdeild',
    lastModified: '25.05.2025',
    status: 'Í VINNSLU',
    size: '2.4 MB'
  },
  {
    id: 2,
    title: 'Ársskýrsla Fangelsismálastofnunar 2024',
    type: 'Skýrsla',
    department: 'Stjórnsýsla',
    lastModified: '15.03.2025',
    status: 'LOKIÐ',
    size: '8.7 MB'
  },
  {
    id: 3,
    title: 'Endurhæfingaráætlun Q3 2025',
    type: 'Áætlun',
    department: 'Endurhæfingardeild',
    lastModified: '20.05.2025',
    status: 'Í ENDURSKOÐUN',
    size: '1.1 MB'
  },
  {
    id: 4,
    title: 'Neyðaráætlun - Litla-Hraun',
    type: 'Verkferlar',
    department: 'Öryggisdeild',
    lastModified: '10.05.2025',
    status: 'SAMÞYKKT',
    size: '3.5 MB'
  },
  {
    id: 5,
    title: 'Mannauðsstefna 2025-2027',
    type: 'Stefnuskjal',
    department: 'Mannauðsdeild',
    lastModified: '28.04.2025',
    status: 'DRÖG',
    size: '890 KB'
  },
  {
    id: 6,
    title: 'Heilbrigðisþjónusta fanga - Verkferlar',
    type: 'Verkferlar',
    department: 'Heilbrigðisdeild',
    lastModified: '22.05.2025',
    status: 'Í VINNSLU',
    size: '1.8 MB'
  }
];

export default function DocumentsPage() {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold font-headline text-gray-900">SKJÖL</h1>
        <p className="text-muted-foreground mt-2">12 skjöl í vinnslu</p>
      </div>

      <div className="grid gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <h3 className="font-medium text-lg">{doc.title}</h3>
                    <StatusBadge status={doc.status} />
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Badge variant="outline">{doc.type}</Badge>
                    <span>{doc.department}</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {doc.lastModified}
                    </span>
                    <span>{doc.size}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Eye className="w-4 h-4 mr-1" />
                    SKOÐA
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    SÆKJA
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}