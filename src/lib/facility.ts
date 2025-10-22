// Canonical facility mapping for Icelandic prisons
export type FacilityKey = "holmsheidi" | "sogn" | "kviabryggja" | "litla-hraun" | "other";

export const FACILITY_DISPLAY: Record<FacilityKey, string> = {
  "holmsheidi":  "Fangelsið Hólmsheiði",
  "sogn":        "Fangelsið Sogni",
  "kviabryggja": "Fangelsið Kvíabryggju",
  "litla-hraun": "Fangelsið Litla-Hrauni",
  "other":       "Annað",
};

// Accept common raw variants (with/without hyphen, nominative forms, etc.)
const ALIASES: Array<{ test: RegExp; key: FacilityKey }> = [
  { test: /\bh[oó]lmshe[ií]ði\b/i, key: "holmsheidi" },
  { test: /\bsogn(i)?\b/i, key: "sogn" },                         // "Sogn" or "Sogni"
  { test: /\bkvíabrygg(j)?a(u)?\b/i, key: "kviabryggja" },        // Kvíabryggja/Kvíabryggju
  { test: /\blitla[- ]?hraun(i)?\b/i, key: "litla-hraun" },       // Litla Hraun/Litla-Hraun/Litla-Hrauni
];

export function toFacilityKey(input?: string | null): FacilityKey {
  if (!input) return "other";
  const s = String(input).trim();
  for (const { test, key } of ALIASES) {
    if (test.test(s)) return key;
  }
  // Anything else (e.g. "Fangelsið á Akureyri") = "other"
  return "other";
}

export function toFacilityDisplay(key: FacilityKey): string {
  return FACILITY_DISPLAY[key];
}

// Convenience for rendering a raw value as the canonical dative label
export function canonicalFacilityLabel(raw?: string | null): string {
  return toFacilityDisplay(toFacilityKey(raw));
}
