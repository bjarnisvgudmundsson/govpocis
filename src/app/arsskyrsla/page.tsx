"use client";

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar,
} from "recharts";

const MOCK = {
  // YTD is now 2025 (current) vs 2024 (previous)
  ytd: {
    currentYear: 2025,
    prevYear: 2024,
    avgInmatesPerDay: { current: 145, previous: 144 },
    avgDetaineesPerDay: { current: 32, previous: 30 },
    electronicMonitoringDays: { current: 5600, previous: 5400 },
    conditionalReleaseRate: { current: 62, previous: 61 },
    newSentences: { current: 1180, previous: 1210 },
    monthly: [
      { m: "Jan", inmates: 145, detainees: 31 },
      { m: "Feb", inmates: 146, detainees: 32 },
      { m: "Mar", inmates: 147, detainees: 32 },
      { m: "Apr", inmates: 145, detainees: 33 },
      { m: "Maí", inmates: 146, detainees: 33 },
      { m: "Jún", inmates: 147, detainees: 32 },
      { m: "Júl", inmates: 146, detainees: 32 },
      { m: "Ágú", inmates: 145, detainees: 31 },
      { m: "Sep", inmates: 145, detainees: 32 },
      { m: "Okt", inmates: 145, detainees: 32 },
      { m: "Nóv", inmates: 145, detainees: 32 },
    ],
    monthlyPrev: [
      { m: "Jan", inmates: 144, detainees: 30 },
      { m: "Feb", inmates: 142, detainees: 31 },
      { m: "Mar", inmates: 145, detainees: 33 },
      { m: "Apr", inmates: 144, detainees: 34 },
      { m: "Maí", inmates: 146, detainees: 35 },
      { m: "Jún", inmates: 147, detainees: 36 },
      { m: "Júl", inmates: 145, detainees: 37 },
      { m: "Ágú", inmates: 144, detainees: 36 },
      { m: "Sep", inmates: 143, detainees: 35 },
      { m: "Okt", inmates: 144, detainees: 36 },
      { m: "Nóv", inmates: 144, detainees: 36 },
    ],
    offenceDistCurrent: [
      { label: "Fíkniefnabrot", value: 44 },
      { label: "Auðgunarbrot", value: 13 },
      { label: "Umferðarlagabrot", value: 7 },
      { label: "Kynferðisbrot", value: 14 },
      { label: "Ofbeldisbrot", value: 10 },
      { label: "Annað", value: 12 },
    ],
    offenceDistPrev: [
      { label: "Fíkniefnabrot", value: 43 },
      { label: "Auðgunarbrot", value: 13 },
      { label: "Umferðarlagabrot", value: 7 },
      { label: "Kynferðisbrot", value: 13 },
      { label: "Ofbeldisbrot", value: 10 },
      { label: "Annað", value: 14 },
    ],
    facilities: [
      { name: "Hólmsheiði", days: 8600 },
      { name: "Litla-Hraun", days: 17200 },
      { name: "Kvíabryggja", days: 7200 },
      { name: "Sogn", days: 7000 },
      { name: "Vernd", days: 6700 },
      { name: "Rafrænt eftirlit", days: 5600 },
    ],
  },
  // Full year stays 2024 vs 2023
  full: {
    currentYear: 2024,
    prevYear: 2023,
    avgInmatesPerDay: { current: 167, previous: 180 },
    avgDetaineesPerDay: { current: 26, previous: 34 },
    electronicMonitoringDays: { current: 5100, previous: 5380 },
    conditionalReleaseRate: { current: 59, previous: 61 },
    newSentences: { current: 1300, previous: 1211 },
    monthly: [
      { m: "Jan", inmates: 162, detainees: 24 },
      { m: "Feb", inmates: 164, detainees: 24 },
      { m: "Mar", inmates: 166, detainees: 25 },
      { m: "Apr", inmates: 166, detainees: 25 },
      { m: "Maí", inmates: 168, detainees: 26 },
      { m: "Jún", inmates: 169, detainees: 27 },
      { m: "Júl", inmates: 168, detainees: 26 },
      { m: "Ágú", inmates: 167, detainees: 26 },
      { m: "Sep", inmates: 166, detainees: 26 },
      { m: "Okt", inmates: 167, detainees: 26 },
      { m: "Nóv", inmates: 168, detainees: 26 },
      { m: "Des", inmates: 167, detainees: 27 },
    ],
    monthlyPrev: [
      { m: "Jan", inmates: 162, detainees: 24 },
      { m: "Feb", inmates: 164, detainees: 24 },
      { m: "Mar", inmates: 166, detainees: 25 },
      { m: "Apr", inmates: 166, detainees: 25 },
      { m: "Maí", inmates: 168, detainees: 26 },
      { m: "Jún", inmates: 169, detainees: 27 },
      { m: "Júl", inmates: 168, detainees: 26 },
      { m: "Ágú", inmates: 167, detainees: 26 },
      { m: "Sep", inmates: 166, detainees: 26 },
      { m: "Okt", inmates: 167, detainees: 26 },
      { m: "Nóv", inmates: 168, detainees: 26 },
      { m: "Des", inmates: 167, detainees: 27 },
    ],
    offenceDistCurrent: [
      { label: "Fíkniefnabrot", value: 42 },
      { label: "Auðgunarbrot", value: 13 },
      { label: "Umferðarlagabrot", value: 7 },
      { label: "Kynferðisbrot", value: 13 },
      { label: "Ofbeldisbrot", value: 10 },
      { label: "Annað", value: 15 },
    ],
    offenceDistPrev: [
      { label: "Fíkniefnabrot", value: 42 },
      { label: "Auðgunarbrot", value: 13 },
      { label: "Umferðarlagabrot", value: 7 },
      { label: "Kynferðisbrot", value: 13 },
      { label: "Ofbeldisbrot", value: 10 },
      { label: "Annað", value: 15 },
    ],
    facilities: [
      { name: "Hólmsheiði", days: 8510 },
      { name: "Litla-Hraun", days: 17095 },
      { name: "Kvíabryggja", days: 7140 },
      { name: "Sogn", days: 6909 },
      { name: "Vernd", days: 6625 },
      { name: "Rafrænt eftirlit", days: 5381 },
    ],
  },
  today: {
    prisonersByFacility: [
      { name: "Hólmsheiði", count: 87 },
      { name: "Litla-Hraun", count: 112 },
      { name: "Kvíabryggja", count: 28 },
      { name: "Sogn", count: 33 },
      { name: "Vernd", count: 40 },
      { name: "Rafrænt eftirlit", count: 52 },
    ],
    casesByType: [
      { label: "Vistun/afplánun", value: 48 },
      { label: "Gæsla", value: 19 },
      { label: "Reynslulausn", value: 14 },
      { label: "Samfélagsþjónusta", value: 22 },
      { label: "Rafr. eftirlit", value: 31 },
      { label: "Annað", value: 9 },
    ],
    statusSplit: [
      { label: "Í vinnslu", value: 38 },
      { label: "Sent/andmæli", value: 11 },
      { label: "Í kæru", value: 3 },
      { label: "Lokið", value: 17 },
    ],
  },
};

