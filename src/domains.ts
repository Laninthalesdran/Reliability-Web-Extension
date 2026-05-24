// domains.ts — maps a page's hostname to a known source id in the engine's registries.
// Starter map for the well-documented flagged outlets (state-media + major satire). Unknown
// hosts fall through to the engine's cautious "unknown source" default — never a guess.

const HOST_TO_ID: Record<string, string> = {
  // --- state / public-funded media (control facts, applied symmetrically) ---
  "rt.com": "rt", "sputnikglobe.com": "sputnik", "sputniknews.com": "sputnik",
  "tass.com": "tass", "tass.ru": "tass", "ria.ru": "ria_novosti", "1tv.ru": "channel_one",
  "xinhuanet.com": "xinhua", "news.cn": "xinhua", "cgtn.com": "cgtn", "people.cn": "peoples_daily",
  "globaltimes.cn": "global_times", "chinadaily.com.cn": "china_daily",
  "presstv.ir": "press_tv", "irna.ir": "irna", "en.irna.ir": "irna", "farsnews.ir": "fars",
  "tasnimnews.com": "tasnim", "kcna.kp": "kcna", "trtworld.com": "trt", "aa.com.tr": "anadolu",
  "telesurenglish.net": "telesur", "aljazeera.com": "al_jazeera", "alarabiya.net": "al_arabiya",
  "voanews.com": "voa", "rferl.org": "rferl", "rfa.org": "rfa",
  "bbc.com": "bbc", "bbc.co.uk": "bbc", "dw.com": "deutsche_welle",
  "france24.com": "france24", "rfi.fr": "rfi", "nhk.or.jp": "nhk", "www3.nhk.or.jp": "nhk",
  // --- self-declared satire (announces it isn't real) ---
  "theonion.com": "the_onion", "babylonbee.com": "the_babylon_bee", "clickhole.com": "clickhole",
  "thebeaverton.com": "the_beaverton", "reductress.com": "reductress", "thehardtimes.net": "the_hard_times",
  "waterfordwhispersnews.com": "waterford_whispers_news", "private-eye.co.uk": "private_eye",
  "cracked.com": "cracked", "der-postillon.com": "der_postillon", "legorafi.fr": "le_gorafi",
  "elmundotoday.com": "el_mundo_today", "newsthump.com": "newsthump", "thedailymash.co.uk": "the_daily_mash",
  "thechaser.com.au": "the_chaser", "betootaadvocate.com": "the_betoota_advocate",
  "worldnewsdailyreport.com": "world_news_daily_report",
};

export function normalizeHost(host: string): string {
  return (host || "").toLowerCase().replace(/^www\./, "");
}

export function sourceIdForHost(host: string): string | null {
  return HOST_TO_ID[normalizeHost(host)] ?? null;
}
