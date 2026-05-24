> **Two ways to use the Reliability Engine** — 🧩 **Browser extension** (this repo) · 🤖 **OpenClaw agent plugin** → [openclaw-reliability-engine](https://github.com/Laninthalesdran/openclaw-reliability-engine). Same engine, two front-ends.

# Reliability — Web Extension

Scores **how much to trust what you're reading** — by **evidence and persuasion technique, not the politics of the source.** It runs **entirely on your machine**: the reliability analysis never leaves your browser, no account, no backend.

Click the toolbar icon on any article and you get:
- **A stoplight verdict** — 🟢 **green** = low persuasion technique, roughly safe · 🟡 **yellow** = manipulative *but* the claims cite checkable sources · 🔴 **red** = manipulative *and* incapable of being verified (the trap). It combines the two signals below into one glance.
- **Leading-language scan** — a 0–100% reading of the **persuasion technique** in the article text (loaded language, fear appeals, weasel attribution, us-vs-them, absolutes, clickbait…). **Detected by technique, applied symmetrically — never a political-lean verdict.** (Technique chips only appear above a meaningful density — a few charged words in a war story are the *subject*, not a fear appeal.)
- **Sourcing / verifiability** — how checkable the claims are: density of attribution/quote cues, read as well- / thinly-sourced.

Self-declared **satire** and **state-funded/controlled** outlets fold straight into the verdict (satire → 🔴 "not factual"; a direct state instrument caps verifiability — symmetric across all governments). And it reads **only the article body** — ads, nav, and sidebars are stripped (via Readability) so the score reflects the journalism, not whatever ad happened to load.

## Honest limits
The **verifiability** signal is a heuristic (attribution/evidence density + source flags), not real fact-checking. The **leading-language** detector counts marker words and cannot fully tell a *fear appeal* from a story that's simply *about* something frightening (it density-normalizes and gates the display to reduce false positives, but the deeper subject-vs-technique distinction is hard NLP). Treat the light as a **prompt to think, not a verdict to obey** — green is "roughly safe," not "true"; red is "be careful," not "false." Full engine limitations: [`KNOWN_LIMITATIONS`](https://github.com/Laninthalesdran/openclaw-reliability-engine/blob/main/KNOWN_LIMITATIONS.md).

It's a **confidence-weighting aid, not a gatekeeper.** A low score means "corroborate before you rely on this," never "this is forbidden." Read [`KNOWN_LIMITATIONS`](https://github.com/Laninthalesdran/openclaw-reliability-engine/blob/main/KNOWN_LIMITATIONS.md) in the engine repo — including the one true gap (omission).

## Install / build

```bash
npm install          # also runs `wxt prepare`
npm run build        # Chrome/Edge/Brave/Opera (MV3)  -> .output/chrome-mv3
npm run build:firefox # Firefox                        -> .output/firefox-mv3
npm run dev          # live-reload dev build (Chrome)
```
Load the unpacked build from `.output/<target>` (Chrome: `chrome://extensions` → Developer mode → Load unpacked). `npm run zip` / `zip:firefox` produce store-ready packages.

## Multiple browsers — one codebase

| Browser(s) | How |
|---|---|
| **Chrome, Edge, Brave, Opera, Vivaldi** | `npm run build` — one Manifest V3 bundle, no changes |
| **Firefox** | `npm run build:firefox` — same code; WXT swaps the manifest + provides the cross-browser `browser` API (webextension-polyfill) |
| **Safari** | run Apple's converter on the Chrome build: `xcrun safari-web-extension-converter .output/chrome-mv3` (needs macOS + Xcode), then build/sign the generated app |

You do **not** maintain separate codebases — one source, per-target builds; Safari is a one-time conversion of the built output.

## How it relates to the engine
The reliability engine itself (claim scorer, source memory, state-media control graph, leading-language detector, calibration) lives in `src/engine/` — the same logic as the [OpenClaw plugin](https://github.com/Laninthalesdran/openclaw-reliability-engine), packaged to run in the browser (data bundled as JSON, no Node/`fs`). Two front-ends, one brain.

## License
Apache-2.0. Built by **Travis Edward Holley** (TNT Holley Inc.) **and Claude Opus 4.7 (1M context, Anthropic)**.
