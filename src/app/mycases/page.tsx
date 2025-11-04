
'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetClose } from '@/components/ui/sheet';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/status-badge';
import { FramvindaBar } from '@/components/ui/framvinda-bar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Loader2,
  FilePlus2,
  AlertTriangle,
  FolderOpen,
  Mail,
  Phone,
  ShieldAlert,
  Search,
} from 'lucide-react';
import type { Case, CaseContact, CredentialInfo } from '@/types';
import { getToken, searchCases, getCaseDetails, getCaseContacts } from '@/lib/gopro';
import { getStoredBusinessCentralToken } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import parse from 'html-react-parser';
import { Inter, Space_Grotesk as SpaceGrotesk } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const spaceGrotesk = SpaceGrotesk({ subsets: ['latin'], weight: ['700'] });

function mapStatus(apiStatus?: string): string {
  if (!apiStatus) return 'ÓÞEKKT';
  const lowerApiStatus = apiStatus.toLowerCase();

  if (lowerApiStatus === 'í vinnslu') return 'Í VINNSLU';
  if (lowerApiStatus === 'lokið') return 'LOKIÐ'; 
  if (lowerApiStatus === 'nýtt') return 'Í VINNSLU';
  if (lowerApiStatus === 'í bið') return 'VÆNTANLEGT';
  if (lowerApiStatus === 'fært í skjalasafn') return 'LOKIÐ';

  if (lowerApiStatus.includes('open') && lowerApiStatus !== 'í vinnslu') return 'Í VINNSLU';
  if (lowerApiStatus.includes('pending') && lowerApiStatus !== 'í bið') return 'Í BIÐ';
  if (lowerApiStatus.includes('active') && lowerApiStatus !== 'virkt') return 'VIRKT';

  return apiStatus.toUpperCase();
}

function formatDate(dateString?: string | null): string {
  if (!dateString || dateString === '0001-01-01T00:00:00' || dateString === '0001-01-01') {
    return 'N/A';
  }

  let formattedDate: string;

  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      formattedDate = date.toLocaleDateString('is-IS', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } else {
      if (typeof dateString === 'string') {
        if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
          formattedDate = dateString.replace(/\//g, '.');
        } else if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
          formattedDate = dateString;
        } else {
          formattedDate = 'Ógild dagsetning';
        }
      } else {
        formattedDate = 'Ógild dagsetning';
      }
    }
  } catch (e) {
    if (typeof dateString === 'string') {
      if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        formattedDate = dateString.replace(/\//g, '.');
      } else if (dateString.match(/^\d{2}\.\d{2}\.\d{4}$/)) {
        formattedDate = dateString;
      } else {
        formattedDate = 'Ógild dagsetning';
      }
    } else {
      formattedDate = 'Ógild dagsetning';
    }
  }

  if (typeof formattedDate === 'string' && formattedDate.includes('/')) {
    return formattedDate.replace(/\//g, '.');
  }

  return formattedDate;
}

function cleanHtml(htmlString?: string | null): string {
  if (!htmlString) return '';
  let cleaned = htmlString.replace(/ class="[^"]*"/gi, '');
  cleaned = cleaned.replace(/<font[^>]*>/gi, '').replace(/<\/font>/gi, '');
  cleaned = cleaned.replace(/<span[^>]*style="[^"]*"[^>]*>/gi, (match) => {
    return match.replace(/ style="[^"]*"/gi, '');
  });
  return cleaned;
}

function truncateText(text: string | undefined | null, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '...';
}

function translateContactType(apiType?: string): string {
  if (!apiType) return '';
  const lowerApiType = apiType.toLowerCase();
  switch (lowerApiType) {
    case 'individual':
      return 'Einstaklingur';
    case 'contact':
      return 'Tengiliður';
    case 'company':
      return 'Skipuheild';
    default:
      return apiType;
  }
}

