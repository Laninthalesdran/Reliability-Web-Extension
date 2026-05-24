import { defineConfig } from "wxt";

// One codebase, all browsers. WXT builds Chrome/Edge/Brave/Opera (MV3) and Firefox from
// this config (`wxt build` / `wxt build -b firefox`), and provides the cross-browser
// `browser` API (webextension-polyfill under the hood). Safari is produced by running
// Apple's safari-web-extension-converter on the built Chrome output (see README).
export default defineConfig({
  manifest: {
    name: "Reliability — evidence & technique, not politics",
    description:
      "Scores how much to trust what you're reading by evidence and persuasion technique, " +
      "not the politics of the source. Runs locally; nothing leaves your machine.",
    permissions: ["activeTab", "scripting"],
    action: { default_title: "Reliability" },
    browser_specific_settings: {
      gecko: { id: "reliability@tntholley.com" }, // required for Firefox signing
    },
  },
});
