'use client';
import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { prisonDataService } from '@/lib/prison-data';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import photoMap from '@/app/data/prisonerPhotos.json';

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

  // Get photo URL for prisoner
  const getPrisonerPhotoUrl = (id: string | null) => {
    if (!id) return null;

    // Map floorplan IDs (a1, b2, g3, etc.) to prisoner numeric IDs
    const idMap: Record<string, string> = {
      'a1': '1', 'a2': '2', 'a3': '3', 'a4': '4', 'a5': '5',
      'b1': '6', 'b2': '7', 'b3': '8', 'b4': '9', 'b5': '10',
      'c1': '11', 'c2': '12', 'c3': '13', 'c4': '14',
      'e1': '15', 'e2': '16',
      'g1': '17', 'g2': '18'
    };

    const prisonerId = idMap[id] || id;

    // Convert ID to p-XXX format (e.g., '1' -> 'p-001')
    const paddedId = `p-${prisonerId.padStart(3, '0')}`;
    const mapped = (photoMap as Record<string, string>)[paddedId];
    const base = process.env.NEXT_PUBLIC_PHOTO_BASE ?? '';

    if (mapped) {
      return `${base}${mapped}`;
    }

    // Fallback to initials avatar
    return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(data.name)}`;
  };

  const photoUrl = getPrisonerPhotoUrl(inmateId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {photoUrl && (
              <Avatar className="h-12 w-12 rounded-xl">
                <AvatarImage
                  src={photoUrl}
                  alt={`Mynd af ${data.name}`}
                />
                <AvatarFallback className="rounded-xl">
                  {data.name.split(' ').map((s: string) => s[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
            )}
            <div className="flex flex-col gap-1 flex-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-lg">{data.name}</span>
                <span className="text-sm text-muted-foreground">Klefi: {data.cell}</span>
              </div>
              <div className="text-sm font-normal text-muted-foreground">
                Deild: {data.unit} • Staða: {data.status}
              </div>
            </div>
          </DialogTitle>
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