const formatISK = (amount?: number | null) => {
  if (typeof amount !== 'number') return '0';
  return new Intl.NumberFormat('is-IS', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

interface CustomerFinancialDetail {
  balance: number;
  totalSalesExcludingTax: number;
  overdueAmount: number;
}

interface CustomerFinancialSummaryProps {
  customerId: string | null;
}

// Direct client-side API call configuration
// Business Central API URL structure: https://api.businesscentral.dynamics.com/v2.0/{tenantId}/{environment}/api/v2.0
// Try with uppercase Production first
const BC_API_BASE_URL_DIRECT = 'https://api.businesscentral.dynamics.com/v2.0/4d744818-a94d-4dde-82c7-d503a12ffe5d/Production/api/v2.0';
const COMPANY_ID_DIRECT = '53a59388-b92b-f011-9af3-6045bde96818';


async function fetchCustomerFinancialsDirect(customerId: string): Promise<CustomerFinancialDetail | null> {
  if (!customerId) return null;

  const bcToken = getStoredBusinessCentralToken();
  if (!bcToken) {
    console.error('Business Central token not found in localStorage.');
    return null; // Return null instead of throwing to handle gracefully
  }

  // Clean the customer ID (remove any spaces or special characters)
  const cleanCustomerId = customerId.replace(/\s+/g, '').replace(/-/g, '');
  
  // First, let's try to get the companies to verify the API connection
  const companiesUrl = `${BC_API_BASE_URL_DIRECT}/companies`;
  const apiUrl = `${BC_API_BASE_URL_DIRECT}/companies(${COMPANY_ID_DIRECT})/customers?$filter=number eq '${cleanCustomerId}'&$expand=customerFinancialDetail`;
  
  console.log('Business Central API Request for customer:', {
    originalId: customerId,
    cleanedId: cleanCustomerId
  });
  
  try {
    // First test: Try to fetch companies to verify API access (only do this once per session)
    const testResponse = await fetch(companiesUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bcToken}`,
        'Accept': 'application/json',
      },
    });
    
    let actualCompanyId = COMPANY_ID_DIRECT;
    let actualApiUrl = apiUrl;
    
    if (!testResponse.ok) {
      console.error('BC API connection failed:', testResponse.status);
      
      // Check if it's an authentication error (401)
      if (testResponse.status === 401) {
        console.error('Business Central token er útrunnið (expired)');
        // Could show a toast here if needed
        // toast({ title: "Business Central", description: "Token er útrunnið", variant: "destructive" });
      }
      return null;
    } else {
      const companies = await testResponse.json();
      
      // Use the first company ID from the API
      if (companies.value && companies.value.length > 0) {
        actualCompanyId = companies.value[0].id;
        // Always use the actual company ID from the API and cleaned customer ID
        actualApiUrl = `${BC_API_BASE_URL_DIRECT}/companies(${actualCompanyId})/customers?$filter=number eq '${cleanCustomerId}'&$expand=customerFinancialDetail`;
      }
    }
    
    // Now try the actual customer query with the correct company ID
    const response = await fetch(actualApiUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${bcToken}`,
        'Accept': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        console.log(`Customer ${cleanCustomerId} not found in Business Central`);
        return null; // Customer doesn't exist in BC, which is OK
      }
      if (response.status === 401) {
        console.error(`Business Central token er útrunnið (expired) - Customer ${cleanCustomerId}`);
        // Could show a toast here if needed
        // toast({ title: "Business Central", description: "Token er útrunnið", variant: "destructive" });
        return null;
      }
      const errorText = await response.text();
      console.error(`BC API Error for customer ${cleanCustomerId}:`, response.status, errorText);
      return null;
    }
    const data = await response.json();
    console.log(`BC API Response for ${cleanCustomerId}:`, {
      hasValue: !!data.value,
      recordCount: data.value?.length || 0,
      firstRecord: data.value?.[0]
    });
    
    if (data.value && data.value.length > 0) {
      const customer = data.value[0];
      console.log(`Customer ${cleanCustomerId} found:`, {
        number: customer.number,
        displayName: customer.displayName,
        hasFinancialDetail: !!customer.customerFinancialDetail,
        financialDetail: customer.customerFinancialDetail
      });
      return customer.customerFinancialDetail || null;
    }
    console.log(`No customer found with ID ${cleanCustomerId}`);
    return null;
  } catch (error) {
    console.error(`Error fetching BC data for ${customerId}:`, error);
    return null; 
  }
}


const CustomerFinancialSummary: React.FC<CustomerFinancialSummaryProps> = ({ customerId }) => {
  const [financials, setFinancials] = useState<CustomerFinancialDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customerId) {
      setLoading(false);
      setError("Kennitala vantar.");
      return;
    }

    async function loadFinancials() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCustomerFinancialsDirect(customerId);
        if (data) {
          setFinancials(data);
          setError(null);
        } else {
          setFinancials(null);
          setError(null); // No error - customer just doesn't exist in BC or no financial data
        }
      } catch (err) {
        console.error('Error fetching customer financials:', err);
        setFinancials(null);
        setError(null); // Don't show errors for individual customers
      } finally {
        setLoading(false);
      }
    }

    loadFinancials();
  }, [customerId]);

  if (loading) return <div className="min-w-[200px] text-right text-xs text-muted-foreground p-2">Sæki fjárhagsgögn...</div>;
  if (error) return <div className="min-w-[200px] text-right text-xs text-red-600 p-2">{error}</div>;
  if (!financials) return null; // Don't show anything if no financial data

  return (
    <div className="min-w-[300px] text-right p-2">
      <h4 className="text-sm font-medium mb-1 text-right">Fjárhagsupplýsingar</h4>
      <div className="flex justify-between my-1 gap-5">
        <span className="text-xs text-muted-foreground">Brúttó sala án VSK:</span>
        <span className="text-xs font-medium whitespace-nowrap">kr. {formatISK(financials.totalSalesExcludingTax)}</span>
      </div>
      <div className="flex justify-between my-1 gap-5">
        <span className="text-xs text-muted-foreground">Staða viðskiptamanns:</span>
        <span className="text-xs font-medium whitespace-nowrap">kr. {formatISK(financials.balance)}</span>
      </div>
      <div className={cn("flex justify-between my-1 gap-5", financials.overdueAmount > 0 ? "text-red-600" : "")}>
        <span className={cn("text-xs", financials.overdueAmount > 0 ? "" : "text-muted-foreground")}>Þar af í vanskilum:</span>
        <span className="text-xs font-medium whitespace-nowrap">kr. {formatISK(financials.overdueAmount)}</span>
      </div>
    </div>
  );
};