type Mode = "ytd" | "full";

function delta(a: number, b: number) {
  const diff = a - b;
  const pct = b === 0 ? 0 : (diff / b) * 100;
  return { diff, pct };
}

const PIE_COLORS = ["#2563eb", "#0ea5e9", "#22c55e", "#eab308", "#ef4444", "#a78bfa"];
const CASE_COLORS = {
  "Í vinnslu": "#eab308",
  "Sent/andmæli": "#7c3aed",
  "Í kæru": "#ef4444",
  "Lokið": "#10b981",
};

function KPI({ label, curr, prev, suffix = "" }:{
  label: string; curr: number; prev: number; suffix?: string;
}) {
  const d = delta(curr, prev);
  const up = d.diff >= 0;
  return (
    <Card className="rounded-2xl shadow-sm">
      <CardContent className="p-4">
        <div className="text-sm text-neutral-500">{label}</div>
        <div className="mt-1 flex items-baseline gap-2">
          <div className="text-2xl font-semibold tabular-nums">
            {curr}{suffix}
          </div>
          <div
            className={`text-sm tabular-nums ${up ? "text-emerald-600" : "text-red-600"}`}
            title={`Fyrra: ${prev}${suffix}`}
          >
            {up ? "▲" : "▼"} {Math.abs(d.pct).toFixed(1)}%
          </div>
        </div>
        <div className="mt-1 text-xs text-neutral-500">
          Fyrra tímabil: {prev}{suffix}
        </div>
      </CardContent>
    </Card>
  );
}

function MeterRow({ label, value, max }:{ label: string; value: number; max: number }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-neutral-700">{label}</span>
        <span className="tabular-nums text-neutral-900 font-medium">{value}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-neutral-200">
        <div
          className="h-2 rounded-full"
          style={{
            width: `${pct}%`,
            background: "linear-gradient(90deg, rgba(37,99,235,1) 0%, rgba(14,165,233,1) 100%)",
          }}
        />
      </div>
    </div>
  );
}

