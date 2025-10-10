'use client';

import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

type MonthKey = 'Jan'|'Feb'|'Mar'|'Apr'|'Maí'|'Jún'|'Júl'|'Ágú'|'Sep'|'Okt';
const MONTHS: MonthKey[] = ['Jan','Feb','Mar','Apr','Maí','Jún','Júl','Ágú','Sep','Okt'];

const PRISONERS = [
  { id: 'p1', name: 'Jón Jónsson' },
  { id: 'p2', name: 'Ásta Sól' },
  { id: 'p3', name: 'Nonni Bjartsson' },
];

// ---------- Yearly (mock) ----------
type YearRow = { label: string; values: Record<MonthKey, number> };
const makeVals = (arr: number[]) => {
  const o: Record<MonthKey, number> = {
    Jan:arr[0], Feb:arr[1], Mar:arr[2], Apr:arr[3], Maí:arr[4],
    Jún:arr[5], Júl:arr[6], Ágú:arr[7], Sep:arr[8], Okt:arr[9]
  }; return o;
};
const YEAR_SECTIONS: Array<{ title: string; rows: YearRow[] }> = [
  {
    title:'Heilbrigði',
    rows:[
      { label:'Læknisheimsókn', values: makeVals([0,1,0,1,0,1,0,0,1,1]) },
      { label:'Tannlæknir',     values: makeVals([0,0,0,0,1,0,0,0,0,0]) },
    ]
  },
  {
    title:'Meðferð & Ráðgjöf',
    rows:[
      { label:'Sálfræðiviðtal', values: makeVals([0,0,1,0,1,0,1,2,2,1]) },
      { label:'Félagsráðgjafi', values: makeVals([1,1,1,1,1,1,1,1,1,1]) },
      { label:'Fangaprestur',   values: makeVals([0,1,0,1,0,1,0,1,0,1]) },
    ]
  },
  {
    title:'Nám & Vinna',
    rows:[
      { label:'Vinnuskylda',    values: makeVals([22,19,21,22,20,22,18,21,21,6]) },
      { label:'Nám',            values: makeVals([0,0,0,0,0,0,0,0,8,3]) },
    ]
  },
  {
    title:'Annað',
    rows:[
      { label:'Heimsókn',       values: makeVals([2,2,2,1,2,2,1,2,2,1]) },
      { label:'Símtöl',         values: makeVals([8,9,8,8,10,8,9,8,9,3]) },
      { label:'Útivist / Íþróttir', values: makeVals([31,28,31,30,31,30,31,31,30,9]) },
    ]
  },
];

const REJECTIONS_BY_MONTH: Record<MonthKey, number> = {
  Jan: 0, Feb: 1, Mar: 0, Apr: 2, Maí: 0, Jún: 3, Júl: 0, Ágú: 1, Sep: 2, Okt: 1
};

// ---------- Monthly grid (Sep) ----------
type Status = '' | 'F' | 'H' | 'M' | 'B' | 'U'; // Framkvæmt, Hafnað, Mætti ekki, Boðið, Undanþeginn
const MONTH_DAYS = 30;
const MONTH_ROWS = ['Sálfræðiviðtal','Nám','Vinnuskylda','Heimsókn','Símtöl'] as const;

function genMonthlyRow(seed: number): Status[] {
  // simple deterministic generator per row
  let r = seed;
  const rand = () => (r = (r * 1103515245 + 12345) % 2**31) / 2**31;
  return Array.from({length: MONTH_DAYS}, () => {
    const p = rand();
    if (p < 0.16) return 'F';
    if (p < 0.22) return 'H';
    if (p < 0.28) return 'M';
    if (p < 0.34) return 'B';
    if (p < 0.37) return 'U';
    return '';
  });
}

const MONTHLY_DATA: Record<typeof MONTH_ROWS[number], Status[]> = {
  'Sálfræðiviðtal': genMonthlyRow(7),
  'Nám':            genMonthlyRow(11),
  'Vinnuskylda':    genMonthlyRow(23),
  'Heimsókn':       genMonthlyRow(29),
  'Símtöl':         genMonthlyRow(31),
};

const statusLabel: Record<Exclude<Status, ''>, string> = {
  F: 'Framkvæmt', H: 'Hafnað', M: 'Mætti ekki', B: 'Boðið', U: 'Undanþeginn'
};