export default function MyCasesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const hasLoadedRef = useRef(false);
  const [userInfo, setUserInfo] = useState<CredentialInfo>({ username: null, idNumber: null, token: null });
  const [searchTerm, setSearchTerm] = useState('');

  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<Case | null>(null);
  const [caseContacts, setCaseContacts] = useState<CaseContact[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [contactsError, setContactsError] = useState('');
  
  // Document dialog states
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState<string>('');
  const [documentStep, setDocumentStep] = useState(1);
  const [documentCase, setDocumentCase] = useState<Case | null>(null);
  const [documentFormData, setDocumentFormData] = useState<any>({});

  async function loadCases() {
    setLoading(true);
    setError('');
    try {
      // Get token from gopro helper
      const tokenBundle = getToken();
      const username = typeof window !== 'undefined' ? localStorage.getItem('gopro_username') : null;
      const idNumber = typeof window !== 'undefined' ? localStorage.getItem('gopro_idnumber') : null;

      setUserInfo({ token: tokenBundle?.token || null, username, idNumber });

      if (!tokenBundle?.token || !idNumber) {
        router.push('/');
        toast({ title: "Notandi ekki innskráður", description: "Vinsamlegast skráðu þig inn aftur.", variant: "destructive" });
        setLoading(false);
        return;
      }

      const response = await searchCases('2110705959');

      if (response.succeeded) {
        setCases(response.cases || []);
        if (!response.cases || response.cases.length === 0) {
          toast({ title: "Engin mál fundust", description: "Engin mál eru skráð á þennan aðgang með uppgefnu kennitölu." });
        }
      } else {
        const errorMessage = response.message || 'Villa við að sækja mál frá API';
        setError(errorMessage);
        toast({ title: "Villa við að sækja mál", description: errorMessage, variant: "destructive" });
      }

    } catch (err) {
      console.error('Error loading cases:', err);
      const errorMessage = err instanceof Error ? err.message : 'Óþekkt villa við að sækja mál';

      // Check if this is a 401 authentication error
      if (errorMessage.includes('útrunnið') || errorMessage.includes('Auðkenni vantar')) {
        toast({
          title: "Auðkenni útrunnið",
          description: "Vinsamlega skráðu þig inn aftur.",
          variant: "destructive"
        });

        // Clear storage and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        router.push('/');
        return;
      }

      setError(errorMessage);
      toast({ title: "Villa við að sækja mál", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const tokenBundle = getToken();
    const username = typeof window !== 'undefined' ? localStorage.getItem('gopro_username') : null;
    const idNumber = typeof window !== 'undefined' ? localStorage.getItem('gopro_idnumber') : null;

    setUserInfo({ token: tokenBundle?.token || null, username, idNumber });

    if (!tokenBundle?.token || !idNumber) {
      router.push('/');
      return;
    }

    loadCases();
  }, [router, toast]);

  function handleAddDocument(caseItem: Case) {
    setDocumentCase(caseItem);
    setDocumentDialogOpen(true);
    setDocumentStep(1);
    setDocumentType('');
    setDocumentFormData({});
  }

  function handleDocumentTypeSelect(type: string) {
    setDocumentType(type);
    setDocumentStep(2);
    // Initialize form data based on document type
    setDocumentFormData({
      date: new Date().toISOString().split('T')[0],
      recordedBy: userInfo.username || 'Starfsmaður'
    });
  }

  function handleDocumentSave() {
    // Here you would normally save to API
    toast({
      title: "Skjal vistaði",
      description: `${documentType} hefur verið bætt við mál ${documentCase?.caseNumber}`,
    });
    setDocumentDialogOpen(false);
    setDocumentStep(1);
    setDocumentType('');
    setDocumentFormData({});
  }

  async function handleOpenCase(caseItem: Case) {
    setSelectedCase(caseItem);
    setSheetOpen(true);
    setLoadingDetails(true);
    setCaseContacts([]);
    setContactsError('');

    const tokenBundle = getToken();
    if (!tokenBundle?.token) {
      toast({ title: "Notandi ekki innskráður", description: "Vinsamlegast skráðu þig inn aftur.", variant: "destructive" });
      setLoadingDetails(false);
      setSheetOpen(false);
      router.push('/');
      return;
    }

    try {
      const detailsPromise = getCaseDetails(caseItem.caseNumber);
      const contactsPromise = getCaseContacts(caseItem.caseNumber);

      const [detailsResponse, contactsResponse] = await Promise.all([detailsPromise, contactsPromise]);

      if (detailsResponse.succeeded && detailsResponse.case) {
        setSelectedCase(detailsResponse.case);
      } else {
        const errorMsg = detailsResponse.message || 'Mistókst að sækja ítarlegar upplýsingar um mál';
        console.error('Error fetching case details:', errorMsg);
        toast({ title: "Villa", description: errorMsg, variant: "destructive" });
        setSelectedCase(caseItem);
      }

      if (contactsResponse.succeeded && contactsResponse.contacts) {
        setCaseContacts(contactsResponse.contacts);
      } else {
        const errorMsg = contactsResponse.message || 'Mistókst að sækja málsaðila';
        console.error('Error fetching case contacts:', errorMsg);

        // Handle duplicate case number gracefully
        if (errorMsg.includes('duplication') || errorMsg.includes('More than one case')) {
          setContactsError('Málsnúmer er tvítekið í kerfinu. Hafðu samband við kerfisstjóra.');
        } else {
          setContactsError(errorMsg);
        }

        // Only show toast if details also failed (don't spam user)
        if (!(detailsResponse.succeeded && detailsResponse.case)) {
          toast({ title: "Villa", description: errorMsg, variant: "destructive" });
        }
      }

    } catch (err) {
      console.error('Error in handleOpenCase:', err);
      const errorMessage = err instanceof Error ? err.message : "Óvænt villa kom upp við að sækja málsgögn.";

      // Check if this is a 401 authentication error
      if (errorMessage.includes('útrunnið') || errorMessage.includes('Auðkenni vantar')) {
        toast({
          title: "Auðkenni útrunnið",
          description: "Vinsamlega skráðu þig inn aftur.",
          variant: "destructive"
        });

        // Clear storage and redirect to login
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
        router.push('/');
        return;
      }

      toast({ title: "Óvænt villa", description: errorMessage, variant: "destructive" });
      setSelectedCase(caseItem);
    } finally {
      setLoadingDetails(false);
    }
  }

  const filteredCases = cases.filter(caseItem => {
    // Exclude completed and archived cases
    const status = caseItem.statusName?.toLowerCase() || '';
    if (status === 'lokið' || status === 'fært í skjalasafn') {
      return false;
    }

    // Then apply search filter
    const term = searchTerm.toLowerCase();
    if (!term) return true;
    return (
      caseItem.caseNumber?.toLowerCase().includes(term) ||
      caseItem.subject?.toLowerCase().includes(term) ||
      caseItem.templateName?.toLowerCase().includes(term) ||
      caseItem.categoryName?.toLowerCase().includes(term) ||
      caseItem.responsibleEmployeeName?.toLowerCase().includes(term) ||
      caseItem.statusName?.toLowerCase().includes(term) ||
      mapStatus(caseItem.statusName)?.toLowerCase().includes(term) ||
      (caseItem.keywords && caseItem.keywords.some(keyword => keyword.toLowerCase().includes(term)))
    );
  });

  if (loading && cases.length === 0) {
    return (
      <div className="min-h-[calc(100vh-var(--nav-height,80px))] flex items-center justify-center">
        <Card className="shadow-lg">
          <CardContent className="p-6 flex flex-col items-center space-y-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Hleður málum...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
           <h1 className="text-3xl font-bold font-headline text-gray-900 uppercase">Málaskrá</h1>
           {userInfo.username && userInfo.idNumber && (
            <div className="text-sm text-muted-foreground">
              <p>{userInfo.username}</p>
              <p>{userInfo.idNumber}</p>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto md:flex-nowrap">
          <div className="relative flex-grow md:flex-grow-0 md:w-72">
            <Input
              placeholder="Leita í málum..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 h-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button className="flex-shrink-0">
            <FilePlus2 className="mr-2 h-4 w-4" /> Nýtt Mál
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Villa!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {loading && cases.length > 0 && (
            <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          {filteredCases.length === 0 && !loading && !error && (
            <div className="p-10 text-center">
              <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                {searchTerm ? 'Engin mál fundust með leitarskilyrðum.' : 'Engin mál fundust.'}
              </p>
              <p className="text-sm text-muted-foreground">
                {searchTerm ? 'Prófaðu að breyta leitinni.' : 'Það eru engin mál skráð á þennan aðgang eins og er.'}
              </p>
            </div>
          )}
          {filteredCases.length > 0 && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b bg-muted/50 hover:bg-muted/60">
                    <TableHead className="font-medium text-gray-600 uppercase">MÁLSNÚMER</TableHead>
                    <TableHead className="font-medium text-gray-600 uppercase">Titill</TableHead>
                    <TableHead className="font-medium text-gray-600 uppercase min-w-[180px]">Tegund</TableHead>
                    <TableHead className="font-medium text-gray-600 uppercase min-w-[140px]">Ábyrgð</TableHead>
                    <TableHead className="font-medium text-gray-600 uppercase min-w-[100px]">Síðast Breytt</TableHead>
                    <TableHead className="font-medium text-gray-600 uppercase w-32">Framvinda</TableHead>
                    <TableHead className="font-medium text-gray-600 uppercase min-w-[120px]">Staða</TableHead>
                    <TableHead className="font-medium text-gray-600 uppercase text-right">Aðgerðir</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCases.map((caseItem) => (
                    <TableRow
                      key={caseItem.id || caseItem.caseNumber}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => handleOpenCase(caseItem)}
                    >
                      <TableCell className="font-medium py-3 px-4 text-sm">{caseItem.caseNumber}</TableCell>
                      <TableCell className="py-3 px-4 text-sm">
                        <div>
                          <div className="font-medium">{caseItem.subject}</div>
                          {caseItem.categoryName && (
                            <div className="text-xs text-muted-foreground">{caseItem.categoryName}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-3 px-4 text-sm">{truncateText(caseItem.templateName || 'Lögfræðileg skoðun', 12)}</TableCell>
                      <TableCell className="py-3 px-4 text-sm">{truncateText(caseItem.responsibleEmployeeName, 15)}</TableCell>
                      <TableCell className="py-3 px-4 text-sm">{formatDate(caseItem.modifiedDate)}</TableCell>
                      <TableCell className="py-3 px-4 w-32">
                        <FramvindaBar creationDate={caseItem.creationDate} closingDate={caseItem.closingDate} />
                      </TableCell>
                      <TableCell className="py-3 px-4">
                        <StatusBadge status={mapStatus(caseItem.statusName)} />
                      </TableCell>
                      <TableCell className="py-3 px-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleOpenCase(caseItem); }}>OPNA</Button>
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handleAddDocument(caseItem); }}>NÝTT...</Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-[700px] sm:max-w-[700px] overflow-y-auto p-6">
          <SheetHeader className="mb-1">
            <SheetTitle className={cn("font-headline text-2xl", spaceGrotesk.className)}>
              Mál: {selectedCase?.caseNumber}
            </SheetTitle>
            {selectedCase && (
              <div className="mt-3 space-y-2">
                {selectedCase.confidential && selectedCase.personalSensitive && (
                  <Alert variant="destructive" className="bg-red-50 border-red-500 text-red-700">
                    <ShieldAlert className="h-5 w-5 text-red-700" />
                    <AlertTitle className="font-semibold text-red-800">TRÚNAÐARMÁL OG VIÐKVÆMAR UPPLÝSINGAR</AlertTitle>
                    <AlertDescription className="text-red-700">
                      Þessi málsgögn eru trúnaðarmál og innihalda viðkvæmar upplýsingar. Aðeins viðeigandi starfsmenn hafa heimild til að skoða og meðhöndla málið.
                    </AlertDescription>
                  </Alert>
                )}
                {selectedCase.confidential && !selectedCase.personalSensitive && (
                  <Alert variant="destructive" className="bg-red-50 border-red-500 text-red-700">
                    <ShieldAlert className="h-5 w-5 text-red-700" />
                    <AlertTitle className="font-semibold text-red-800">TRÚNAÐARMÁL</AlertTitle>
                    <AlertDescription className="text-red-700">
                      Þessi málsgögn eru trúnaðarmál. Aðeins viðeigandi starfsmenn hafa heimild til að skoða þetta mál.
                    </AlertDescription>
                  </Alert>
                )}
                {!selectedCase.confidential && selectedCase.personalSensitive && (
                  <Alert className="bg-orange-50 border-orange-500 text-orange-700">
                    <AlertTriangle className="h-5 w-5 text-orange-700" />
                    <AlertTitle className="font-semibold text-orange-800">VIÐKVÆMAR UPPLÝSINGAR</AlertTitle>
                    <AlertDescription className="text-orange-700">
                      Þessi málsgögn innihalda viðkvæmar upplýsingar. Vinsamlega meðhöndlið af varúð.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </SheetHeader>
          {loadingDetails ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedCase ? (
            <div className="space-y-6 mt-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 font-headline text-gray-800 uppercase">Málsaðilar</h3>
                {contactsError && (
                  <Alert variant="destructive" className="mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Villa við að sækja málsaðila</AlertTitle>
                    <AlertDescription>{contactsError}</AlertDescription>
                  </Alert>
                )}
                {caseContacts.length > 0 ? (
                  <div className="space-y-3">
                    {caseContacts.map((contact) => {
                      const roleDisplay = contact.role?.trim();
                      const showRole = roleDisplay && roleDisplay !== "()";
                      const translatedType = translateContactType(contact.type);

                      return (
                        <div key={contact.contactID || contact.caseContactID}
                          className="flex justify-between items-start border p-3 rounded-md bg-muted/20">
                          <div className="flex-grow mr-4">
                            <div className="font-medium text-sm">
                              {contact.name}
                              {showRole && ` (${roleDisplay})`}
                            </div>
                            <div className="text-xs text-muted-foreground">Kennitala: {contact.idnumber || 'N/A'}</div>
                            {(translatedType || contact.primary === "1") &&
                              <div className="text-xs text-muted-foreground">
                                Tegund: {translatedType || 'Óþekkt'}
                                {contact.primary === "1" && " (Aðal)"}
                              </div>
                            }
                            {contact.address && <div className="text-xs text-muted-foreground">Heimilisfang: {contact.address}, {contact.postalCode} {contact.city}</div>}
                            {contact.email && <div className="text-xs text-muted-foreground flex items-center mt-1"><Mail className="mr-1.5 h-3 w-3" /> {contact.email}</div>}
                            {contact.phone && <div className="text-xs text-muted-foreground flex items-center mt-1"><Phone className="mr-1.5 h-3 w-3" /> {contact.phone}</div>}
                            {contact.webPage && <div className="text-xs text-muted-foreground">Vefsíða: {contact.webPage}</div>}
                          </div>
                          {contact.idnumber && <CustomerFinancialSummary customerId={contact.idnumber} />}
                        </div>
                      );
                    })}
                  </div>
                ) : !contactsError && (
                  <p className="text-sm text-muted-foreground">Engir málsaðilar skráðir.</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-2 font-headline text-gray-800 uppercase">Grunnupplýsingar</h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Titill:</strong> {selectedCase.subject}</div>
                  <div><strong>Mál nr.:</strong> {selectedCase.caseNumber}</div>
                  <div><strong>Tegund:</strong> {selectedCase.templateName || 'N/A'}</div>
                  <div><strong>Flokkur:</strong> {selectedCase.categoryName || 'N/A'}</div>
                  <div><strong>Staða:</strong> <StatusBadge status={mapStatus(selectedCase.statusName)} /></div>
                  <div><strong>Ábyrgðarmaður:</strong> {selectedCase.responsibleEmployeeName}</div>
                  <div><strong>Aðrir starfsmenn:</strong> {selectedCase.coResponsibleEmployees?.join(', ') || 'Engir'}</div>
                  <div><strong>Forgangur:</strong> {selectedCase.priorityName || 'Ekki skráður'}</div>
                  <div><strong>Framvinda:</strong> <FramvindaBar creationDate={selectedCase.creationDate} closingDate={selectedCase.closingDate} className="max-w-xs" /></div>
                  <div><strong>Stofnað:</strong> {formatDate(selectedCase.creationDate)} af {selectedCase.createdByName}</div>
                  <div><strong>Síðast breytt:</strong> {formatDate(selectedCase.modifiedDate)} af {selectedCase.modifiedByName}</div>
                  <div><strong>Lokað:</strong> {formatDate(selectedCase.closingDate)}</div>
                  {selectedCase.body && (
                    <div className="pt-2">
                      <strong>Lýsing:</strong>
                      <div className="mt-1 border p-3 rounded-md bg-gray-50 dark:bg-gray-800">
                        <div className={cn("prose prose-sm max-w-none text-gray-800 dark:text-gray-200 leading-relaxed", inter.className)}>
                          {parse(cleanHtml(selectedCase.body))}
                        </div>
                      </div>
                    </div>
                  )}
                  {selectedCase.keywords && selectedCase.keywords.length > 0 && (
                    <div><strong>Lykilorð:</strong> {selectedCase.keywords.join(', ')}</div>
                  )}
                  {selectedCase.publishTo && selectedCase.publishTo.length > 0 && (
                    <div><strong>Birt til:</strong> {selectedCase.publishTo.join(', ')}</div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">Engar upplýsingar um valið mál.</p>
          )}
        </SheetContent>
      </Sheet>

      {/* Document Creation Dialog */}
      <Dialog open={documentDialogOpen} onOpenChange={setDocumentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {documentStep === 1 ? 'Veldu skjalategund' : `Nýtt skjal - ${documentType}`}
            </DialogTitle>
            <DialogDescription>
              {documentStep === 1 
                ? `Veldu skjalategund til að bæta í mál ${documentCase?.caseNumber}` 
                : 'Fylltu út upplýsingar fyrir skjalið'}
            </DialogDescription>
          </DialogHeader>

          {documentStep === 1 && (
            <div className="py-4">
              <RadioGroup value={documentType} onValueChange={handleDocumentTypeSelect}>
                <div className="space-y-3">
                  {[
                    { value: 'Skýrsla', label: 'Skýrsla' },
                    { value: 'Atvikaskráning', label: 'Atvikaskráning' },
                    { value: 'Dagálsskrá', label: 'Dagálsskrá' },
                    { value: 'Viðtal', label: 'Viðtal' },
                    { value: 'Úttekt', label: 'Úttekt' },
                    { value: 'Læknisvottorð', label: 'Læknisvottorð / Heilsufarsyfirlit' },
                    { value: 'Áminning', label: 'Áminning' },
                    { value: 'Umsókn', label: 'Umsókn' },
                    { value: 'Samþykki', label: 'Samþykki' },
                    { value: 'Bréfaskrá', label: 'Bréfaskrá' },
                    { value: 'Mat á hegðun', label: 'Mat á hegðun' },
                  ].map((type) => (
                    <div key={type.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={type.value} id={type.value} />
                      <Label htmlFor={type.value} className="cursor-pointer flex-1">
                        {type.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>
          )}

          {documentStep === 2 && (
            <div className="space-y-4 py-4">
              {/* Common fields */}
              <div className="space-y-2">
                <Label htmlFor="date">Dagsetning</Label>
                <Input
                  id="date"
                  type="date"
                  value={documentFormData.date || ''}
                  onChange={(e) => setDocumentFormData({...documentFormData, date: e.target.value})}
                />
              </div>

              {/* Document type specific fields */}
              {documentType === 'Skýrsla' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="title">Titill skýrslu</Label>
                    <Input
                      id="title"
                      value={documentFormData.title || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, title: e.target.value})}
                      placeholder="Titill skýrslu"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Lýsing / texti</Label>
                    <Textarea
                      id="description"
                      value={documentFormData.description || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, description: e.target.value})}
                      placeholder="Lýsing á skýrslu"
                      rows={4}
                    />
                  </div>
                </>
              )}

              {documentType === 'Atvikaskráning' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="time">Tími</Label>
                    <Input
                      id="time"
                      type="time"
                      value={documentFormData.time || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, time: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incidentType">Tegund atviks</Label>
                    <Select
                      value={documentFormData.incidentType || ''}
                      onValueChange={(value) => setDocumentFormData({...documentFormData, incidentType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Veldu tegund" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ofbeldi">Ofbeldi</SelectItem>
                        <SelectItem value="ospektir">Óspektir</SelectItem>
                        <SelectItem value="slys">Slys</SelectItem>
                        <SelectItem value="heilsa">Heilsa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="incidentDescription">Lýsing á atviki</Label>
                    <Textarea
                      id="incidentDescription"
                      value={documentFormData.incidentDescription || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, incidentDescription: e.target.value})}
                      placeholder="Lýsing á atviki"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="response">Viðbrögð/aðgerðir</Label>
                    <Textarea
                      id="response"
                      value={documentFormData.response || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, response: e.target.value})}
                      placeholder="Viðbrögð og aðgerðir"
                      rows={2}
                    />
                  </div>
                </>
              )}

              {documentType === 'Dagálsskrá' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="dailyText">Dagálstexti</Label>
                    <Textarea
                      id="dailyText"
                      value={documentFormData.dailyText || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, dailyText: e.target.value})}
                      placeholder="Frjáls texti um daginn"
                      rows={5}
                    />
                  </div>
                </>
              )}

              {documentType === 'Viðtal' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="interviewType">Tegund viðtals</Label>
                    <Select
                      value={documentFormData.interviewType || ''}
                      onValueChange={(value) => setDocumentFormData({...documentFormData, interviewType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Veldu tegund" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="psychologist">Sálfræðingur</SelectItem>
                        <SelectItem value="socialWorker">Félagsráðgjafi</SelectItem>
                        <SelectItem value="guard">Fangavörður</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="discussion">Lýsing á umræðum / niðurstöðum</Label>
                    <Textarea
                      id="discussion"
                      value={documentFormData.discussion || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, discussion: e.target.value})}
                      placeholder="Umræður og niðurstöður"
                      rows={4}
                    />
                  </div>
                </>
              )}

              {documentType === 'Úttekt' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="auditType">Tegund úttektar</Label>
                    <Select
                      value={documentFormData.auditType || ''}
                      onValueChange={(value) => setDocumentFormData({...documentFormData, auditType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Veldu tegund" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="security">Öryggi</SelectItem>
                        <SelectItem value="accommodation">Vistun</SelectItem>
                        <SelectItem value="behavior">Hegðun</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="findings">Athugasemdir / niðurstöður</Label>
                    <Textarea
                      id="findings"
                      value={documentFormData.findings || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, findings: e.target.value})}
                      placeholder="Niðurstöður úttektar"
                      rows={4}
                    />
                  </div>
                </>
              )}

              {documentType === 'Læknisvottorð' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="doctor">Læknir / heilbrigðisstarfsmaður</Label>
                    <Input
                      id="doctor"
                      value={documentFormData.doctor || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, doctor: e.target.value})}
                      placeholder="Nafn læknis"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="diagnosis">Greining / ábending</Label>
                    <Textarea
                      id="diagnosis"
                      value={documentFormData.diagnosis || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, diagnosis: e.target.value})}
                      placeholder="Greining eða ábending"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Viðbótarathugasemdir</Label>
                    <Textarea
                      id="notes"
                      value={documentFormData.notes || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, notes: e.target.value})}
                      placeholder="Athugasemdir"
                      rows={2}
                    />
                  </div>
                </>
              )}

              {documentType === 'Áminning' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="reason">Ástæða áminningar</Label>
                    <Textarea
                      id="reason"
                      value={documentFormData.reason || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, reason: e.target.value})}
                      placeholder="Ástæða fyrir áminningu"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="actions">Aðgerðir eða afleiðingar</Label>
                    <Textarea
                      id="actions"
                      value={documentFormData.actions || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, actions: e.target.value})}
                      placeholder="Aðgerðir sem gripið var til"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {documentType === 'Umsókn' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="applicationType">Tegund umsóknar</Label>
                    <Select
                      value={documentFormData.applicationType || ''}
                      onValueChange={(value) => setDocumentFormData({...documentFormData, applicationType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Veldu tegund" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leave">Leyfi</SelectItem>
                        <SelectItem value="education">Nám</SelectItem>
                        <SelectItem value="work">Vinna</SelectItem>
                        <SelectItem value="probation">Reynslulausn</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="justification">Rökstuðningur / texti umsóknar</Label>
                    <Textarea
                      id="justification"
                      value={documentFormData.justification || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, justification: e.target.value})}
                      placeholder="Rökstuðningur"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Staða</Label>
                    <Select
                      value={documentFormData.status || ''}
                      onValueChange={(value) => setDocumentFormData({...documentFormData, status: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Veldu stöðu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Móttekið</SelectItem>
                        <SelectItem value="processing">Í vinnslu</SelectItem>
                        <SelectItem value="approved">Samþykkt</SelectItem>
                        <SelectItem value="rejected">Hafnað</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {documentType === 'Samþykki' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="consentType">Tegund samþykkis</Label>
                    <Select
                      value={documentFormData.consentType || ''}
                      onValueChange={(value) => setDocumentFormData({...documentFormData, consentType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Veldu tegund" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="treatment">Meðferð</SelectItem>
                        <SelectItem value="participation">Þátttaka</SelectItem>
                        <SelectItem value="information">Upplýsingaafhending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="consentNotes">Athugasemdir</Label>
                    <Textarea
                      id="consentNotes"
                      value={documentFormData.consentNotes || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, consentNotes: e.target.value})}
                      placeholder="Athugasemdir"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {documentType === 'Bréfaskrá' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="from">Frá</Label>
                    <Input
                      id="from"
                      value={documentFormData.from || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, from: e.target.value})}
                      placeholder="Sendandi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="to">Til</Label>
                    <Input
                      id="to"
                      value={documentFormData.to || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, to: e.target.value})}
                      placeholder="Móttakandi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="communicationType">Tegund samskipta</Label>
                    <Select
                      value={documentFormData.communicationType || ''}
                      onValueChange={(value) => setDocumentFormData({...documentFormData, communicationType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Veldu tegund" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mail">Póstur</SelectItem>
                        <SelectItem value="email">Tölvupóstur</SelectItem>
                        <SelectItem value="documents">Skjöl</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="summary">Yfirlit um innihald</Label>
                    <Textarea
                      id="summary"
                      value={documentFormData.summary || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, summary: e.target.value})}
                      placeholder="Samantekt"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {documentType === 'Mat á hegðun' && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="behaviorAssessment">Hegðunarmat</Label>
                    <Textarea
                      id="behaviorAssessment"
                      value={documentFormData.behaviorAssessment || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, behaviorAssessment: e.target.value})}
                      placeholder="Mat á hegðun (skali eða frjáls texti)"
                      rows={4}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="observations">Athugasemdir</Label>
                    <Textarea
                      id="observations"
                      value={documentFormData.observations || ''}
                      onChange={(e) => setDocumentFormData({...documentFormData, observations: e.target.value})}
                      placeholder="Athugasemdir"
                      rows={3}
                    />
                  </div>
                </>
              )}

              {/* Common field for who recorded */}
              <div className="space-y-2">
                <Label htmlFor="recordedBy">Skráð af</Label>
                <Input
                  id="recordedBy"
                  value={documentFormData.recordedBy || ''}
                  onChange={(e) => setDocumentFormData({...documentFormData, recordedBy: e.target.value})}
                  placeholder="Starfsmaður"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            {documentStep === 2 && (
              <Button
                variant="outline"
                onClick={() => {
                  setDocumentStep(1);
                  setDocumentType('');
                }}
              >
                Til baka
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setDocumentDialogOpen(false);
                setDocumentStep(1);
                setDocumentType('');
                setDocumentFormData({});
              }}
            >
              Hætta við
            </Button>
            {documentStep === 2 && (
              <Button onClick={handleDocumentSave}>
                Vista skjal
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
