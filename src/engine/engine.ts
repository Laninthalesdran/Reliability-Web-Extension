// engine.ts — browser build of the Reliability Engine. Identical logic to the Node/OpenClaw
// engine; the ONLY difference is data is bundled as JSON imports (no fs, no Node deps) so it
// runs fully client-side in the extension. Reliability scoring never leaves the user's machine.

import { defaultSource } from "./types";
import type { SourceRecord, ClaimInput, ResolvedClaim } from "./types";
import { gateEdges, effectivePrior } from "./trustGraph";
import type { Sources } from "./trustGraph";
import * as rhetoric from "./rhetoric";
import * as stateMedia from "./stateMedia";
import { scoreClaim, explain } from "./claimScorer";
import type { ScoreResult } from "./claimScorer";
import { applyToSources, matchesSelfDeclaration } from "./registry";
import type { RegistryEntry } from "./registry";
import { calibrate } from "./calibrate";

import leadingLanguage from "../data/leading_language.json";
import sourcesSeed from "../data/sources_seed.json";
import nonFactualRegistry from "../data/non_factual_registry.json";
import nonFactualPatterns from "../data/non_factual_patterns.json";
import stateMediaRegistry from "../data/state_media_registry.json";

function mergeSource(raw: any): SourceRecord {
  const s = defaultSource(raw.source_id);
  for (const k of Object.keys(raw)) {
    if (k === "validity" || k === "bias" || k === "salience") {
      Object.assign((s as any)[k], raw[k]);
    } else {
      (s as any)[k] = raw[k];
    }
  }
  return s;
}

export class ReliabilityEngine {
  sources: Sources = {};
  patterns: string[] = [];
  registry: Record<string, RegistryEntry> = {};

  constructor() {
    rhetoric.loadLexicon(leadingLanguage as any);
    for (const raw of sourcesSeed as any[]) {
      const s = mergeSource(raw);
      this.sources[s.source_id] = s;
    }
    for (const e of nonFactualRegistry as any[]) {
      this.registry[e.source_id] = e as RegistryEntry;
    }
    this.patterns = (nonFactualPatterns as any).patterns;
    stateMedia.load(stateMediaRegistry as any);
    applyToSources(this.sources, this.registry);
    gateEdges(this.sources);
  }

  scoreClaim(input: ClaimInput): ScoreResult & { explanation: string } {
    const r = scoreClaim(input, this.sources);
    return { ...r, explanation: explain(input.text, r) };
  }

  checkSource(sourceId: string, aboutText?: string) {
    const s = this.sources[sourceId];
    const hit = aboutText ? matchesSelfDeclaration(aboutText, this.patterns) : { hit: false, phrase: null };
    if (!s) {
      return {
        found: false, source_id: sourceId,
        self_declared_nonfactual: hit.hit, self_declaration_match: hit.phrase,
        state_media: stateMedia.info(sourceId),
        effective_prior: aboutText && hit.hit ? 0.05 : 0.3,
        note: "unknown source; cautious default prior",
      };
    }
    return {
      found: true, source_id: sourceId,
      validity: s.validity, bias: s.bias, salience: s.salience,
      genre: s.genre, self_declared_nonfactual: s.self_declared_nonfactual || hit.hit,
      self_declaration: s.self_declaration, self_declaration_match: hit.phrase,
      state_media: stateMedia.info(sourceId),
      effective_prior: Math.round(effectivePrior(this.sources, sourceId) * 1000) / 1000,
    };
  }

  scanLanguage(text: string) {
    return rhetoric.analyze(text);
  }

  checkSelfDeclaration(text: string) {
    return matchesSelfDeclaration(text, this.patterns);
  }

  calibrate(resolved: ResolvedClaim[]) {
    return calibrate(this.sources, resolved);
  }

  /** Bias magnitude from persuasion-technique density — structural, symmetric, never touches validity. */
  rateBias(sourceId: string, claimTexts: string[]) {
    const s = this.sources[sourceId];
    if (!s || claimTexts.length === 0) return null;
    const scores = claimTexts.map((t) => rhetoric.analyze(t).score);
    const mag = scores.reduce((a, b) => a + b, 0) / scores.length;
    s.bias.magnitude = Math.round(mag * 1000) / 1000;
    s.bias.method = "technique-density (leading-language); structural, symmetric; separate from validity";
    return { source_id: sourceId, magnitude: s.bias.magnitude, n: claimTexts.length };
  }
}