export default function ArsskyrslaPage() {
  const [mode, setMode] = useState<Mode>("ytd");
  const data = mode === "ytd" ? MOCK.ytd : MOCK.full;

  const trendData = useMemo(() => {
    const byMonth: Record<string, {
      m: string; inmates: number; detainees: number; inmatesPrev?: number; detaineesPrev?: number;
    }> = {};
    data.monthly.forEach((p) => (byMonth[p.m] = { ...p }));
    data.monthlyPrev.forEach((p) => {
      byMonth[p.m] = { ...(byMonth[p.m] || p), inmatesPrev: p.inmates, detaineesPrev: p.detainees };
    });
    return Object.values(byMonth);
  }, [data]);

  const maxCasesToday = Math.max(...MOCK.today.casesByType.map((c) => c.value), 1);

  return (
    <div className="min-h-screen bg-neutral-50 font-sans">
      {/* Header */}
      <div className="mx-auto max-w-7xl px-4 pt-6">
        <h1 className="text-2xl font-semibold tracking-tight">Ársyfirlit</h1>
        <p className="text-neutral-600">
          {mode === "ytd"
            ? `${data.currentYear} YTD vs ${data.prevYear} YTD`
            : `${data.currentYear} heilt ár vs ${data.prevYear} heilt ár`}
        </p>

        {/* Toggle */}
        <div className="mb-4 mt-4 flex gap-2">
          <Button variant={mode === "ytd" ? "default" : "outline"} className="rounded-2xl" onClick={() => setMode("ytd")}>
            YTD
          </Button>
          <Button variant={mode === "full" ? "default" : "outline"} className="rounded-2xl" onClick={() => setMode("full")}>
            Heilt ár
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <KPI label="Meðalfjöldi í afplánun á dag" curr={data.avgInmatesPerDay.current} prev={data.avgInmatesPerDay.previous} />
          <KPI label="Meðalfjöldi í gæsluvarðhaldi á dag" curr={data.avgDetaineesPerDay.current} prev={data.avgDetaineesPerDay.previous} />
          <KPI label="Rafrænt eftirlit — dagafjöldi" curr={data.electronicMonitoringDays.current} prev={data.electronicMonitoringDays.previous} />
          <KPI label="Reynslulausn — hlutfall" curr={data.conditionalReleaseRate.current} prev={data.conditionalReleaseRate.previous} suffix="%" />
          <KPI label="Nýir dómþolar" curr={data.newSentences.current} prev={data.newSentences.previous} />
        </div>
      </div>

      {/* Trend chart */}
      <div className="mx-auto max-w-7xl px-4">
        <Card className="mt-6 rounded-2xl shadow-sm">
          <CardContent className="p-4">
            <div className="mb-2 text-sm text-neutral-600">Þróun — {data.currentYear} vs {data.prevYear}</div>
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={trendData}>
                  <XAxis dataKey="m" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="inmates" name={`Afplánun ${data.currentYear}`} stroke="#2563eb" strokeWidth={2} />
                  <Line type="monotone" dataKey="inmatesPrev" name={`Afplánun ${data.prevYear}`} stroke="#2563eb" strokeWidth={2} strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="detainees" name={`Gæslu ${data.currentYear}`} stroke="#0ea5e9" strokeWidth={2} />
                  <Line type="monotone" dataKey="detaineesPrev" name={`Gæslu ${data.prevYear}`} stroke="#0ea5e9" strokeWidth={2} strokeDasharray="4 4" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today section */}
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="mt-8 mb-2 text-lg font-semibold">Staða í dag</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2 text-sm text-neutral-600">Fangar eftir einingu (í dag)</div>
              <div className="h-72">
                <ResponsiveContainer>
                  <BarChart data={MOCK.today.prisonersByFacility} layout="vertical">
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={110} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2563eb" radius={[4,4,4,4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="mb-3 text-sm text-neutral-600">Mál í vinnslu eftir tegund (í dag)</div>
              <div className="space-y-3">
                {MOCK.today.casesByType.map((c) => (
                  <MeterRow key={c.label} label={c.label} value={c.value} max={maxCasesToday} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2 text-sm text-neutral-600">Dreifing stöðu mála (í dag)</div>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={MOCK.today.statusSplit} dataKey="value" nameKey="label" innerRadius={60} outerRadius={100} paddingAngle={2}>
                      {MOCK.today.statusSplit.map((s, idx) => (
                        <Cell key={idx} fill={CASE_COLORS[s.label as keyof typeof CASE_COLORS] ?? PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Offence distribution + Facility days table */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="mb-2 text-sm text-neutral-600">Brot — skipting (%)</div>
              <div className="h-72">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={data.offenceDistCurrent}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                    >
                      {data.offenceDistCurrent.map((_, idx) => (
                        <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => {
                        const prev =
                          data.offenceDistPrev.find((d) => d.label === name)?.value ?? 0;
                        const d = delta(value as number, prev);
                        return [`${value.toFixed(1)}% (Δ ${d.diff.toFixed(1)}%)`, name];
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                Sveimaðu yfir til að sjá samanburð við fyrra tímabil.
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-sm">
            <CardContent className="p-4">
              <div className="mb-3 text-sm text-neutral-600">
                Skipting eftir einingum — dagafjöldi
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-neutral-500">
                      <th className="py-2 pr-4">Eining</th>
                      <th className="py-2 pr-4">{data.currentYear}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.facilities.map((f) => (
                      <tr key={f.name} className="border-t">
                        <td className="py-2 pr-4">{f.name}</td>
                        <td className="py-2 pr-4 tabular-nums">{f.days}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-xs text-neutral-500">
                Gögn eru mönnuð sýnigögn (mock). Skiptið út fyrir raun-API síðar.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="h-10" />
    </div>
  );
}
