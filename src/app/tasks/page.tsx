
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { Briefcase, FilePlus2, Link as LinkIcon, Loader2 } from 'lucide-react';
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
import { ProgressBar } from '@/components/ui/progress-bar'; // Assuming ProgressBar might be useful here too
import { cn } from '@/lib/utils';

interface TaskItem {
  id: string;
  title: string;
  assignedTo: string;
  deadline: string;
  status: 'VANSKIL' | 'EINDAGI Í DAG' | 'Í VINNSLU' | 'VÆNTANLEGT' | 'LOKIÐ' | 'Í BIÐ';
  priority: 'Hátt' | 'Miðlungs' | 'Lágt';
  progress?: number; // Optional progress percentage
  relatedCase?: { id: string; title: string };
}

// Mock data, replace with API call
const mockTasks: TaskItem[] = [
  {
    id: 'V001',
    title: 'Öryggisúttekt - Hólmsheiði',
    assignedTo: 'Guðmundur Þórsson',
    deadline: '26.05.2025',
    status: 'VANSKIL',
    priority: 'Hátt',
    progress: 75,
    relatedCase: { id: 'M2024-015', title: 'Mánaðarleg öryggisúttekt' }
  },
  {
    id: 'V002',
    title: 'Endurhæfingaráætlun 2025',
    assignedTo: 'Sigríður Haraldsdóttir',
    deadline: '28.05.2025',
    status: 'EINDAGI Í DAG',
    priority: 'Hátt',
    progress: 85
  },
  {
    id: 'V003',
    title: 'Fangaviðtöl - Sogn',
    assignedTo: 'Þórdís Gunnarsdóttir',
    deadline: '29.05.2025',
    status: 'Í VINNSLU',
    priority: 'Miðlungs',
    progress: 40,
    relatedCase: { id: 'F2024-102', title: 'Mánaðarleg viðtöl við fanga' }
  },
  {
    id: 'V004',
    title: 'Öryggisleiðbeiningar uppfærsla',
    assignedTo: 'Jón Magnússon',
    deadline: '30.05.2025',
    status: 'VÆNTANLEGT',
    priority: 'Miðlungs',
    progress: 20
  },
  {
    id: 'V005',
    title: 'Rafkerfi eftirlit - Litla-Hraun',
    assignedTo: 'Ólafur Stefánsson',
    deadline: '02.06.2025',
    status: 'VÆNTANLEGT',
    priority: 'Lágt',
    progress: 10,
    relatedCase: { id: 'T2024-055', title: 'Árseftirlit rafkerfa' }
  },
];

export default function TasksPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
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
    setTimeout(() => {
      setTasks(mockTasks);
      setLoading(false);
    }, 1000);
  }, [router]);

  const getPriorityClass = (priority: TaskItem['priority']): string => {
    if (priority === 'Hátt') return 'text-red-600 font-semibold';
    if (priority === 'Miðlungs') return 'text-orange-600 font-semibold';
    return 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-var(--nav-height,80px))]">
         <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Hleður verkum...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold font-headline text-gray-900 uppercase">Verkefnaskrá</h1>
         <Button>
          <FilePlus2 className="mr-2 h-4 w-4" /> Nýtt Verkefni
        </Button>
      </div>
      
      {tasks.length === 0 ? (
         <Card>
          <CardContent className="p-10 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Engin verkefni.</p>
            <p className="text-sm text-muted-foreground">Engin virk verkefni finnast.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b bg-muted/50 hover:bg-muted/60">
                  <TableHead className="font-medium text-gray-600 uppercase">VERK NÚMER</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase">Titill</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase">Ábyrgðaraðili</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase">Eindagi</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase">Forgangur</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase w-36">Framvinda</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase">Staða</TableHead>
                  <TableHead className="font-medium text-gray-600 uppercase text-right">Aðgerðir</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <TableCell className="font-medium py-3 px-4 text-sm">{task.id}</TableCell>
                    <TableCell className="py-3 px-4 text-sm">
                      <div>
                        {task.title}
                        {task.relatedCase && (
                           <a href="#" className="mt-1 text-xs text-purple-600 hover:underline flex items-center">
                            <LinkIcon className="w-2.5 h-2.5 mr-1" />
                            {task.relatedCase.title}
                          </a>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-3 px-4 text-sm">{task.assignedTo}</TableCell>
                    <TableCell className="py-3 px-4 text-sm">{task.deadline}</TableCell>
                    <TableCell className={cn("py-3 px-4 text-sm", getPriorityClass(task.priority))}>{task.priority}</TableCell>
                    <TableCell className="py-3 px-4">
                      {typeof task.progress === 'number' && <ProgressBar value={task.progress} showLabel={true} />}
                    </TableCell>
                    <TableCell className="py-3 px-4">
                      <StatusBadge status={task.status} />
                    </TableCell>
                    <TableCell className="py-3 px-4 text-right">
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline">SKOÐA</Button>
                         {task.status !== 'LOKIÐ' && <Button size="sm" variant="outline">BREYTA</Button>}
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