// ---------- Weekly (chips) ----------
type WeekRow = { d: string; t: string; cat: string; act: string; desc: string; st: Exclude<Status, ''> };
const WEEK_ROWS: WeekRow[] = [
  { d:'8. sep', t:'09:00', cat:'Vinna',      act:'Vinnuskylda í trésmíði', desc:'Vinnudagur samkvæmt áætlun.', st:'F' },
  { d:'8. sep', t:'14:00', cat:'Nám',        act:'Íslenskukennsla',        desc:'Mætti á réttum tíma og tók virkan þátt.', st:'F' },
  { d:'9. sep', t:'10:15', cat:'Beiðni',     act:'Beiðni um læknisþjónustu',desc:'Óskaði eftir lækni vegna vægra einkenna.', st:'B' },
  { d:'10. sep',t:'11:00', cat:'Meðferð',    act:'Sálfræðiviðtal',         desc:'Bókað viðtal.', st:'F' },
  { d:'11. sep',t:'09:00', cat:'Heilbrigði', act:'Læknisheimsókn',         desc:'Hitti lækni.', st:'U' },
  { d:'12. sep',t:'13:00', cat:'Vinna',      act:'Ræsting á deild',        desc:'Föstudagsþrif.', st:'F' },
  { d:'14. sep',t:'10:00', cat:'Fjölskylda', act:'Heimsókn',               desc:'Fjölskylduheimsókn.', st:'H' },
];

