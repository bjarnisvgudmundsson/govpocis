'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { StatusBadge } from '@/components/ui/status-badge';
import { StatCard } from '@/components/prison/stat-card';
import { prisonDataService, type Facility } from '@/lib/prison-data';
import { Phone, MessageSquareText, Mail } from 'lucide-react';
import { toFacilityKey, canonicalFacilityLabel, FACILITY_DISPLAY, type FacilityKey } from '@/lib/facility';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';

import photoMap from '@/app/data/prisonerPhotos.json';

/* ----------------------------- New local types ----------------------------- */

type CustodyStatus = 'Gæsluvarðhald' | 'Afplánun' | 'Einangrun';
type Kyn = 'Karlkyns' | 'Kvenkyns' | 'Kynsegin' | 'Annað';

type Prisoner = {
  id: string;
  prisonerNumber: string;    // Fanganúmer
  kennitala: string;
  name: string;
  prisonId: string;
  prisonName: string;
  facilityKey: FacilityKey;  // Canonical facility key
  department: string;        // Deild
  cell: string;              // Klefi
  lawyer?: string;
  lawyerPhone?: string;
  lawyerEmail?: string;
  status: CustodyStatus;     // Staða
  notes?: string;            // Athugasemdir
  medical?: {
    allergies?: string;
    meds?: string;
    risks?: string;
  };
  photoUrl?: string;         // Optional portrait
  syntheticPhoto?: boolean;  // Indicates if photo is AI-generated
  recentIncidents7d?: number; // Recent incidents in last 7 days (0-3+)
  kyn: Kyn;                  // Gender
};

/* -------------------------- Status color mapping -------------------------- */
const STADA_STYLES: Record<string, string> = {
  "Afplánun": "bg-blue-100 text-blue-800 ring-1 ring-blue-200",
  "Gæsluvarðhald": "bg-yellow-100 text-yellow-800 ring-1 ring-yellow-200",
  "Einangrun": "bg-red-100 text-red-800 ring-1 ring-red-200",
};

/* ---------------------------- Kyn inference ----------------------------- */
// Common Icelandic given names by gender
const KVENNАНАФN = new Set([
  'vaka', 'lilja', 'ásta', 'rósa', 'sólveig', 'þórhildur', 'elín', 'birna',
  'svanhildur', 'hanna', 'þóra', 'íris', 'drífa', 'valgerður', 'sigrún', 'elísabet'
]);

const KARLANÖFN = new Set([
  'snorri', 'bjartur', 'gvendur', 'nonni', 'ágúst', 'guðmundur', 'ásgeir',
  'haukur', 'kristján', 'fannar', 'oddur', 'magnús', 'gunnar', 'sindri',
  'einar', 'ragnar', 'kristófer', 'börkur'
]);

function inferKynFromName(name: string): Kyn | undefined {
  const parts = name.split(' ');
  const lastName = parts[parts.length - 1]?.toLowerCase();
  const firstName = parts[0]?.toLowerCase();

  // Check patronymic/matronymic
  if (lastName?.endsWith('dóttir')) return 'Kvenkyns';
  if (lastName?.endsWith('son')) return 'Karlkyns';

  // Check given name
  if (firstName && KVENNАНАФN.has(firstName)) return 'Kvenkyns';
  if (firstName && KARLANÖFN.has(firstName)) return 'Karlkyns';

  return undefined;
}

