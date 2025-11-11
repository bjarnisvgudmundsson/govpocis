'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';

// Innkoma Modal - Prisoner Intake
interface InkomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InkomModal({ open, onOpenChange }: InkomModalProps) {
  const [formData, setFormData] = useState({
    kennitala: '',
    name: '',
    address: '',
    prison: 'Hólmsheiði',
    ward: 'A',
    cell: '',
    healthChecks: {
      likamsleit: false,
      myndTekin: false,
      heilsufarSkannad: false,
      laknisyfirlit: false
    },
    notes: ''
  });

  // Mock data lookup - in real app this would call an API
  const lookupKennitala = (kennitala: string) => {
    // Remove formatting and check if it's our demo kennitala
    const cleanKennitala = kennitala.replace(/[-\s]/g, '');

    if (cleanKennitala === '2110705959') {
      setFormData(prev => ({
        ...prev,
        name: 'Bjarni Sv. Guðmundsson',
        address: 'Bæjargil 97'
      }));
    }
  };

  // Format kennitala with dash
  const formatKennitala = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Add dash after 6 digits
    if (digits.length <= 6) {
      return digits;
    }
    return `${digits.slice(0, 6)}-${digits.slice(6, 10)}`;
  };

  const handleKennitalaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatKennitala(e.target.value);
    setFormData(prev => ({ ...prev, kennitala: formatted }));

    // Auto-lookup when complete
    if (formatted.length === 11) {
      lookupKennitala(formatted);
    }
  };

  // Get available cells (A06 and A07 are available, others are occupied)
  const getAvailableCells = () => {
    const allCells = ['A01', 'A02', 'A03', 'A04', 'A05', 'A06', 'A07'];
    const occupiedCells = ['A01', 'A02', 'A03', 'A04', 'A05'];
    return allCells.filter(cell => !occupiedCells.includes(cell));
  };

  const availableCells = getAvailableCells();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Innkom form submitted:', formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Innskráning Fanga</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="kennitala">Kennitala</Label>
              <Input
                id="kennitala"
                value={formData.kennitala}
                onChange={handleKennitalaChange}
                placeholder="000000-0000"
                maxLength={11}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">Fullt nafn</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nafn verður sótt úr Þjóðskrá"
                readOnly
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Heimilisfang</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              placeholder="Heimilisfang verður sótt úr Þjóðskrá"
              readOnly
              className="bg-muted"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Fangelsi</Label>
              <Input
                value={formData.prison}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Deild</Label>
              <Input
                value={formData.ward}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>Klefi</Label>
              <Select value={formData.cell} onValueChange={(value) => setFormData(prev => ({ ...prev, cell: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Veldu klefi" />
                </SelectTrigger>
                <SelectContent>
                  {availableCells.map(cell => (
                    <SelectItem key={cell} value={cell}>
                      {cell} (Laus)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Heilsufarsskoðun</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries({
                likamsleit: 'Líkamsleit framkvæmd',
                myndTekin: 'Mynd tekin',
                heilsufarSkannad: 'Heilsufar skannað',
                laknisyfirlit: 'Læknisyfirlit lokið'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={formData.healthChecks[key as keyof typeof formData.healthChecks]}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        healthChecks: { ...prev.healthChecks, [key]: checked }
                      }))
                    }
                  />
                  <Label htmlFor={key}>{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Athugasemdir</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Viðbótarupplýsingar..."
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hætta við
            </Button>
            <Button type="submit">
              Skrá innkomu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Atvik Modal - Incident Reporting
interface AtvikModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AtvikModal({ open, onOpenChange }: AtvikModalProps) {
  const [formData, setFormData] = useState({
    type: '',
    datetime: '',
    prison: '',
    ward: '',
    area: '',
    prisoners: [] as string[],
    description: '',
    reporter: '',
    evidence: {
      photos: false,
      video: false,
      witness: false,
      documents: false
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Atvik form submitted:', formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Skrá Atvik</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tegund atviks</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Veldu tegund" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slagsmal">Slagsmál</SelectItem>
                  <SelectItem value="upptaka">Upptaka</SelectItem>
                  <SelectItem value="slysa">Slys</SelectItem>
                  <SelectItem value="flott">Flótti</SelectItem>
                  <SelectItem value="ofbeldi">Ofbeldi</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="datetime">Dagsetning og tími</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={formData.datetime}
                onChange={(e) => setFormData(prev => ({ ...prev, datetime: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Fangelsi</Label>
              <Select value={formData.prison} onValueChange={(value) => setFormData(prev => ({ ...prev, prison: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Veldu stað" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="holmsheidi">Hólmsheiði</SelectItem>
                  <SelectItem value="kviabryggja">Kvíabryggja</SelectItem>
                  <SelectItem value="sogn">Sogn</SelectItem>
                  <SelectItem value="litla-hraun">Litla Hraun</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Deild</Label>
              <Select value={formData.ward} onValueChange={(value) => setFormData(prev => ({ ...prev, ward: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Veldu deild" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="a-deild">A-deild</SelectItem>
                  <SelectItem value="b-deild">B-deild</SelectItem>
                  <SelectItem value="matsal">Matsal</SelectItem>
                  <SelectItem value="itrotta">Íþróttasal</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="area">Nákvæm staðsetning</Label>
              <Input
                id="area"
                value={formData.area}
                onChange={(e) => setFormData(prev => ({ ...prev, area: e.target.value }))}
                placeholder="T.d. Klefi A-12"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Lýsing atviks</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ítarleg lýsing á atvikinu..."
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label>Skráningaraðili</Label>
            <Select value={formData.reporter} onValueChange={(value) => setFormData(prev => ({ ...prev, reporter: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Veldu starfsmann" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="olafur">Ólafur Kárason Ljósvíkingur</SelectItem>
                <SelectItem value="gudny">Guðný Ólafsdóttir</SelectItem>
                <SelectItem value="magnus">Magnús á Ljósvík</SelectItem>
                <SelectItem value="jon">Jón Hreggviðsson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-4">
            <Label className="text-base font-semibold">Sönnunargögn</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries({
                photos: 'Ljósmyndir teknar',
                video: 'Myndband til staðar',
                witness: 'Vitni til staðar',
                documents: 'Skjöl fylgja'
              }).map(([key, label]) => (
                <div key={key} className="flex items-center space-x-2">
                  <Checkbox
                    id={key}
                    checked={formData.evidence[key as keyof typeof formData.evidence]}
                    onCheckedChange={(checked) => 
                      setFormData(prev => ({
                        ...prev,
                        evidence: { ...prev.evidence, [key]: checked }
                      }))
                    }
                  />
                  <Label htmlFor={key}>{label}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hætta við
            </Button>
            <Button type="submit">
              Skrá atvik
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Aðgerð Modal - Action Recording
interface AdgerdModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AdgerdModal({ open, onOpenChange }: AdgerdModalProps) {
  const [actionType, setActionType] = useState('');
  const [formData, setFormData] = useState({
    datetime: '',
    prisoner: '',
    authorizedBy: '',
    reason: '',
    details: {} as any
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Adgerd form submitted:', { ...formData, actionType });
    onOpenChange(false);
  };

  const renderActionFields = () => {
    switch (actionType) {
      case 'leit':
        return (
          <>
            <div className="space-y-2">
              <Label>Tegund leitar</Label>
              <Select onValueChange={(value) => setFormData(prev => ({ ...prev, details: { ...prev.details, searchType: value } }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Veldu tegund" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hefdbundin">Hefðbundin leit</SelectItem>
                  <SelectItem value="itarleg">Ítarleg leit</SelectItem>
                  <SelectItem value="klefjaleit">Klefjaleit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="results">Niðurstöður</Label>
              <Textarea
                id="results"
                placeholder="Hvað fannst við leitina..."
                rows={3}
                onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, results: e.target.value } }))}
              />
            </div>
          </>
        );
      case 'haldlagning':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="item">Hlutur</Label>
              <Input
                id="item"
                placeholder="Hvað var haldlagt"
                onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, item: e.target.value } }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="storage">Geymsla</Label>
              <Input
                id="storage"
                placeholder="Hvar er hlutur geymdur"
                onChange={(e) => setFormData(prev => ({ ...prev, details: { ...prev.details, storage: e.target.value } }))}
              />
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Skrá Aðgerð</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tegund aðgerðar</Label>
              <Select value={actionType} onValueChange={setActionType}>
                <SelectTrigger>
                  <SelectValue placeholder="Veldu aðgerð" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="leit">Leit</SelectItem>
                  <SelectItem value="haldlagning">Haldlagning</SelectItem>
                  <SelectItem value="adskildnad">Aðskilnaður</SelectItem>
                  <SelectItem value="samskiptatakmorkun">Samskiptatakmörkun</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="datetime">Dagsetning og tími</Label>
              <Input
                id="datetime"
                type="datetime-local"
                value={formData.datetime}
                onChange={(e) => setFormData(prev => ({ ...prev, datetime: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prisoner">Fangi</Label>
            <Input
              id="prisoner"
              value={formData.prisoner}
              onChange={(e) => setFormData(prev => ({ ...prev, prisoner: e.target.value }))}
              placeholder="Nafn eða kennitala fanga"
            />
          </div>

          {renderActionFields()}

          <div className="space-y-2">
            <Label htmlFor="reason">Ástæða</Label>
            <Textarea
              id="reason"
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
              placeholder="Ástæða fyrir aðgerðinni..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="authorizedBy">Heimild</Label>
            <Select value={formData.authorizedBy} onValueChange={(value) => setFormData(prev => ({ ...prev, authorizedBy: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Hver veitti heimild" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fangelsisstjori">Fangelsisstjóri</SelectItem>
                <SelectItem value="vaktastjori">Vaktastjóri</SelectItem>
                <SelectItem value="yfirvordur">Yfirvarðar</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hætta við
            </Button>
            <Button type="submit">
              Skrá aðgerð
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Dagbókarfærsla Modal - Log Entry
interface DagbokarfaerslaModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DagbokarfaerslaModal({ open, onOpenChange }: DagbokarfaerslaModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    prisoner: '',
    description: '',
    priority: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Dagbokarfaersla form submitted:', formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Ný Dagbókarfærsla</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-sm text-muted-foreground">
            Skráð: {new Date().toLocaleString('is-IS')}
          </div>

          <div className="space-y-2">
            <Label>Tegund færslu</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Veldu tegund" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="almennt">Almennt</SelectItem>
                <SelectItem value="atvik">Atvik</SelectItem>
                <SelectItem value="adgerd">Aðgerð</SelectItem>
                <SelectItem value="heimsokn">Heimsókn</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prisoner">Fangi (valfrjálst)</Label>
            <Input
              id="prisoner"
              value={formData.prisoner}
              onChange={(e) => setFormData(prev => ({ ...prev, prisoner: e.target.value }))}
              placeholder="Nafn eða kennitala"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Fyrirsögn</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Stutt lýsing á færslunni"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Lýsing</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Ítarleg lýsing..."
              rows={4}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="priority"
              checked={formData.priority}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, priority: !!checked }))}
            />
            <Label htmlFor="priority">Forgangsatriði</Label>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hætta við
            </Button>
            <Button type="submit">
              Skrá færslu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// Vaktskýrsla Modal - Shift Report
interface VaktskyrslаModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VaktskyrslаModal({ open, onOpenChange }: VaktskyrslаModalProps) {
  const [formData, setFormData] = useState({
    shiftStart: '',
    shiftEnd: '',
    shiftLeader: '',
    totalPrisoners: '',
    incidents: '',
    specialNotes: '',
    nextShiftNotes: '',
    report: `VAKTSKÝRSLA - ${new Date().toLocaleDateString('is-IS')}

VAKTATÍMI: [Tími]
VAKTASTJÓRI: [Nafn]

ALMENNT ÁSTAND:
- Heildarfjöldi fanga: [Fjöldi]
- Fangar í einangrun: [Fjöldi]
- Heilsufarsskoðanir: [Fjöldi]

ATVIK VAKTAR:
- Engin sérstök atvik að skrá
- [Eða lýsing atvika]

AÐGERÐIR:
- Hefðbundnar leitir framkvæmdar
- [Aðrar aðgerðir]

HEIMSÓKNIR:
- [Fjöldi heimsókna og athugasemdir]

NÆSTU VAKT:
- [Mikilvægar upplýsingar fyrir næstu vakt]

UNDIRSKRIFT:
[Nafn vaktastjóra] - ${new Date().toLocaleString('is-IS')}`
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Vaktskýrsla submitted:', formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Vaktskýrsla - {new Date().toLocaleDateString('is-IS')}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shiftStart">Vakt hefst</Label>
              <Input
                id="shiftStart"
                type="time"
                value={formData.shiftStart}
                onChange={(e) => setFormData(prev => ({ ...prev, shiftStart: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shiftEnd">Vakt endar</Label>
              <Input
                id="shiftEnd"
                type="time"
                value={formData.shiftEnd}
                onChange={(e) => setFormData(prev => ({ ...prev, shiftEnd: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Vaktastjóri</Label>
            <Select value={formData.shiftLeader} onValueChange={(value) => setFormData(prev => ({ ...prev, shiftLeader: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Veldu vaktastjóra" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="olafur">Ólafur Kárason Ljósvíkingur</SelectItem>
                <SelectItem value="gudny">Guðný Ólafsdóttir</SelectItem>
                <SelectItem value="magnus">Magnús á Ljósvík</SelectItem>
                <SelectItem value="jon">Jón Hreggviðsson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalPrisoners">Heildarfjöldi fanga</Label>
              <Input
                id="totalPrisoners"
                value={formData.totalPrisoners}
                onChange={(e) => setFormData(prev => ({ ...prev, totalPrisoners: e.target.value }))}
                placeholder="124"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="incidents">Atvik í vakt</Label>
              <Input
                id="incidents"
                value={formData.incidents}
                onChange={(e) => setFormData(prev => ({ ...prev, incidents: e.target.value }))}
                placeholder="3"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialNotes">Sérstakar athugasemdir</Label>
            <Textarea
              id="specialNotes"
              value={formData.specialNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, specialNotes: e.target.value }))}
              placeholder="Athugasemdir um sérstaka atburði, aðstæður eða atriði..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextShiftNotes">Skilaboð fyrir næstu vakt</Label>
            <Textarea
              id="nextShiftNotes"
              value={formData.nextShiftNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, nextShiftNotes: e.target.value }))}
              placeholder="Mikilvægar upplýsingar sem næsta vakt þarf að vita..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="report">Vaktskýrsla (Rich Text)</Label>
            <Textarea
              id="report"
              value={formData.report}
              onChange={(e) => setFormData(prev => ({ ...prev, report: e.target.value }))}
              rows={15}
              className="font-mono text-sm"
              placeholder="Ítarleg vaktskýrsla..."
            />
            <p className="text-xs text-muted-foreground">
              Þú getur breytt sniðmátinu að vild. Notaðu Line breaks fyrir nýjar línur.
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Hætta við
            </Button>
            <Button type="submit">
              Skila vaktskýrslu
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}