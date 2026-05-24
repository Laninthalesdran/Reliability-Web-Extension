import { browser } from "wxt/browser";
import { analyzeArticle } from "../../src/analyze";
import { flagText } from "../../src/engine/stateMedia";

const out = document.getElementById("out")!;
const esc = (s: string) => (s || "").replace(/[&<>"]/g, (c) =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

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
    lines.push(`<div class="flag info">Not in the registries — no source profile. Judge it on the evidence below.</div>`);
  }
  return lines.join("") + `</div>`;
}

function languageCard(lang: any, words: number): string {
  const pct = Math.round((lang.score ?? 0) * 100);
  const level = pct >= 60 ? "stop" : pct >= 25 ? "warn" : "ok";
  const verdict = pct >= 60 ? "heavy persuasion technique" : pct >= 25 ? "some persuasion technique" : "low persuasion technique";
  const techs = (lang.top || []).map((t: any) => `<span class="tech">${esc(t.id)} ·${t.hits}</span>`).join("");
  return `<div class="card"><h2>Leading-language scan (${words} words)</h2>` +
    `<div class="bar"><span style="width:${pct}%"></span></div>` +
    `<div class="flag ${level}">Manipulation ${pct}% — ${verdict}. Detected technique, not position; applied symmetrically.</div>` +
    (techs ? `<div class="techs">${techs}</div>` : `<div class="muted">No flagged techniques.</div>`) +
    `</div>`;
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
    out.innerHTML = sourceCard(a.host, a.source) + languageCard(a.language, a.words);
  } catch (e) {
    out.innerHTML = `<div class="flag info">Couldn't read this page (some browser/system pages are protected).</div>`;
  }
}

run();
