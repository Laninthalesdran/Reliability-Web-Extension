import { defineConfig } from "wxt";

// One codebase, all browsers. WXT builds Chrome/Edge/Brave/Opera (MV3) and Firefox from
// this config (`wxt build` / `wxt build -b firefox`), and provides the cross-browser
// `browser` API (webextension-polyfill under the hood). Safari is produced by running
// Apple's safari-web-extension-converter on the built Chrome output (see README).
export default defineConfig({
  manifest: {
    name: "Reliability — evidence & technique, not politics",
    // Chrome caps manifest description at 132 chars; the full pitch lives in the store listing.
    description:
      "Scores what to trust as you read — by evidence & technique, not source politics. Runs locally; nothing leaves your machine.",
    homepage_url: "https://github.com/Laninthalesdran/Reliability-Web-Extension",
    permissions: ["activeTab", "scripting"],
    action: { default_title: "Reliability" },
    browser_specific_settings: {
      gecko: { id: "reliability@tntholley.com" }, // required for Firefox signing
    },
  },
});
