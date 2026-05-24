import { browser } from "wxt/browser";
import { analyzeArticle } from "../../src/analyze";
import { flagText } from "../../src/engine/stateMedia";
import { MANIP_HI, VERIF_LO, type Verdict } from "../../src/verdict";

const out = document.getElementById("out")!;
const esc = (s: string) => (s || "").replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

function verdictBanner(v: Verdict): string {
  return `<div class="verdict ${v.light}"><div class="dot"></div>` +
    `<div class="txt"><div class="label">${esc(v.label)}</div>` +
    `<div class="reason">${esc(v.reason)}</div></div></div>`;
}

function sourceCard(host: string, src: any): string {
  const lines: string[] = [`<div class="card"><h2>Source — ${esc(host) || "this page"}</h2>`];
  if (src.self_declared_nonfactual) {
    lines.push(`<div class="flag stop">⛔ Self-declared satire/parody — <b>not a factual source.</b></div>`);
  }
  if (src.state_media) {
    const sm = src.state_media;
    const cls = sm.control_type === "public-funded-independent" ? "info" : "warn";
    lines.push(`<div class="flag ${cls}">🏛 ${esc(flagText(sm))}</div>`);
  }
  if (src.found && src.validity) {
    const v = Math.round((src.validity.score ?? 0) * 100);
    const bias = src.bias || {};
    lines.push(`<div class="muted">Validity (accuracy from track record): <b>${v}%</b>` +
      (src.validity.n_resolved ? ` · ${src.validity.n_resolved} resolved claims` : ` · no track record yet`) + `</div>`);
    if (bias.magnitude) {
      lines.push(`<div class="muted">Bias (measured technique/selection, not a lean): ` +
        `magnitude <b>${bias.magnitude}</b>${bias.direction && bias.direction !== "unknown" ? ` · ${esc(bias.direction)}` : ""}</div>`);
    }
  } else if (!src.state_media && !src.self_declared_nonfactual) {
    lines.push(`<div class="flag info">No reputation assigned — by design. We don't hand out source scores; validity is earned from track record. The light above reads this page on its evidence.</div>`);
  }
  return lines.join("") + `</div>`;
}

function languageCard(lang: any, words: number): string {
  const pct = Math.round((lang.score ?? 0) * 100);
  const level = pct >= 60 ? "stop" : pct >= MANIP_HI * 100 ? "warn" : "ok";
  const verdict = pct >= 60 ? "heavy persuasion technique" : pct >= MANIP_HI * 100 ? "some persuasion technique" : "low persuasion technique";
  // Only surface technique chips when density is meaningful. At low manipulation, a few
  // marker words across a long article are almost certainly TOPIC vocabulary (a war story
  // contains "war"/"fear"), not a persuasion pattern — showing them reads as a false accusation.
  const showChips = pct >= MANIP_HI * 100;
  const techs = (lang.top || []).map((t: any) => `<span class="tech">${esc(t.id)} ·${t.hits}</span>`).join("");
  return `<div class="card"><h2>Leading-language scan (${words} words)</h2>` +
    `<div class="bar"><span style="width:${pct}%"></span></div>` +
    `<div class="flag ${level}">Manipulation ${pct}% — ${verdict}. Detected technique, not position; applied symmetrically.</div>` +
    (showChips && techs
      ? `<div class="techs">${techs}</div>`
      : `<div class="muted">No significant technique. (Any charged words at this level are likely the article's subject, not a persuasion pattern.)</div>`) +
    `</div>`;
}

function sourcingCard(sourcing: any, satire: boolean): string {
  if (satire) {
    return `<div class="card"><h2>Sourcing / verifiability</h2>` +
      `<div class="flag stop">Not applicable — self-declared satire isn't meant to be verified as fact.</div></div>`;
  }
  const pct = Math.round((sourcing.score ?? 0) * 100);
  const level = pct >= 65 ? "ok" : pct >= VERIF_LO * 100 ? "warn" : "stop";
  const label = pct >= 65 ? "well-sourced — cites checkable sources"
    : pct >= VERIF_LO * 100 ? "moderately sourced" : "thinly sourced — few verifiable sources";
  const color = pct >= 65 ? "#1c9d4b" : pct >= VERIF_LO * 100 ? "#e2960f" : "#c0392b";
  const cap = sourcing.capped ? " (capped — a state instrument can't be independently verified at face value)" : "";
  return `<div class="card"><h2>Sourcing / verifiability</h2>` +
    `<div class="bar"><span style="width:${pct}%;background:${color}"></span></div>` +
    `<div class="flag ${level}">Verifiability ${pct}% — ${label}${cap}. Found ${sourcing.cues} attribution/quote cue(s) — can you check the claims?</div></div>`;
}

async function run() {
  try {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    if (!tab?.id || !/^https?:/.test(tab.url || "")) {
      out.innerHTML = `<div class="flag info">Open a normal web page (http/https) and click again.</div>`;
      return;
    }
    const [inj] = await browser.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        const el = document.querySelector("article") || document.querySelector("main") || document.body;
        return { url: location.href, text: ((el as HTMLElement)?.innerText || "").slice(0, 20000) };
      },
    });
    const { url, text } = (inj?.result as { url: string; text: string }) || { url: tab.url!, text: "" };
    const a = analyzeArticle(url, text);
    out.innerHTML = verdictBanner(a.verdict)
      + languageCard(a.language, a.words)
      + sourcingCard(a.sourcing, !!a.source.self_declared_nonfactual)
      + sourceCard(a.host, a.source);
  } catch (e) {
    out.innerHTML = `<div class="flag info">Couldn't read this page (some browser/system pages are protected).</div>`;
  }
}

run();
