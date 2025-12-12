/**
 * Mock prisoner history data generator for timeline
 */

export type TimelineEventType = "Atvik" | "Mál" | "Skjal" | "Flutningur" | "Heilsufar" | "Heimsókn";
export type Severity = "Low" | "Medium" | "High";

export interface TimelineEvent {
  id: string;
  ts: string; // ISO timestamp
  type: TimelineEventType;
  severity: Severity;
  title: string;
  summary: string;
  tags: string[];
  major?: boolean;
  caseId?: string;
  docId?: string;
}

export interface CaseItem {
  id: string;
  title: string;
  type: string;
  status: "Opið" | "Í vinnslu" | "Lokað";
  priority: "Lágt" | "Miðlungs" | "Hátt";
  opened: string;
  updated: string;
}

export interface DocItem {
  id: string;
  title: string;
  type: string;
  date: string;
  confidentiality: "Opið" | "Innra" | "Trúnaðarmál";
  size: string;
}

export interface PlanItem {
  id: string;
  task: string;
  status: "Lokið" | "Í gangi" | "Áætlað";
  dueDate?: string;
}

export interface PrisonerHistory {
  events: TimelineEvent[];
  cases: CaseItem[];
  documents: DocItem[];
  plan: PlanItem[];
}

const EVENT_TITLES: Record<TimelineEventType, string[]> = {
  "Atvik": [
    "Agalagabrot - óæskileg hegðun",
    "Ágreiningur við starfsfólk",
    "Óheimil virkni",
    "Hávær hegðun",
    "Brot á reglum kaffistofu",
    "Ofbeldi gagnvart öðrum fanga",
    "Reyndi að koma efnum inn",
    "Þreat gagnvart starfsfólki",
    "Rof í klefi",
    "Fanga veik - fluttur í einangrun"
  ],
  "Mál": [
    "Mál opnað - agalagabrot",
    "Rannsókn hafin",
    "Úttekt á málsatvikum",
    "Fundur með lögmanni",
    "Dómur uppkveðinn",
    "Áfrýjun lögð fram",
    "Endurskoðun máls",
    "Kvörtun frá fanga",
    "Álit kynnt",
    "Mál lokað"
  ],
  "Skjal": [
    "Dómskjal móttekið",
    "Læknisvottorð skráð",
    "Skýrsla vaktmanns",
    "Bréf frá lögmanni",
    "Heilbrigðismat",
    "Samningur undirritaður",
    "Úttektarskýrsla",
    "Flutningsskjal útbúið",
    "Yfirlitsskýrsla gerð",
    "Vottorð útgefið"
  ],
  "Flutningur": [
    "Flutningur milli deilda",
    "Flutningur til Hólmsheiði",
    "Flutningur til Litla-Hraun",
    "Flutningur til Kópavogs",
    "Útskrift áætluð",
    "Innritun frá öðru fangelsi",
    "Bráðabirgðaflutningur",
    "Flutningur vegna heilsufarsmála",
    "Endurinnritun",
    "Flutningur til sjúkrahúss"
  ],
  "Heilsufar": [
    "Læknisheimsókn",
    "Lyfjagjöf",
    "Ástand metið stöðugt",
    "Bráðaþjónusta kölluð",
    "Tannlæknistími",
    "Geðheilbrigðismat",
    "Lyfjameðferð uppfærð",
    "Eftirlit heilbrigðisstarfs",
    "Læknisferð utan stofnunar",
    "Heilsuvilla skráð"
  ],
  "Heimsókn": [
    "Fundur með fjölskyldu",
    "Heimsókn lögmanns",
    "Símtal við fjölskyldu",
    "Félagslegur fundur",
    "Bréfasending",
    "Vildarheimið samþykkt",
    "Heimsókn afþökkuð",
    "Símahringingar skráð",
    "Vinnuheimild gefin út",
    "Námskeið utanhúss"
  ]
};

const TAGS_POOL = [
  "Agalag", "Heilsa", "Flutningur", "Samskipti", "Ofbeldi",
  "Lyfjameðferð", "Lögfræði", "Fjölskylda", "Einangrun", "Vinnuáætlun",
  "Geðheilsa", "Félagsmál", "Kvörtun", "Dómsmál", "Læknisfræði"
];

