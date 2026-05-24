# Privacy Policy — Reliability Web Extension

_Last updated: May 24, 2026_

**Short version: this extension collects nothing, transmits nothing, and stores nothing. All analysis happens locally in your browser.**

## What it does
When you **click the toolbar icon** on a web page, the extension reads the text of **that one page** (the active tab only, via the `activeTab` permission — it has no standing access to your browsing) and analyzes it **entirely on your device** using a bundled, offline engine. It then shows you a reliability verdict, a leading-language scan, and a sourcing read.

## What it collects, sends, or stores
- **Personal data collected:** none.
- **Data transmitted off your device:** none. There is no server, no API, no account, no login.
- **Data stored:** none. The extension does not persist your browsing, the pages you analyze, or any results. Each analysis is computed fresh and discarded when you close the popup.
- **Tracking / analytics:** none.
- **Third-party services:** none.

## Permissions, and why
- **`activeTab`** — lets the extension read the current page's content *only when you click the icon*. It cannot read pages in the background or without your action.
- **`scripting`** — used to extract the article text from the active tab at the moment you click. Nothing is injected persistently.

It requests **no host permissions** (no "read all your data on all websites"), because it only ever touches the tab you explicitly invoke it on.

## Future features
A planned "coverage" feature (not in this version) would compare how a story is covered across outlets, which requires querying a public news index **by topic** — that would send the article's *topic*, never your identity or browsing history. It is not present in this release, and any future version that adds outbound requests will update this policy and disclose it clearly.

## Contact
Questions: open an issue at https://github.com/Laninthalesdran/Reliability-Web-Extension/issues
