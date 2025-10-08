'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { prisonDataService } from '@/lib/prison-data';
import { Button } from '@/components/ui/button';

type Props = {
  open: boolean;
  onOpenChange: (v:boolean)=>void;
  inmateId: string | null;
  inmateCode?: string;
  onCreateAtvik: () => void;
  onCreateDagbok: () => void;
};

export default function InmateMiniModal({ open, onOpenChange, inmateId, inmateCode, onCreateAtvik, onCreateDagbok }: Props) {
  const [loading, setLoading] = useState(false);
  const [d, setD] = useState<any>(null);

  useEffect(() => {
    if (!open || !inmateId) return;
    let live = true;
    (async () => {
      try {
        setLoading(true);
        const res = await prisonDataService.getInmate(inmateId);
        if (live) setD(res);
      } finally { if (live) setLoading(false); }
    })();
    return () => { live = false; };
  }, [open, inmateId]);

  const data = d ?? { name: inmateCode ?? 'Óþekktur', cell:'—', unit:'—', status:'—', notes:[], incidents:[], actions:[], health:[] };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{data.name}</span>
            <span className="text-sm text-muted-foreground">Klefi: {data.cell}</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Deild: {data.unit} • Staða: {data.status}
          </DialogDescription>
        </DialogHeader>

        {loading ? <div className="p-4 text-sm text-muted-foreground">Hleð…</div> : (
          <div className="space-y-3">
            <Section title="Atvik" items={data.incidents} empty="Engin atvik skráð."/>
            <Section title="Aðgerðir" items={data.actions} empty="Engar aðgerðir skráðar."/>
            <Section title="Minnispunktar" items={data.notes} empty="Engir minnispunktar."/>
            <Section title="Heilsa" items={data.health} empty="Engar heilsuathugasemdir."/>
            <div className="flex gap-2 pt-2">
              <Button size="sm" onClick={onCreateAtvik}>Skrá atvik</Button>
              <Button size="sm" variant="secondary" onClick={onCreateDagbok}>Dagbókarfærsla</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Section({title, items, empty}:{title:string; items:any[]; empty:string}) {
  return (
    <section>
      <h4 className="text-sm font-semibold mb-1">{title}</h4>
      {items?.length ? (
        <ul className="space-y-1">
          {items.slice(0,3).map((it:any, i:number)=>(
            <li key={it.id ?? i} className="text-sm">
              <span className="text-muted-foreground">{it.time ?? it.type ?? it.author ?? ''} · </span>
              <span className="font-medium">{it.title ?? it.summary ?? ''}</span>
            </li>
          ))}
        </ul>
      ) : <div className="text-sm text-muted-foreground">{empty}</div>}
    </section>
  );
}