function seededRandom(seed: number): () => number {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

export function getPrisonerHistory(prisonerId: string): PrisonerHistory {
  const seed = prisonerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const rand = seededRandom(seed);

  const now = new Date();
  const startDate = new Date(now);
  startDate.setMonth(startDate.getMonth() - (12 + Math.floor(rand() * 6))); // 12-18 months

  // Generate 60-140 events
  const numEvents = 60 + Math.floor(rand() * 80);
  const events: TimelineEvent[] = [];

  // Create bursts: some weeks have many events, others few
  const weekBuckets: number[] = [];
  const numWeeks = Math.ceil((now.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));

  for (let w = 0; w < numWeeks; w++) {
    const burstProbability = rand();
    if (burstProbability > 0.7) {
      weekBuckets.push(Math.floor(rand() * 8) + 3); // 3-10 events
    } else if (burstProbability > 0.4) {
      weekBuckets.push(Math.floor(rand() * 3) + 1); // 1-3 events
    } else {
      weekBuckets.push(0); // no events
    }
  }

  let eventCount = 0;
  const types: TimelineEventType[] = ["Atvik", "Mál", "Skjal", "Flutningur", "Heilsufar", "Heimsókn"];
  const severities: Severity[] = ["Low", "Medium", "High"];

  for (let w = 0; w < weekBuckets.length && eventCount < numEvents; w++) {
    const eventsThisWeek = weekBuckets[w];
    for (let e = 0; e < eventsThisWeek && eventCount < numEvents; e++) {
      const weekStart = new Date(startDate);
      weekStart.setDate(weekStart.getDate() + w * 7);

      const eventDate = new Date(weekStart);
      eventDate.setDate(eventDate.getDate() + Math.floor(rand() * 7));
      eventDate.setHours(6 + Math.floor(rand() * 16), Math.floor(rand() * 60), 0, 0);

      const type = types[Math.floor(rand() * types.length)];
      const severity = severities[Math.floor(rand() * severities.length)];
      const titlePool = EVENT_TITLES[type];
      const title = titlePool[Math.floor(rand() * titlePool.length)];

      const numTags = 1 + Math.floor(rand() * 3);
      const tags: string[] = [];
      for (let t = 0; t < numTags; t++) {
        const tag = TAGS_POOL[Math.floor(rand() * TAGS_POOL.length)];
        if (!tags.includes(tag)) tags.push(tag);
      }

      const major = severity === "High" || (severity === "Medium" && rand() > 0.6);

      events.push({
        id: `evt-${prisonerId}-${eventCount}`,
        ts: eventDate.toISOString(),
        type,
        severity,
        title,
        summary: `${title}. Atvik skráð og meðhöndlað í samræmi við reglur stofnunarinnar.`,
        tags,
        major,
        caseId: type === "Mál" && rand() > 0.5 ? `case-${Math.floor(rand() * 100)}` : undefined,
        docId: type === "Skjal" ? `doc-${Math.floor(rand() * 100)}` : undefined,
      });

      eventCount++;
    }
  }

  events.sort((a, b) => new Date(a.ts).getTime() - new Date(b.ts).getTime());

  // Generate cases
  const numCases = 5 + Math.floor(rand() * 7);
  const cases: CaseItem[] = [];
  for (let i = 0; i < numCases; i++) {
    const opened = new Date(startDate);
    opened.setDate(opened.getDate() + Math.floor(rand() * (numWeeks * 7)));
    const updated = new Date(opened);
    updated.setDate(updated.getDate() + Math.floor(rand() * 30));

    cases.push({
      id: `case-${prisonerId}-${i}`,
      title: [
        "Agalagamál vegna óæskilegrar hegðunar",
        "Heilsufarsmál - lækniseftirlit",
        "Flutningsbeiðni til annarrar stofnunar",
        "Samskiptamál - ágreiningur",
        "Kvörtun vegna þjónustu",
        "Áætlunargerð fyrir úrræði"
      ][Math.floor(rand() * 6)],
      type: ["Agalagabrot", "Heilsumál", "Flutningur", "Samskipti"][Math.floor(rand() * 4)],
      status: ["Opið", "Í vinnslu", "Lokað"][Math.floor(rand() * 3)] as CaseItem["status"],
      priority: ["Lágt", "Miðlungs", "Hátt"][Math.floor(rand() * 3)] as CaseItem["priority"],
      opened: opened.toISOString(),
      updated: updated.toISOString(),
    });
  }

  // Generate documents
  const numDocs = 10 + Math.floor(rand() * 15);
  const documents: DocItem[] = [];
  for (let i = 0; i < numDocs; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + Math.floor(rand() * (numWeeks * 7)));

    documents.push({
      id: `doc-${prisonerId}-${i}`,
      title: [
        "Dómur Héraðsdóms",
        "Læknisvottorð",
        "Skýrsla vaktmanns",
        "Samningur um áætlun",
        "Bréf frá lögmanni",
        "Heilbrigðismat",
        "Flutningsskjal",
        "Úttektarskýrsla"
      ][Math.floor(rand() * 8)],
      type: ["Dómskjal", "Læknisskjal", "Skýrsla", "Samningur"][Math.floor(rand() * 4)],
      date: date.toISOString(),
      confidentiality: ["Opið", "Innra", "Trúnaðarmál"][Math.floor(rand() * 3)] as DocItem["confidentiality"],
      size: `${50 + Math.floor(rand() * 4950)} KB`,
    });
  }

  documents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Generate plan
  const numPlan = 6 + Math.floor(rand() * 9);
  const plan: PlanItem[] = [];
  for (let i = 0; i < numPlan; i++) {
    const dueDate = new Date(now);
    dueDate.setDate(dueDate.getDate() + Math.floor(rand() * 60));

    plan.push({
      id: `plan-${prisonerId}-${i}`,
      task: [
        "Venjuleg dagleg umönnun",
        "Þátttaka í daglegum athöfnum",
        "Regluleg endurskoðun á framgangi",
        "Lækniseftirlit vikulega",
        "Geðheilbrigðisviðtal",
        "Vinnuþjálfun",
        "Félagsleg virkni",
        "Námskeið í samskiptum",
        "Áætlanagerð fyrir útskrift",
        "Tengsl við fjölskyldu"
      ][Math.floor(rand() * 10)],
      status: ["Lokið", "Í gangi", "Áætlað"][Math.floor(rand() * 3)] as PlanItem["status"],
      dueDate: rand() > 0.5 ? dueDate.toISOString() : undefined,
    });
  }

  return {
    events,
    cases,
    documents,
    plan,
  };
}
