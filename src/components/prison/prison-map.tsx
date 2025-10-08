'use client';
import { useEffect, useMemo, useState } from 'react';
import { zones as baseZones, floorplanViewBox, type Zone } from './floorplan-data';
import { getMockWeather } from './weather-mock';
import InmateMiniModal from './InmateMiniModal';

// ---- LAYOUT HELPERS ----
function computeTopOffset(zs: { y: number }[], targetTop = 36) {
  if (!zs.length) return 0;
  const minY = zs.reduce((m, z) => Math.min(m, z.y), Number.POSITIVE_INFINITY);
  // how much to shift everything up so the topmost zone's y becomes ≈ targetTop
  return Math.max(0, minY - targetTop);
}

type ChipLayout = { x: number; y: number };

function chipGridLayout(
  count: number,
  zoneW: number,
  zoneH: number,
  opts?: { chip?: number; gap?: number; titleLines?: 1 | 2; hasFooter?: boolean }
) {
  const chip = opts?.chip ?? 28;
  const gap = opts?.gap ?? 6;
  const titleLines = opts?.titleLines ?? 2;      // 1 for short tiles (service), 2 for A/B/C
  const hasFooter = opts?.hasFooter ?? true;

  const titleH = titleLines === 2 ? 48 : 26;     // approx text stack height
  const footerH = hasFooter ? 20 : 0;
  const pad = 12;

  const availW = Math.max(0, zoneW - pad * 2);
  const availH = Math.max(0, zoneH - titleH - footerH - pad * 2);

  // Fit as many columns as possible; always at least 1
  const per = chip + gap;
  const cols = Math.max(1, Math.floor((availW + gap) / per));
  const rows = Math.max(1, Math.ceil(count / cols));

  const startX = pad;
  const startY = titleH + pad;

  return { chip, gap, cols, rows, startX, startY, availW, availH };
}

