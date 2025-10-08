export type Status = 'ok' | 'med' | 'watch' | 'iso';

export type Prisoner = { id: string; code: string; status?: Status };

export type Zone = {
  id: string;
  name: string;
  subtitle?: string;
  x: number; y: number; w: number; h: number;
  corner?: 'rounded' | 'square';
  grid?: { cols?: number; rows?: number };
  inmates: Prisoner[];
  footer?: string;
};

export const floorplanViewBox = { w: 1200, h: 680 };

export const zones: Zone[] = [
  { id:'a', name:'A-ÁLMA', subtitle:'10 klefar • Almenn', x: 80, y: 190, w: 300, h: 190, corner:'rounded',
    inmates:[ {id:'a1',code:'BÍ',status:'ok'},{id:'a2',code:'PP',status:'ok'},{id:'a3',code:'GG',status:'ok'},{id:'a4',code:'ÁS',status:'ok'},{id:'a5',code:'HB',status:'med'},
              {id:'a6',code:'A06'},{id:'a7',code:'A07'},{id:'a8',code:'A08'},{id:'a9',code:'A09'},{id:'a10',code:'A10'} ],
    footer:'215 m²' },

  { id:'b', name:'B-ÁLMA', subtitle:'12 klefar • Almenn', x: 450, y: 180, w: 300, h: 210, corner:'rounded',
    inmates:[ {id:'b1',code:'SS',status:'ok'},{id:'b2',code:'KK',status:'ok'},{id:'b3',code:'MÓ',status:'ok'},{id:'b4',code:'SS',status:'ok'},{id:'b5',code:'HB',status:'med'},
              {id:'b6',code:'B06'},{id:'b7',code:'B07'},{id:'b8',code:'B08'},{id:'b9',code:'B09'},{id:'b10',code:'B10'},{id:'b11',code:'B11'},{id:'b12',code:'B12'} ],
    footer:'285 m²' },

  { id:'c', name:'C-ÁLMA', subtitle:'10 klefar • Almenn', x: 820, y: 190, w: 300, h: 190, corner:'rounded',
    inmates:[ {id:'c1',code:'EE',status:'ok'},{id:'c2',code:'HH',status:'ok'},{id:'c3',code:'ÍÍ',status:'watch'},{id:'c4',code:'FB',status:'med'},
              {id:'c5',code:'C05'},{id:'c6',code:'C06'},{id:'c7',code:'C07'},{id:'c8',code:'C08'},{id:'c9',code:'C09'},{id:'c10',code:'C10'} ],
    footer:'215 m²' },

  { id:'iso', name:'EINANGRUN', subtitle:'4 klefar', x: 140, y: 440, w: 210, h: 150, corner:'rounded', grid:{cols:2,rows:2},
    inmates:[ {id:'e1',code:'RB',status:'iso'},{id:'e2',code:'NB',status:'iso'},{id:'e3',code:'E03'},{id:'e4',code:'E04'} ],
    footer:'Einarklefa • 95 m²' },

  { id:'remand', name:'GÆSLUVARÐHALD', subtitle:'4 klefar', x: 870, y: 440, w: 210, h: 150, corner:'rounded', grid:{cols:2,rows:2},
    inmates:[ {id:'g1',code:'ÓÓ',status:'med'},{id:'g2',code:'RR',status:'watch'},{id:'g3',code:'G03'},{id:'g4',code:'G04'} ],
    footer:'Varðhald • 95 m²' },

  // SERVICE ZONES (bottom row)
  { id:'canteen', name:'Matsalur', x: 385, y: 620, w: 150, h: 80, corner:'square',
    inmates:[ {id:'ma1',code:'MA1',status:'ok'},{id:'ma2',code:'MA2',status:'ok'} ] },
  { id:'kitchen', name:'Eldhús', x: 545, y: 620, w: 150, h: 80, corner:'square',
    inmates:[ {id:'el1',code:'EL1',status:'watch'} ] },
  { id:'work',    name:'Vinnustofa', x: 705, y: 620, w: 160, h: 80, corner:'square',
    inmates:[ {id:'vi1',code:'VI1',status:'med'},{id:'vi2',code:'VI2',status:'ok'} ] },
  { id:'clinic',  name:'Heilsugæsla', x: 875, y: 620, w: 170, h: 80, corner:'square',
    inmates:[ {id:'hl1',code:'HL1',status:'ok'} ] },
];
