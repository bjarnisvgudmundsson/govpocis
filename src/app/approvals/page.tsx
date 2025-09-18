
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Link as LinkIcon, FilePlus2, Loader2, AlertTriangle, CheckSquare } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { getStoredCredentials } from '@/lib/api-client';
import { useToast } from "@/hooks/use-toast";

interface ApprovalItem {
  id: string;
  title: string;
  type: string;
  amount: string;
  applicant: string; // Deild
  deadline: string;
  status: 'VANSKIL' | 'EINDAGI Í DAG' | 'VÆNTANLEGT' | 'BÍÐUR SAMÞYKKIS' | 'SAMÞYKKT' | 'HAFNAÐ';
  linked?: string;
}

// Mock data, replace with API call
const mockApprovals: ApprovalItem[] = [
  {
    id: '202502-0041',
    title: 'Öryggisbúnaður: Litla-Hraun',
    type: 'Búnaður',
    amount: '450.000 kr',
    applicant: 'Öryggisdeild',
    deadline: '27.05.2025',
    status: 'VANSKIL',
    linked: 'Öryggismyndavélakerfi uppfærsla'
  },
  {
    id: '202502-0042',
    title: 'Fangaflutningar: Þyrluþjónusta',
    type: 'Þjónusta',
    amount: '3.200.000 kr',
    applicant: 'Flutningsdeild',
    deadline: '28.05.2025',
    status: 'EINDAGI Í DAG',
    linked: 'Landhelgisgæslan - þjónustusamningur'
  },
  {
    id: '202502-0043',
    title: 'Ráðning: Fangavörður - Litla-Hraun',
    type: 'Mannauður',
    amount: '750.000 kr',
    applicant: 'Mannauðsdeild',
    deadline: '29.05.2025',
    status: 'VÆNTANLEGT'
  },
  {
    id: '202502-0044',
    title: 'Matvælabirgðir - Hólmsheiði',
    type: 'Vörukaup',
    amount: '1.250.000 kr',
    applicant: 'Eldhús',
    deadline: '30.05.2025',
    status: 'BÍÐUR SAMÞYKKIS',
    linked: 'Mánaðarlegar birgðir'
  }
];

export default function ApprovalsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const hasCheckedAuth = useRef(false);

  useEffect(() => {
    if (hasCheckedAuth.current) return;
    hasCheckedAuth.current = true;

    const credentials = getStoredCredentials();
    if (!credentials.token) {
      router.push('/');
      return;
    }
    // Simulate fetching data
    setTimeout(() => {
      setApprovals(mockApprovals); // Use mock data for now
      setLoading(false);
    }, 1000);
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--nav-height,80px))]">
         <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Hleður samþykktum...</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold font-headline text-gray-900 uppercase">Samþykktir og beiðnir</h1>
        <Button>
          <FilePlus2 className="mr-2 h-4 w-4" /> Ný Beiðni
        </Button>
      </div>
      
      {approvals.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Engar beiðnir eða samþykktir.</p>
            <p className="text-sm text-muted-foreground">Engar virkar beiðnir eða samþykktir finnast.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/50 hover:bg-muted/60">
                  <TableHead className="font-medium text-gray-600 uppercase text-xs w-[100px]">MÁLSNR</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase text-xs">Titill</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase text-xs w-[80px]">Tegund</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase text-xs w-[110px]">Upphæð</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase text-xs w-[100px]">Deild</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase text-xs w-[90px]">Eindagi</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase text-xs w-[120px]">Tengt við</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase text-xs w-[80px]">Staða</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase text-xs text-right w-[140px]">Aðgerðir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <TableCell className="font-medium py-2 px-2 text-xs">{approval.id}</TableCell>
                    <TableCell className="py-2 px-2 text-xs">{approval.title}</TableCell>
                    <TableCell className="py-2 px-2 text-xs">{approval.type}</TableCell>
                    <TableCell className="py-2 px-2 text-xs whitespace-nowrap">{approval.amount}</TableCell>
                    <TableCell className="py-2 px-2 text-xs">{approval.applicant}</TableCell>
                    <TableCell className="py-2 px-2 text-xs whitespace-nowrap">{approval.deadline}</TableCell>
                    <TableCell className="py-2 px-2 text-xs">
                      {approval.linked && (
                        <a href="#" className="text-purple-600 hover:underline inline-flex items-center truncate">
                          <LinkIcon className="w-2 h-2 mr-1 flex-shrink-0" />
                          <span className="truncate">{approval.linked}</span>
                        </a>
                      )}
                    </TableCell>
                    <TableCell className="py-2 px-2">
                      <StatusBadge status={approval.status} />
                    </TableCell>
                    <TableCell className="py-2 px-2 text-right">
                      <div className="flex gap-1 justify-end">
                        <Button size="sm" variant="outline" className="text-xs px-2">SKOÐA</Button>
                        {approval.status !== 'SAMÞYKKT' && approval.status !== 'HAFNAÐ' && (
                           <Button size="sm" className="bg-gray-900 text-white hover:bg-gray-800 text-xs px-2">
                            SAMÞYKKJA
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
