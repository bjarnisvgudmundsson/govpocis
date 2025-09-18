
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, FileText, Download, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { getStoredCredentials } from '@/lib/api-client';
import { useToast } from "@/hooks/use-toast";

interface HandbookItem {
  id: string;
  title: string;
  category: string;
  lastUpdated: string;
  version: string;
  url?: string; // Link to the handbook PDF or document
}

// Mock data, replace with API call
const mockHandbooks: HandbookItem[] = [
  {
    id: 'HB001',
    title: 'Starfsmannahandbók Landspítalans',
    category: 'Mannauðsmál',
    lastUpdated: '01.04.2025',
    version: '4.2',
    url: '#'
  },
  {
    id: 'HB002',
    title: 'Leiðbeiningar um sýkingavarnir',
    category: 'Sýkingavarnir',
    lastUpdated: '15.02.2025',
    version: '2.0',
    url: '#'
  },
  {
    id: 'HB003',
    title: 'Handbók um gæðastjórnunarkerfi',
    category: 'Gæðamál',
    lastUpdated: '10.01.2025',
    version: '1.5',
    url: '#'
  },
  {
    id: 'HB004',
    title: 'Viðbragðsáætlun vegna almannavarna',
    category: 'Öryggismál',
    lastUpdated: '20.05.2024',
    version: '3.1',
    url: '#'
  },
];

export default function HandbooksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [handbooks, setHandbooks] = useState<HandbookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const credentials = getStoredCredentials();
    if (!credentials.token) {
      router.push('/');
      return;
    }
    setTimeout(() => {
      setHandbooks(mockHandbooks);
      setLoading(false);
    }, 1000);
  }, [router]);

  const filteredHandbooks = handbooks.filter(hb => 
    hb.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hb.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--nav-height,80px))]">
         <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Hleður handbókum...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold font-headline text-gray-900 uppercase">Handbækur og leiðbeiningar</h1>
      </div>

      <Card className="mb-6 shadow-lg">
        <CardContent className="p-4">
          <div className="relative">
            <Input 
              placeholder="Leita í handbókum..." 
              className="pl-10 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
      
      {filteredHandbooks.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Engar handbækur fundust.</p>
            <p className="text-sm text-muted-foreground">Engar handbækur passa við leitarskilyrðin eða engar handbækur eru til.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHandbooks.map((handbook) => (
            <Card key={handbook.id} className="shadow-lg hover:shadow-xl transition-shadow flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <FileText className="h-8 w-8 text-primary mb-2 opacity-70" />
                   {handbook.url && (
                    <Button variant="ghost" size="sm" asChild>
                      <a href={handbook.url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4 mr-2" /> Sækja
                      </a>
                    </Button>
                  )}
                </div>
                <CardTitle className="text-lg font-semibold">{handbook.title}</CardTitle>
                <CardDescription className="text-xs">Flokkur: {handbook.category}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                {/* Additional details can be added here if needed */}
              </CardContent>
              <CardContent className="border-t pt-3 mt-auto">
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>Útgáfa: {handbook.version}</span>
                  <span>Síðast uppfært: {handbook.lastUpdated}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
