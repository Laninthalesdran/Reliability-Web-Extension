// verdict.ts — the stoplight. Combines two page-level signals into one glanceable verdict:
//   MANIPULATION  (from the leading-language scan — how hard the text leans on technique)
//   VERIFIABILITY (NEW: can you check it? attribution/evidence density + source flags)
//
//   🟢 GREEN  — low manipulation: reads as informative, roughly safe (still corroborate big claims)
//   🟡 YELLOW — manipulative, but the claims cite checkable sources (mind the spin, verify the facts)
//   🔴 RED    — manipulative AND incapable of being verified (it works you over and you can't check it)
//
// Detected by technique + sourcing structure, applied symmetrically — never a political-lean verdict.

// Attribution / evidence cues — their density says how checkable the claims are.
const ATTRIBUTION = [
  "according to", "said", "told", "reported", "wrote", "statement", "spokesperson",
  "official", "officials", "study", "studies", "data", "research", "survey", "court",
  "document", "documents", "records", "filing", "cited", "confirmed", "announced",
  "testified", "quoted", "sources", "evidence",
];

const MANIP_HI = 0.25;   // threshold for "manipulative"
const VERIF_LO = 0.35;   // threshold for "incapable of being verified"

export interface Sourcing { score: number; cues: number; capped: boolean; }

export function verifiability(text: string, source: any): Sourcing {
  if (source?.self_declared_nonfactual) return { score: 0, cues: 0, capped: false };
  const low = " " + (text || "").toLowerCase() + " ";
  const words = Math.max((low.match(/[a-z']+/g) || []).length, 1);
  let hits = 0;
  for (const m of ATTRIBUTION) {
    const re = new RegExp("(?<![a-z])" + m.replace(/ /g, "\\s+") + "(?![a-z])", "g");
    hits += (low.match(re) || []).length;
  }
  hits += Math.floor(((text || "").match(/"/g) || []).length / 2); // direct quotes
  const per100 = (hits * 100) / Math.max(words, 50);
  let v = 1 - Math.exp(-0.6 * per100);
  // a direct state instrument can't be independently verified at face value — cap it
  let capped = false;
  if (source?.state_media?.control_type === "state-instrument" && v > 0.3) { v = 0.3; capped = true; }
  return { score: Math.round(v * 1000) / 1000, cues: hits, capped };
}

export interface Verdict { light: "green" | "yellow" | "red"; label: string; reason: string; }

export function verdict(manip: number, verif: number, source: any): Verdict {
  if (source?.self_declared_nonfactual) {
    return { light: "red", label: "Not factual",
      reason: "Self-declared satire/parody — incapable of being verified as fact." };
  }
  if (manip >= MANIP_HI && verif < VERIF_LO) {
    return { light: "red", label: "Manipulative & hard to verify",
      reason: "Heavy persuasion technique and little verifiable sourcing — it works you over and you can't easily check it." };
  }
  if (manip >= MANIP_HI) {
    return { light: "yellow", label: "Manipulative but checkable",
      reason: "Notable persuasion technique, but the article cites checkable sources — mind the spin, verify the facts." };
  }
  if (verif < VERIF_LO) {
    return { light: "yellow", label: "Low spin, thinly sourced",
      reason: "Little persuasion technique, but few verifiable sources — corroborate before relying on it." };
  }
  return { light: "green", label: "Roughly safe",
    reason: "Low persuasion technique and reasonably sourced — still corroborate big claims." };
}

export { MANIP_HI, VERIF_LO };