/* --------------------- Mock data + service shim (safe) --------------------- */
/* Replace this with prisonDataService.getPrisoners() when available. */
async function getMockPrisoners(): Promise<Prisoner[]> {
  const data: Prisoner[] = [
    {
      id: 'p-001',
      prisonerNumber: '5301-001',
      kennitala: '010180-1234',
      name: 'Snorri Sturluson',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Karladeild',
      cell: '5301',
      lawyer: 'Leifur Runólfsson',
      lawyerPhone: '662-4600',
      lawyerEmail: 'leifur@logmenn.is',
      status: 'Afplánun',
      notes: 'Ofnæmi fyrir fiski',
      medical: { allergies: 'Fiskur', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-002',
      prisonerNumber: '5308-004',
      kennitala: '150279-5678',
      name: 'Vaka Dagsdóttir',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Kvennadeild',
      cell: '5308',
      lawyer: 'Vaka Dagsdóttir',
      lawyerPhone: '848-9608',
      lawyerEmail: 'vaka@logmenn.is',
      status: 'Gæsluvarðhald',
      notes: 'Bjallan bilað – hafið samband við verkstjóra',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Kvenkyns'
    },
    {
      id: 'p-003',
      prisonerNumber: '5314-007',
      kennitala: '220388-2222',
      name: 'Lilja Margrét Olsen',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5314',
      lawyer: 'Lilja Margrét Olsen',
      lawyerPhone: '862-4642',
      status: 'Afplánun',
      notes: 'Sjónvarp bilað / þrifur rækt',
      medical: { allergies: 'Ryk', meds: 'Antihistamín', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Kvenkyns'
    },
    {
      id: 'p-004',
      prisonerNumber: '5312-011',
      kennitala: '120190-0009',
      name: 'Ásta Sóllilja',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5312',
      lawyer: 'Sverrir Arnarson',
      lawyerPhone: '771-1122',
      lawyerEmail: 'sverrir@logmenn.is',
      status: 'Gæsluvarðhald',
      notes: 'Viðkvæm fyrir lyktarefnum',
      medical: { allergies: 'Ilmefni', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 2,
      kyn: 'Kvenkyns'
    },
    {
      id: 'p-005',
      prisonerNumber: '5305-003',
      kennitala: '010175-1111',
      name: 'Bjartur Guðmundsson',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Karladeild',
      cell: '5305',
      lawyer: 'Hrefna Hauksdóttir',
      lawyerPhone: '780-3344',
      status: 'Afplánun',
      notes: 'Sykursýki II',
      medical: { allergies: '—', meds: 'Metformin', risks: 'Blóðsykursföll' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-006',
      prisonerNumber: '5310-008',
      kennitala: '090284-2222',
      name: 'Gvendur Ketilsson',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Karladeild',
      cell: '5310',
      lawyer: 'Tinna Guðrún',
      lawyerPhone: '690-7788',
      lawyerEmail: 'tinna@logmenn.is',
      status: 'Afplánun',
      notes: 'Bið um læknistíma vikulega',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-007',
      prisonerNumber: '5302-014',
      kennitala: '230393-3333',
      name: 'Rósa Ingibjörg',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5302',
      lawyer: 'Aron Gíslason',
      lawyerPhone: '661-9900',
      status: 'Einangrun',
      notes: 'Ofnæmi: Hnetur',
      medical: { allergies: 'Hnetur', meds: 'Adrenalínpenni', risks: 'Ofnæmislost' },
      photoUrl: '',
      recentIncidents7d: 3,
      kyn: 'Kvenkyns'
    },
    {
      id: 'p-008',
      prisonerNumber: '5307-019',
      kennitala: '110172-4444',
      name: 'Nonni Jónsson',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Karladeild',
      cell: '5307',
      lawyer: 'Elísabet Þórarinsdóttir',
      lawyerPhone: '772-5566',
      status: 'Afplánun',
      notes: 'Gleraugu brotin – pöntun í gangi',
      medical: { allergies: '—', meds: 'Blóðþrýstingslyf', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-009',
      prisonerNumber: '5316-002',
      kennitala: '300489-5555',
      name: 'Sólveig Hrefna',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5316',
      lawyer: 'Snorri Þráinsson',
      lawyerPhone: '775-8899',
      lawyerEmail: 'snorri@logmenn.is',
      status: 'Gæsluvarðhald',
      notes: 'Tungumálastuðningur: EN/IS',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Kvenkyns'
    },
    {
      id: 'p-010',
      prisonerNumber: '5319-006',
      kennitala: '050180-6666',
      name: 'Ágúst Einar',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Karladeild',
      cell: '5319',
      lawyer: 'Lilja Sif',
      lawyerPhone: '780-1234',
      status: 'Afplánun',
      notes: 'Fæði: Grænmetisfæði',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-011',
      prisonerNumber: '5304-017',
      kennitala: '141290-7777',
      name: 'Guðmundur Kári',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Karladeild',
      cell: '5304',
      lawyer: 'Berglind Ósk',
      lawyerPhone: '696-7000',
      status: 'Gæsluvarðhald',
      notes: 'Forðast sterk hljóð (heyrnartæki)',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 2,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-012',
      prisonerNumber: '5318-012',
      kennitala: '201279-8888',
      name: 'Þórhildur Ragna',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5318',
      lawyer: 'Hlynur Magnússon',
      lawyerPhone: '820-5565',
      status: 'Afplánun',
      notes: 'Hreyfing: Sjóntaugasjúkdómur (létt verkefni)',
      medical: { allergies: '—', meds: 'Augndropar', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Kvenkyns'
    },
    {
      id: 'p-013',
      prisonerNumber: '5311-013',
      kennitala: '110181-9999',
      name: 'Ásgeir Björnsson',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Karladeild',
      cell: '5311',
      lawyer: 'Bryndís Rós',
      lawyerPhone: '661-2233',
      lawyerEmail: 'bryndis@logmenn.is',
      status: 'Afplánun',
      notes: 'Ofnæmi: Þrýstingsmötun',
      medical: { allergies: 'Þrýstingsmötun', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-014',
      prisonerNumber: '5306-015',
      kennitala: '250292-1122',
      name: 'Elín Margrét',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Kvennadeild',
      cell: '5306',
      lawyer: 'Sigurður Páll',
      lawyerPhone: '772-3344',
      status: 'Gæsluvarðhald',
      notes: '—',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Kvenkyns'
    },
    {
      id: 'p-015',
      prisonerNumber: '5320-016',
      kennitala: '030385-2233',
      name: 'Haukur Freyr',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Karladeild',
      cell: '5320',
      lawyer: 'Guðrún Elfa',
      lawyerPhone: '690-4455',
      status: 'Afplánun',
      notes: 'Læknistími: Mánudagar',
      medical: { allergies: '—', meds: 'Verkjalyf', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-016',
      prisonerNumber: '5313-018',
      kennitala: '171186-3344',
      name: 'Birna Sól',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5313',
      lawyer: 'Jóhann Kári',
      lawyerPhone: '661-5566',
      status: 'Gæsluvarðhald',
      notes: 'Tungumál: PL/IS',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Kynsegin'
    },
    {
      id: 'p-017',
      prisonerNumber: '5309-020',
      kennitala: '280478-4455',
      name: 'Kristján Már',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Karladeild',
      cell: '5309',
      lawyer: 'Rakel Sigurbjörg',
      lawyerPhone: '775-6677',
      lawyerEmail: 'rakel@logmenn.is',
      status: 'Afplánun',
      notes: 'Sértækur fæðumatur – glútenaleysi',
      medical: { allergies: 'Glúten', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 2,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-018',
      prisonerNumber: '5321-022',
      kennitala: '190591-5566',
      name: 'Svanhildur Erna',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Kvennadeild',
      cell: '5321',
      lawyer: 'Egill Þórsson',
      lawyerPhone: '780-7788',
      status: 'Gæsluvarðhald',
      notes: '—',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Kvenkyns'
    },
    {
      id: 'p-019',
      prisonerNumber: '5315-024',
      kennitala: '051283-6677',
      name: 'Fannar Örn',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Karladeild',
      cell: '5315',
      lawyer: 'Steinunn Vala',
      lawyerPhone: '662-8899',
      status: 'Afplánun',
      notes: 'Astmi – loftrými nauðsynlegt',
      medical: { allergies: '—', meds: 'Andblæstrartæki', risks: 'Andnauð' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-020',
      prisonerNumber: '5303-026',
      kennitala: '121189-7788',
      name: 'Hanna Björk',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Kvennadeild',
      cell: '5303',
      lawyer: 'Baldur Óskarsson',
      lawyerPhone: '771-9900',
      status: 'Einangrun',
      notes: 'Ofnæmi: Mjólk',
      medical: { allergies: 'Mjólkurafurðir', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 3,
      kyn: 'Kvenkyns'
    },
    {
      id: 'p-021',
      prisonerNumber: '5322-028',
      kennitala: '220676-8899',
      name: 'Oddur Stefán',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Karladeild',
      cell: '5322',
      lawyer: 'Ólöf María',
      lawyerPhone: '690-1122',
      status: 'Afplánun',
      notes: '—',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-022',
      prisonerNumber: '5317-030',
      kennitala: '080494-9900',
      name: 'Þóra Katrín',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5317',
      lawyer: 'Kristinn Baldur',
      lawyerPhone: '661-2244',
      lawyerEmail: 'kristinn@logmenn.is',
      status: 'Gæsluvarðhald',
      notes: 'Geðræn meðferð – samráð við sálfræðing',
      medical: { allergies: '—', meds: 'Þunglyndislyf', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Annað'
    },
    {
      id: 'p-023',
      prisonerNumber: '5304-032',
      kennitala: '150582-0011',
      name: 'Magnús Örn',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Karladeild',
      cell: '5304',
      lawyer: 'Sólveig Anna',
      lawyerPhone: '772-3355',
      status: 'Afplánun',
      notes: 'Hjartasjúkdómur – regluleg eftirlit',
      medical: { allergies: '—', meds: 'Hjartamagnýl', risks: 'Hjartabilun' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-024',
      prisonerNumber: '5323-034',
      kennitala: '301287-1122',
      name: 'Íris Sif',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Kvennadeild',
      cell: '5323',
      lawyer: 'Árni Þór',
      lawyerPhone: '780-4466',
      status: 'Gæsluvarðhald',
      notes: '—',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 2,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-025',
      prisonerNumber: '5320-036',
      kennitala: '180773-2233',
      name: 'Gunnar Atli',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Karladeild',
      cell: '5320',
      lawyer: 'Hrefna Lind',
      lawyerPhone: '662-5577',
      status: 'Afplánun',
      notes: 'Sértækur fæðumatur – Halal',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-026',
      prisonerNumber: '5308-038',
      kennitala: '070690-3344',
      name: 'Drífa Helga',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Kvennadeild',
      cell: '5308',
      lawyer: 'Þorsteinn Einar',
      lawyerPhone: '775-6688',
      status: 'Gæsluvarðhald',
      notes: 'Ofnæmi: Penicillín',
      medical: { allergies: 'Penicillín', meds: '—', risks: 'Ofnæmislost' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-027',
      prisonerNumber: '5324-040',
      kennitala: '240884-4455',
      name: 'Sindri Ágúst',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Karladeild',
      cell: '5324',
      lawyer: 'Sigríður Björg',
      lawyerPhone: '690-7799',
      lawyerEmail: 'sigridur@logmenn.is',
      status: 'Afplánun',
      notes: '—',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-028',
      prisonerNumber: '5321-042',
      kennitala: '160379-5566',
      name: 'Valgerður Ósk',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5321',
      lawyer: 'Friðrik Már',
      lawyerPhone: '661-8800',
      status: 'Einangrun',
      notes: 'Epilepsía – forðast strjúk ljós',
      medical: { allergies: '—', meds: 'Flogaveikilyf', risks: 'Flog' },
      photoUrl: '',
      recentIncidents7d: 3,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-029',
      prisonerNumber: '5305-044',
      kennitala: '090192-6677',
      name: 'Einar Þór',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Karladeild',
      cell: '5305',
      lawyer: 'Kolbrún Lilja',
      lawyerPhone: '772-9911',
      status: 'Afplánun',
      notes: '—',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-030',
      prisonerNumber: '5325-046',
      kennitala: '040586-7788',
      name: 'Sigrún Elísabet',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Kvennadeild',
      cell: '5325',
      lawyer: 'Ásgeir Hauksson',
      lawyerPhone: '780-0022',
      status: 'Gæsluvarðhald',
      notes: 'Tungumál: RO/IS',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-031',
      prisonerNumber: '5322-048',
      kennitala: '211177-8899',
      name: 'Ragnar Steinn',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Karladeild',
      cell: '5322',
      lawyer: 'Edda Rós',
      lawyerPhone: '662-1133',
      status: 'Afplánun',
      notes: 'Hreyfihamlaður – aðgengisklef nauðsynlegur',
      medical: { allergies: '—', meds: 'Verkjalyf', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 2,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-032',
      prisonerNumber: '5309-050',
      kennitala: '130493-9900',
      name: 'Anna Lilja',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Kvennadeild',
      cell: '5309',
      lawyer: 'Halldór Ragnar',
      lawyerPhone: '775-2244',
      status: 'Gæsluvarðhald',
      notes: '—',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-033',
      prisonerNumber: '5326-052',
      kennitala: '270281-0011',
      name: 'Kristófer Jón',
      prisonId: 'akureyri',
      prisonName: 'Fangelsið á Akureyri',
      department: 'Karladeild',
      cell: '5326',
      lawyer: 'Birna Lind',
      lawyerPhone: '690-3355',
      status: 'Afplánun',
      notes: 'Ofnæmi: Eggjahvíta',
      medical: { allergies: 'Egg', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-034',
      prisonerNumber: '5323-054',
      kennitala: '191288-1122',
      name: 'Elísabet Sara',
      prisonId: 'holmsheidi',
      prisonName: 'Hólmsheiði',
      department: 'Kvennadeild',
      cell: '5323',
      lawyer: 'Þórður Örn',
      lawyerPhone: '661-4466',
      status: 'Gæsluvarðhald',
      notes: 'Þungun – fylgst reglulega með',
      medical: { allergies: '—', meds: 'Fólínsýra', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 1,
      kyn: 'Karlkyns'
    },
    {
      id: 'p-035',
      prisonerNumber: '5310-056',
      kennitala: '060374-2233',
      name: 'Börkur Hrafn',
      prisonId: 'litla-hraun',
      prisonName: 'Litla-Hraun',
      department: 'Karladeild',
      cell: '5310',
      lawyer: 'Vilborg Anna',
      lawyerPhone: '772-5577',
      status: 'Afplánun',
      notes: '—',
      medical: { allergies: '—', meds: '—', risks: '—' },
      photoUrl: '',
      recentIncidents7d: 0,
      kyn: 'Karlkyns'
    }
  ];

  return data.map(p => ({
    ...p,
    facilityKey: toFacilityKey(p.prisonName),
    photoUrl: p.photoUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(p.name)}`
  }));
}

/* --------------------------------- Page ----------------------------------- */

/* R/Y/G status dot */
function Dot({ count }: { count: number}) {
  const color = count === 0 ? 'bg-green-500' : count === 1 ? 'bg-yellow-500' : 'bg-red-500';
  return <div className={`w-3 h-3 rounded-full ${color}`} title={`${count} atvik síðustu 7 daga`} />;
}

/* Sortable column header */
type SortDirection = 'asc' | 'desc' | null;
function SortHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort
}: {
  label: string;
  sortKey: string;
  currentSort: string | null;
  currentDir: SortDirection;
  onSort: (key: string) => void;
}) {
  const isActive = currentSort === sortKey;
  return (
    <th
      className="text-left p-1.5 md:p-2 font-medium cursor-pointer hover:bg-muted/50 select-none"
      onClick={() => onSort(sortKey)}
    >
      <div className="flex items-center gap-1">
        <span>{label}</span>
        {isActive && (
          <span className="text-xs">{currentDir === 'asc' ? '↑' : '↓'}</span>
        )}
      </div>
    </th>
  );
}

export default function StjoriPage() {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  const directorStats = prisonDataService.getDirectorStats();

  // New: prisoners state
  const [prisoners, setPrisoners] = useState<Prisoner[]>([]);
  const [loadingPrisoners, setLoadingPrisoners] = useState(true);

  // New: filters
  const [prisonFilter, setPrisonFilter] = useState<FacilityKey | 'Allt'>('Allt');
  const [statusFilter, setStatusFilter] = useState<'all' | CustodyStatus>('all');
  const [kynFilter, setKynFilter] = useState<'all' | Kyn>('all');
  const [query, setQuery] = useState('');

  // New: selection / modal
  const [selected, setSelected] = useState<Prisoner | null>(null);

  // Sorting state
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDirection>(null);

  const handleSort = (key: string) => {
    if (sortBy === key) {
      // Toggle direction: asc -> desc -> null
      if (sortDir === 'asc') setSortDir('desc');
      else if (sortDir === 'desc') { setSortBy(null); setSortDir(null); }
    } else {
      setSortBy(key);
      setSortDir('asc');
    }
  };

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

  useEffect(() => {
    const loadPrisoners = async () => {
      try {
        // Swap to: const rows = await prisonDataService.getPrisoners();
        const rows = await getMockPrisoners();

        // Map synthetic photos from photoMap
        const withPhotos = rows.map(p => {
          const mapped = (photoMap as Record<string,string>)[p.id];
          const base = process.env.NEXT_PUBLIC_PHOTO_BASE ?? '';
          const url = mapped ? `${base}${mapped}` : undefined;
          return {
            ...p,
            photoUrl: url || p.photoUrl || `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(p.name)}`,
            syntheticPhoto: Boolean(mapped)
          };
        });

        setPrisoners(withPhotos);
      } catch (e) {
        console.error('Failed to load prisoners:', e);
      } finally {
        setLoadingPrisoners(false);
      }
    };
    loadPrisoners();
  }, []);

  const filteredPrisoners = useMemo(() => {
    const q = query.trim().toLowerCase();
    let filtered = prisoners.filter(p => {
      const matchesPrison = prisonFilter === 'Allt' || p.facilityKey === prisonFilter;
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchesKyn = kynFilter === 'all' || p.kyn === kynFilter;
      const matchesQuery =
        q.length === 0 ||
        p.name.toLowerCase().includes(q) ||
        p.kennitala.replace('-', '').includes(q.replace('-', '')) ||
        p.prisonerNumber.toLowerCase().includes(q);
      return matchesPrison && matchesStatus && matchesKyn && matchesQuery;
    });

    // Apply sorting
    if (sortBy && sortDir) {
      filtered = [...filtered].sort((a, b) => {
        let aVal: any;
        let bVal: any;

        if (sortBy === 'status') {
          // Status dot: 0 (green) < 1 (yellow) < 2+ (red)
          aVal = a.recentIncidents7d ?? 0;
          bVal = b.recentIncidents7d ?? 0;
        } else if (sortBy === 'name') {
          aVal = a.name.toLowerCase();
          bVal = b.name.toLowerCase();
        } else if (sortBy === 'prison') {
          aVal = a.prisonName.toLowerCase();
          bVal = b.prisonName.toLowerCase();
        } else if (sortBy === 'judicialStatus') {
          aVal = a.status;
          bVal = b.status;
        }

        if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [prisoners, prisonFilter, statusFilter, kynFilter, query, sortBy, sortDir]);

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
        </div>
        <Link href="/arsskyrsla">
          <Button className="rounded-2xl" variant="secondary">Ársyfirlit</Button>
        </Link>
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
        {/* <CardHeader>
          <CardTitle>Yfirlit Fangelsa</CardTitle>
        </CardHeader> */}
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">
              Hleður...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs md:text-sm leading-tight">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-1.5 md:p-2 font-medium">Fangelsi</th>
                    <th className="text-left p-1.5 md:p-2 font-medium">Fangar</th>
                    <th className="text-left p-1.5 md:p-2 font-medium">Rými</th>
                    <th className="text-left p-1.5 md:p-2 font-medium">Nýting</th>
                    <th className="text-left p-1.5 md:p-2 font-medium">Starfsmenn</th>
                    <th className="text-left p-1.5 md:p-2 font-medium">Atvik í dag</th>
                    <th className="text-left p-1.5 md:p-2 font-medium">Vikuleg atvik</th>
                    <th className="text-left p-1.5 md:p-2 font-medium">Staða</th>
                  </tr>
                </thead>
                <tbody>
                  {facilities.map((facility) => {
                    const utilization = Math.round((facility.prisoners / facility.capacity) * 100);
                    return (
                      <tr key={facility.id} className="border-b hover:bg-muted/50">
                        <td className="p-1.5 md:p-2 font-medium text-xs md:text-sm">
                          {facility.name}
                        </td>
                        <td className="p-1.5 md:p-2 text-xs md:text-sm">
                          {facility.prisoners}
                        </td>
                        <td className="p-1.5 md:p-2 text-xs md:text-sm">
                          {facility.capacity}
                        </td>
                        <td className="p-1.5 md:p-2">
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
                        <td className="p-1.5 md:p-2 text-xs md:text-sm">
                          {facility.staff}
                        </td>
                        <td className="p-1.5 md:p-2 text-xs md:text-sm">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                            facility.todayIncidents === 0 ? 'bg-success text-success-foreground' :
                            facility.todayIncidents <= 2 ? 'bg-warning text-warning-foreground' :
                            'bg-destructive text-destructive-foreground'
                          }`}>
                            {facility.todayIncidents}
                          </span>
                        </td>
                        <td className="p-1.5 md:p-2 text-xs md:text-sm">
                          <span className={`inline-flex items-center justify-center w-8 h-6 rounded-full text-xs font-medium ${
                            facility.weeklyIncidents <= 5 ? 'bg-success text-success-foreground' :
                            facility.weeklyIncidents <= 10 ? 'bg-warning text-warning-foreground' :
                            'bg-destructive text-destructive-foreground'
                          }`}>
                            {facility.weeklyIncidents}
                          </span>
                        </td>
                        <td className="p-1.5 md:p-2">
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

      {/* Additional Management Cards - Temporarily hidden */}
      {/*
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
      */}

      {/* ----------------------- Prisoner Directory (NEW) ---------------------- */}
      <Card>
        {/* <CardHeader>
          <CardTitle>Fangar – Yfirlit</CardTitle>
        </CardHeader> */}
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div className="w-full md:w-56">
              <label className="text-sm text-muted-foreground">Fangelsi</label>
              <Select value={prisonFilter} onValueChange={(v) => setPrisonFilter(v as FacilityKey | 'Allt')}>
                <SelectTrigger className="mt-1" aria-label="Fangelsi">
                  <SelectValue placeholder="Allt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Allt">Allt</SelectItem>
                  <SelectItem value="holmsheidi">{FACILITY_DISPLAY["holmsheidi"]}</SelectItem>
                  <SelectItem value="sogn">{FACILITY_DISPLAY["sogn"]}</SelectItem>
                  <SelectItem value="kviabryggja">{FACILITY_DISPLAY["kviabryggja"]}</SelectItem>
                  <SelectItem value="litla-hraun">{FACILITY_DISPLAY["litla-hraun"]}</SelectItem>
                  <SelectItem value="other">{FACILITY_DISPLAY["other"]}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-56">
              <label className="text-sm text-muted-foreground">Staða</label>
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Veldu stöðu" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Allt</SelectItem>
                  <SelectItem value="Gæsluvarðhald">Gæsluvarðhald</SelectItem>
                  <SelectItem value="Afplánun">Afplánun</SelectItem>
                  <SelectItem value="Einangrun">Einangrun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full md:w-48">
              <label className="text-sm text-muted-foreground">Kyn</label>
              <Select value={kynFilter} onValueChange={(v) => setKynFilter(v as any)}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Allt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Allt</SelectItem>
                  <SelectItem value="Karlkyns">Karl (Karlkyns)</SelectItem>
                  <SelectItem value="Kvenkyns">Kona (Kvenkyns)</SelectItem>
                  <SelectItem value="Kynsegin">Kvár (Kynsegin)</SelectItem>
                  <SelectItem value="Annað">Annað</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Leit</label>
              <Input
                className="mt-1"
                placeholder="Leita að nafni, kennitölu eða fanganúmeri…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <Button variant="outline" onClick={() => { setPrisonFilter('Allt'); setStatusFilter('all'); setKynFilter('all'); setQuery(''); }}>
              Endurstilla síur
            </Button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="font-medium">Staða (7 dagar):</span>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Engin atvik</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>1 atvik</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>2+ atvik</span>
            </div>
          </div>

          {/* Table */}
          {loadingPrisoners ? (
            <div className="text-center py-8 text-muted-foreground">Hleður…</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-[13px] leading-tight">
                <thead>
                  <tr className="border-b">
                    <SortHeader
                      label="●"
                      sortKey="status"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      onSort={handleSort}
                    />
                    <SortHeader
                      label="Nafn fanga"
                      sortKey="name"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      onSort={handleSort}
                    />
                    <th className="text-left p-1.5 md:p-2 font-medium">Fanganúmer</th>
                    <th className="text-left p-1.5 md:p-2 font-medium">Kennitala</th>
                    <SortHeader
                      label="Fangelsi"
                      sortKey="prison"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      onSort={handleSort}
                    />
                    <th className="text-left p-1.5 md:p-2 font-medium">Klefi</th>
                    <th className="text-left p-1.5 md:p-2 font-medium">Lögmaður</th>
                    <SortHeader
                      label="Staða (dómst.)"
                      sortKey="judicialStatus"
                      currentSort={sortBy}
                      currentDir={sortDir}
                      onSort={handleSort}
                    />
                    <th className="text-left p-1.5 md:p-2 font-medium">Athugasemdir</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPrisoners.map(p => (
                    <tr
                      key={p.id}
                      className="border-b hover:bg-muted/50 cursor-pointer"
                      onClick={() => setSelected(p)}
                    >
                      <td className="p-1.5 md:p-2 text-center">
                        <div className="flex items-center justify-center">
                          <Dot count={p.recentIncidents7d ?? 0} />
                        </div>
                      </td>
                      <td className="p-1.5 md:p-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={p.photoUrl}
                              alt={`Prófílmynd af ${p.name}`}
                            />
                            <AvatarFallback>{p.name.split(' ').map(s => s[0]).join('').slice(0,2)}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="p-1.5 md:p-2 whitespace-nowrap">{p.prisonerNumber}</td>
                      <td className="p-1.5 md:p-2 whitespace-nowrap">{p.kennitala}</td>
                      <td className="p-1.5 md:p-2 whitespace-nowrap">{canonicalFacilityLabel(p.prisonName)}</td>
                      <td className="p-1.5 md:p-2 whitespace-nowrap">{p.cell}</td>
                      <td className="p-1.5 md:p-2">
                        {p.lawyer ?? '—'}
                        {p.lawyerPhone && (
                          <span className="inline-flex gap-1 ml-2 align-middle">
                            <a href={`tel:${p.lawyerPhone}`} aria-label="Hringja í lögmann" className="p-1 rounded hover:bg-gray-100" onClick={(e) => e.stopPropagation()}>
                              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                            </a>
                            <a href={`sms:${p.lawyerPhone}`} aria-label="Senda SMS á lögmann" className="p-1 rounded hover:bg-gray-100" onClick={(e) => e.stopPropagation()}>
                              <MessageSquareText className="h-3.5 w-3.5 text-muted-foreground" />
                            </a>
                          </span>
                        )}
                      </td>
                      <td className="p-1.5 md:p-2">
                        <span className={`px-2 py-1 rounded-full text-[11px] ${STADA_STYLES[p.status] ?? 'bg-gray-100 text-gray-800 ring-1 ring-gray-200'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="p-1.5 md:p-2">{p.notes ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredPrisoners.length === 0 && (
                <div className="text-sm text-muted-foreground py-4">Engar færslur fundust.</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ----------------------------- Details Modal --------------------------- */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.name}</DialogTitle>
                <DialogDescription>Yfirlit um fanga</DialogDescription>
              </DialogHeader>

              <div className="flex gap-6">
                <div className="shrink-0">
                  <Avatar className="h-24 w-24 rounded-xl">
                    <AvatarImage
                      src={selected.photoUrl}
                      alt={`Prófílmynd af ${selected.name}`}
                    />
                    <AvatarFallback className="text-xl">
                      {selected.name.split(' ').map(s => s[0]).join('').slice(0,2)}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <ScrollArea className="h-[320px] w-full pr-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Info label="Fanganúmer" value={selected.prisonerNumber} />
                    <Info label="Kennitala" value={selected.kennitala} />
                    <Info label="Fangelsi" value={canonicalFacilityLabel(selected.prisonName)} />
                    <Info label="Deild" value={selected.department} />
                    <Info label="Klefi" value={selected.cell} />
                    <Info label="Staða" value={selected.status} />

                    {/* Lawyer with contact links */}
                    <div className="space-y-1 col-span-2">
                      <div className="text-xs text-muted-foreground">Lögmaður</div>
                      <div className="text-sm font-medium">{selected.lawyer ?? '—'}</div>
                      {selected.lawyerPhone && (
                        <div className="flex gap-3 mt-1">
                          <a href={`tel:${selected.lawyerPhone}`} className="inline-flex items-center gap-1 text-xs underline hover:text-primary">
                            <Phone className="h-3.5 w-3.5" /> Sími
                          </a>
                          <a href={`sms:${selected.lawyerPhone}`} className="inline-flex items-center gap-1 text-xs underline hover:text-primary">
                            <MessageSquareText className="h-3.5 w-3.5" /> SMS
                          </a>
                        </div>
                      )}
                      {selected.lawyerEmail ? (
                        <div className="flex items-center gap-1 mt-1">
                          <Mail className="h-3.5 w-3.5" />
                          <a href={`mailto:${selected.lawyerEmail}`} className="text-xs underline hover:text-primary">{selected.lawyerEmail}</a>
                          <span className="text-xs text-muted-foreground">— Netfang skráð.</span>
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground mt-1">Netfang vantar.</div>
                      )}
                    </div>

                    <Info label="Athugasemdir" value={selected.notes ?? '—'} />
                    <Info label="Ofnæmi" value={selected.medical?.allergies ?? '—'} />
                    <Info label="Lyf" value={selected.medical?.meds ?? '—'} />
                    <Info label="Áhætta" value={selected.medical?.risks ?? '—'} />
                  </div>
                </ScrollArea>
              </div>

              {/* Status Legend */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                <span className="font-medium">Staða (7 dagar):</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Engin atvik</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>1 atvik</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span>2+ atvik</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Loka</Button>
                <Button>Opna málaskrá</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------ Small helpers ----------------------------- */

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium">{value ?? '—'}</div>
    </div>
  );
}