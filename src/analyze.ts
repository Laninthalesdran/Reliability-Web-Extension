// analyze.ts — the public API the popup calls. Runs fully client-side.
// Two things, both from the local engine, no network, nothing leaves the machine:
//   1. source profile from the page's domain (state-controlled? satire? bias/validity?)
//   2. leading-language scan of the article text (persuasion technique, structural + symmetric)

import { ReliabilityEngine } from "./engine/engine";
import { sourceIdForHost, normalizeHost } from "./domains";
import { verifiability, verdict, type Verdict } from "./verdict";

const engine = new ReliabilityEngine();

export interface ArticleAnalysis {
  host: string;
  source: any;
  language: ReturnType<ReliabilityEngine["scanLanguage"]>;
  words: number;
  verifiability: number;
  verdict: Verdict;
}

export function analyzeArticle(url: string, text: string): ArticleAnalysis {
  let host = "";
  try { host = normalizeHost(new URL(url).hostname); } catch { /* file:// etc. */ }
  const sid = sourceIdForHost(host);
  const source = sid
    ? engine.checkSource(sid)
    : { found: false, source_id: host, note: "source not in registries — no profile; judge on the evidence" };
  const language = engine.scanLanguage(text || "");
  const words = (text || "").split(/\s+/).filter(Boolean).length;
  const verif = verifiability(text || "", source);
  return { host, source, language, words, verifiability: verif, verdict: verdict(language.score ?? 0, verif, source) };
}

export { engine };
