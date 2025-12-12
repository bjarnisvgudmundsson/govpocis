/**
 * External summary generator
 * Creates sanitized summaries for external parties, excluding internal-only information
 */

import type { TimelineEvent, CaseItem } from './mockPrisonerHistory';

export interface ExternalSummaryData {
  prisonerName: string;
  prisonerNumber: string;
  facility: string;
  custodyStatus: string;
  summaryDate: string;
  legalStatus: string;
  timelineSummary: string[];
  measures: string[];
}

/**
 * Build an external summary from prisoner data
 * Excludes: staff names, internal notes, sensitive incident details, internal case IDs
 */
export function buildExternalSummary(
  prisoner: {
    name: string;
    prisonerNumber: string;
    prisonName: string;
    status: string;
  },
  events: TimelineEvent[],
  cases: CaseItem[],
  rangeDays: number = 30,
  includeMajorOnly: boolean = true
): ExternalSummaryData {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() - rangeDays);

  // Filter events within range
  let relevantEvents = events.filter(e => new Date(e.ts) >= cutoff);

  // Filter to major events only if requested
  if (includeMajorOnly) {
    relevantEvents = relevantEvents.filter(
      e => e.severity === 'High' || e.major
    );
  }

  // Generate timeline bullet points (sanitized)
  const timelineSummary = relevantEvents.slice(0, 10).map(event => {
    const date = new Date(event.ts).toLocaleDateString('is-IS', { day: 'numeric', month: 'long' });
    const typeLabel = event.type;

    // Generic description - no internal notes or staff names
    return `${date}: ${typeLabel} - ${getSanitizedDescription(event)}`;
  });

  // Generate measures/plan (generic)
  const measures = generatePublicFacingMeasures(prisoner, cases);

  return {
    prisonerName: prisoner.name,
    prisonerNumber: prisoner.prisonerNumber,
    facility: prisoner.prisonName,
    custodyStatus: prisoner.status,
    summaryDate: now.toLocaleDateString('is-IS', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }),
    legalStatus: getLegalStatusDescription(prisoner.status),
    timelineSummary,
    measures,
  };
}

/**
 * Format summary as copyable text
 */
export function formatExternalSummaryText(data: ExternalSummaryData): string {
  const sections = [
    '═══════════════════════════════════════════',
    'SAMANTEKT FYRIR YTRI AÐILA',
    '═══════════════════════════════════════════',
    '',
    `Dagsetning: ${data.summaryDate}`,
    '',
    '───────────────────────────────────────────',
    'GRUNNUPPLÝSINGAR',
    '───────────────────────────────────────────',
    '',
    `Nafn: ${data.prisonerName}`,
    `Fanganúmer: ${data.prisonerNumber}`,
    `Stofnun: ${data.facility}`,
    `Staða: ${data.custodyStatus}`,
    '',
    '───────────────────────────────────────────',
    'LÖGFRÆÐILEG STAÐA',
    '───────────────────────────────────────────',
    '',
    data.legalStatus,
    '',
    '───────────────────────────────────────────',
    'TÍMALÍNA - HELSTU ATRIÐI',
    '───────────────────────────────────────────',
    '',
  ];

  if (data.timelineSummary.length > 0) {
    data.timelineSummary.forEach(item => {
      sections.push(`• ${item}`);
    });
  } else {
    sections.push('Engin veruleg atvik skráð á tímabilinu.');
  }

  sections.push('');
  sections.push('───────────────────────────────────────────');
  sections.push('ÁÆTLUN OG RÁÐSTAFANIR');
  sections.push('───────────────────────────────────────────');
  sections.push('');

  data.measures.forEach(measure => {
    sections.push(`• ${measure}`);
  });

  sections.push('');
  sections.push('═══════════════════════════════════════════');
  sections.push('');
  sections.push('Þessi samantekt er ætluð til afhendingar til ytri aðila');
  sections.push('og inniheldur einungis nauðsynlegar upplýsingar.');
  sections.push('');
  sections.push('Útbúið af: Fangelsismálastofnun Íslands');
  sections.push('');

  return sections.join('\n');
}

// Helper functions

function getSanitizedDescription(event: TimelineEvent): string {
  // Return generic summary
  const genericDescriptions: Record<string, string> = {
    Atvik: 'Atvik skráð og meðhöndlað í samræmi við reglur stofnunarinnar',
    Mál: 'Málsmeðferð í gangi',
    Skjal: 'Skjöl móttekin og skráð',
    Flutningur: 'Flutningur milli deilda eða stofnana',
    Heilsufar: 'Heilsufarsmál í umsjón læknis',
    Heimsókn: 'Heimsókn og samskipti',
  };

  return genericDescriptions[event.type] || event.summary.split('.')[0];
}

function getLegalStatusDescription(status: string): string {
  const descriptions: Record<string, string> = {
    'Afplánun': 'Fangi er í afplánun samkvæmt dómi. Afplánunarferlið er í gangi í samræmi við gildandi lög og reglur.',
    'Gæsluvarðhald': 'Fangi er í gæsluvarðhaldi samkvæmt úrskurði dómara. Áfram er fylgst með málinu í samvinnu við lögbær yfirvöld.',
    'Einangrun': 'Fangi er í einangrun vegna sérstakra aðstæðna. Ástand er endurskoðað reglulega í samræmi við reglur.',
  };

  return descriptions[status] || 'Fangi er í vörslu Fangelsismálastofnunar Íslands.';
}

function generatePublicFacingMeasures(
  prisoner: { status: string },
  cases: CaseItem[]
): string[] {
  const measures: string[] = [];

  // Generic measures based on status
  if (prisoner.status === 'Afplánun') {
    measures.push('Venjuleg dagleg umönnun og eftirlit');
    measures.push('Þátttaka í daglegum athöfnum og virkni');
    measures.push('Regluleg endurskoðun á framgangi');
  } else if (prisoner.status === 'Gæsluvarðhald') {
    measures.push('Sérstakt eftirlit í samræmi við gæsluvarðhald');
    measures.push('Samskipti við lögmann tryggð');
    measures.push('Reglubundin endurskoðun á stöðu máls');
  } else if (prisoner.status === 'Einangrun') {
    measures.push('Náið eftirlit í samræmi við reglur um einangrun');
    measures.push('Dagleg mat á heilsufari');
    measures.push('Endurskoðun á nauðsyn einangrunar á 2-3 daga fresti');
  }

  // Add generic measures based on open cases
  const openCases = cases.filter(c => c.status === 'Opið');
  if (openCases.length > 0) {
    measures.push(`${openCases.length} opin mál í vinnslu hjá stofnuninni`);
  }

  return measures;
}