// ---------- UI bits ----------
function Pill({ color, children }: { color: 'green'|'red'|'amber'|'blue'|'gray'; children: React.ReactNode }) {
  const map: Record<typeof color, string> = {
    green:'text-emerald-700 border-emerald-300',
    red:'text-red-700 border-red-300',
    amber:'text-amber-700 border-amber-300',
    blue:'text-blue-700 border-blue-300',
    gray:'text-gray-700 border-gray-300',
  };
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs bg-white ${map[color]}`}>
      <span className="inline-block size-2 rounded-full" style={{backgroundColor:'currentColor'}} />
      {children}
    </span>
  );
}

function StatusToken({ s }: { s: Status }) {
  if (!s) return <span className="inline-block w-4 h-[18px]" />;

  // Colors per Icelandic status
  const color: Record<Exclude<Status, ''>, string> = {
    F: 'bg-emerald-600 text-white',  // Framkvæmt
    H: 'bg-red-600 text-white',      // Hafnað
    M: 'bg-amber-500 text-black',    // Mætti ekki
    B: 'bg-blue-600 text-white',     // Boðið
    U: 'bg-gray-400 text-black',     // Undanþeginn
  };

  // Tooltip / accessibility labels
  const labels: Record<Exclude<Status, ''>, string> = {
    F: 'Framkvæmt',
    H: 'Hafnað',
    M: 'Mætti ekki',
    B: 'Boðið',
    U: 'Undanþeginn',
  };

  return (
    <span
      className={`inline-flex items-center justify-center w-[20px] h-[20px] rounded-md text-[12px] font-semibold ${color[s]}`}
      title={labels[s]}
      aria-label={labels[s]}
    >
      {s}
    </span>
  );
}

function YearTable() {
  return (
    <div className="overflow-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 sticky top-0 z-10">
          <tr>
            <th className="text-left p-2 w-[280px]">Þjónusta / Virkni</th>
            {MONTHS.map(m => (
              <th key={m} className="p-2 text-center">
                <div className="inline-flex items-center gap-2">
                  <span className="font-semibold">{m}</span>
                  <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] text-white ${REJECTIONS_BY_MONTH[m] ? 'bg-red-600' : 'bg-gray-300 text-gray-800'}`}>
                    {REJECTIONS_BY_MONTH[m]}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {YEAR_SECTIONS.map(section => (
            <>
              <tr key={section.title} className="bg-blue-50/60">
                <td className="p-2 font-semibold" colSpan={MONTHS.length+1}>{section.title}</td>
              </tr>
              {section.rows.map(row => (
                <tr key={row.label} className="even:bg-muted/10">
                  <td className="p-2">{row.label}</td>
                  {MONTHS.map(m => (
                    <td key={m} className="p-2 text-center tabular-nums">{row.values[m]}</td>
                  ))}
                </tr>
              ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthGrid() {
  return (
    <div className="overflow-auto rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/40 sticky top-0 z-10">
          <tr>
            <th className="text-left p-2 w-[260px]">Þjónusta / Virkni</th>
            {Array.from({length: 30}).map((_, i) => (
              <th key={i} className="p-1 text-center w-7">{i+1}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {MONTH_ROWS.map((label) => (
            <tr key={label} className="even:bg-muted/10">
              <td className="p-2">{label}</td>
              {MONTHLY_DATA[label].map((s, i) => (
                <td key={i} className="p-1 text-center">
                  <StatusToken s={s} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function MonthSummaries() {
  const lines = MONTH_ROWS.map(label => {
    const statuses = MONTHLY_DATA[label];
    const F = statuses.filter(s=>s==='F').length;
    const H = statuses.filter(s=>s==='H').length;
    const M = statuses.filter(s=>s==='M').length;
    const B = statuses.filter(s=>s==='B').length;
    const U = statuses.filter(s=>s==='U').length;
    return { label, F, H, M, B, U };
  });
  return (
    <div className="mt-3 border-t pt-2">
      {lines.map(({label,F,H,M,B,U})=>(
        <div key={label} className="text-sm my-1">
          <span className="font-medium">{label}:</span>{' '}
          <span className="text-emerald-700">Framkvæmt {F}</span>{' • '}
          <span className="text-red-700">Hafnað {H}</span>{' • '}
          <span className="text-amber-700">Mætti ekki {M}</span>{' • '}
          <span className="text-blue-700">Boðið {B}</span>{' • '}
          <span className="text-gray-700">Undanþeginn {U}</span>
        </div>
      ))}
    </div>
  );
}

function WeekTable() {
  const totals = {
    F: WEEK_ROWS.filter(r=>r.st==='F').length,
    H: WEEK_ROWS.filter(r=>r.st==='H').length,
    M: WEEK_ROWS.filter(r=>r.st==='M').length,
    B: WEEK_ROWS.filter(r=>r.st==='B').length,
    U: WEEK_ROWS.filter(r=>r.st==='U').length,
  };
  return (
    <>
      <div className="flex flex-wrap gap-2 mb-2">
        <Pill color="red">Hafnað: {totals.H}</Pill>
        <Pill color="green">Framkvæmt: {totals.F}</Pill>
        <Pill color="amber">Mætti ekki: {totals.M}</Pill>
        <Pill color="blue">Boðið: {totals.B}</Pill>
        <Pill color="gray">Undanþeginn: {totals.U}</Pill>
      </div>
      <div className="overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 sticky top-0 z-10">
            <tr>
              <th className="p-2 text-left">Dagsetning</th>
              <th className="p-2 text-left">Tími</th>
              <th className="p-2 text-left">Flokkur</th>
              <th className="p-2 text-left">Aðgerð/Atvik</th>
              <th className="p-2 text-left">Lýsing</th>
              <th className="p-2 text-left">Staða</th>
            </tr>
          </thead>
          <tbody>
            {WEEK_ROWS.map((r, idx)=>(
              <tr key={idx} className="even:bg-muted/10">
                <td className="p-2">{r.d}</td>
                <td className="p-2">{r.t}</td>
                <td className="p-2">{r.cat}</td>
                <td className="p-2">{r.act}</td>
                <td className="p-2">{r.desc}</td>
                <td className="p-2">
                  <span className={
                    r.st==='F' ? 'bg-emerald-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold' :
                    r.st==='H' ? 'bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold' :
                    r.st==='M' ? 'bg-amber-500 text-black px-2 py-0.5 rounded-full text-xs font-semibold' :
                    r.st==='B' ? 'bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold' :
                                 'bg-gray-400 text-black px-2 py-0.5 rounded-full text-xs font-semibold'
                  }>
                    {statusLabel[r.st]}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function SkyrslurPage() {
  const [prisonerId, setPrisonerId] = useState('p1');
  const prisoner = useMemo(()=> PRISONERS.find(p=>p.id===prisonerId)?.name ?? '', [prisonerId]);
  const [from, setFrom] = useState('2025-01-01');
  const [to, setTo]   = useState('2025-10-09');

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-bold font-headline">
          Skýrsla vegna yfirferðar á afplánun — Mál nr. 2025-015
        </h1>
        <p className="text-muted-foreground">Veldu fanga og tímabil til að sýna samantekt.</p>
      </div>

      <Card>
        <CardContent className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
          <div>
            <div className="text-sm font-medium mb-1">Fangi</div>
            <Select value={prisonerId} onValueChange={setPrisonerId}>
              <SelectTrigger><SelectValue placeholder="Veldu fanga" /></SelectTrigger>
              <SelectContent>
                {PRISONERS.map(p=><SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">Frá</div>
            <Input type="date" value={from} onChange={(e)=>setFrom(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <div className="text-sm font-medium mb-1">Til</div>
              <Input type="date" value={to} onChange={(e)=>setTo(e.target.value)} />
            </div>
            <Button className="self-end">Uppfæra</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>1. Ársyfirlit yfir veitta þjónustu og þátttöku — {prisoner}</span>
            <Badge variant="outline">Árið 2025</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Tölur í reitum sýna fjölda skráninga í mánuði. Rauður hringur við mánuð = fjöldi hafnana (mock).
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <YearTable />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Mánaðaryfirlit: september 2025</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Pill color="green">Framkvæmt (F)</Pill>
            <Pill color="red">Hafnað (H)</Pill>
            <Pill color="amber">Mætti ekki (M)</Pill>
            <Pill color="blue">Boðið (B)</Pill>
            <Pill color="gray">Undanþeginn (U)</Pill>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <MonthGrid />
          <MonthSummaries />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Vikuskýrsla: vika 37 (8.–14. sep 2025)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <WeekTable />
        </CardContent>
      </Card>
    </div>
  );
}