export default function PrisonMap({
  onCreateAtvik,
  onCreateDagbok,
}:{
  onCreateAtvik?: () => void;
  onCreateDagbok?: () => void;
}) {
  // time + current temp only
  const [now, setNow] = useState(new Date());
  useEffect(()=>{ const t=setInterval(()=>setNow(new Date()),60_000); return ()=>clearInterval(t);},[]);
  const wx = getMockWeather(now);

  // compact inmate modal
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState<{id:string|null; code?:string}>({id:null});
  const openFor = (id:string, code?:string)=>{ setSel({id,code}); setOpen(true); };

  const zones = useMemo(
    () => baseZones.filter(z => z.id !== 'admin'),
    []
  );

  const topOffset = useMemo(() => computeTopOffset(zones, 36), [zones]);

  // TEMP dev log so we can see counts:
  useEffect(() => {
    const svc = zones.filter(z => ['canteen','kitchen','work','clinic'].includes(z.id));
    console.log('[service zones]', svc.map(z => `${z.name}=${z.inmates.length}`).join(', '));
  }, [zones]);

  return (
    <div className="relative h-full w-full flex flex-col p-0">
      {/* Top info bar — time + vaktstjóri + temp only */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 mb-0">
        <div className="text-sm">Klukkan: {now.toLocaleTimeString('is-IS',{hour:'2-digit',minute:'2-digit'})} • <span className="text-muted-foreground">Vaktstjóri: Ásta S. Bjartsdóttir</span></div>
        <div className="inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs">
          <span aria-hidden>☁︎</span>
          <span className="text-muted-foreground">{wx.place} núna</span>
          <span className="font-medium">{wx.now.tempC}°C</span>
        </div>
      </div>

      {/* SVG fills the available space, anchored to top-left */}
      <div className="flex-1">
        <svg viewBox={`0 0 ${floorplanViewBox.w} ${floorplanViewBox.h}`} className="w-full h-full" aria-labelledby="mapTitle" preserveAspectRatio="xMinYMin meet">
          <title id="mapTitle">Grunnmynd Fangelsið Hólmsheiði</title>

          {/* Shift everything up by exactly the empty headroom */}
          <g transform={`translate(0, -${topOffset})`}>
            {/* Keep only the zones - no grey frame or corridor bars */}
            {zones.map(z => (
              <ZoneGroup key={z.id} zone={z} onOpen={openFor} />
            ))}
          </g>
        </svg>
      </div>

      {/* footer caption */}
      <div className="pt-1 text-center">
        <h3 className="text-base font-semibold tracking-wide">FANGELSIÐ HÓLMSHEIÐI</h3>
        <p className="text-xs text-muted-foreground">Grunnmynd 2. hæðar • 1:500</p>
      </div>

      {/* Compact modal */}
      <InmateMiniModal
        open={open}
        onOpenChange={setOpen}
        inmateId={sel.id}
        inmateCode={sel.code}
        onCreateAtvik={onCreateAtvik ?? (()=>{})}
        onCreateDagbok={onCreateDagbok ?? (()=>{})}
      />
    </div>
  );
}

function ZoneGroup({ zone, onOpen }:{ zone: Zone; onOpen:(id:string, code?:string)=>void }) {
  const { x, y, w, h } = zone;
  const r = zone.corner === 'square' ? 8 : 16;

  // decide if this is a small service tile
  const isService = ['canteen','kitchen','work','clinic'].includes(zone.id);

  // layout tuned by zone type
  const L = chipGridLayout(
    zone.inmates.length,
    w, h,
    {
      chip: isService ? 24 : 28,        // smaller chip for short tiles
      gap:  isService ? 5  : 6,
      titleLines: isService ? 1 : 2,
      hasFooter: !!zone.footer,
    }
  );

  return (
    <g role="group" aria-label={zone.name}>
      {/* card */}
      <rect x={x} y={y} width={w} height={h} rx={r} className="fill-white stroke-[1.2] stroke-neutral-300 shadow-[0_1px_0_rgba(0,0,0,0.04)]" />
      {/* title */}
      <text x={x + w/2} y={y + 28} textAnchor="middle" className="fill-neutral-800" style={{fontWeight:600,fontSize:18}}>{zone.name}</text>
      {zone.subtitle && <text x={x + w/2} y={y + 48} textAnchor="middle" className="fill-neutral-500" style={{fontSize:13}}>{zone.subtitle}</text>}

      {/* chips in pure SVG */}
      {zone.inmates.map((p, idx) => {
        const col = idx % L.cols;
        const row = Math.floor(idx / L.cols);
        // stop if it would overflow vertically
        if ((row + 1) * (L.chip + L.gap) - L.gap > L.availH) return null;

        const cx = x + L.startX + col * (L.chip + L.gap);
        const cy = y + L.startY + row * (L.chip + L.gap);

        const fill  = p.status==='iso' ? '#FFEAE6' : p.status==='watch' ? '#EEF3FF' : p.status==='med' ? '#FFF7E6' : '#EAF8EF';
        const stroke= p.status==='iso' ? '#FFD2C8' : p.status==='watch' ? '#D5E0FF' : p.status==='med' ? '#FFE2A8' : '#CFE8D7';

        return (
          <g key={p.id} className="cursor-pointer" onClick={() => onOpen(p.id, p.code)}>
            <rect x={cx} y={cy} width={L.chip} height={L.chip} rx={8} fill={fill} stroke={stroke}/>
            <text x={cx + L.chip/2} y={cy + L.chip/2} textAnchor="middle" dominantBaseline="middle"
                  className="fill-neutral-800" style={{fontSize:isService?10:11,fontWeight:500}}>
              {p.code}
            </text>
          </g>
        );
      })}

      {/* footer */}
      {zone.footer && (
        <text x={x + w/2} y={y + h - 14} textAnchor="middle" className="fill-neutral-500" style={{fontSize:12}}>
          {zone.footer}
        </text>
      )}
    </g>
  );
}
