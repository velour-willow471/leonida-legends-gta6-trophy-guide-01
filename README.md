# Leonida Legends — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/velour-willow471/leonida-legends-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/velour-willow471/leonida-legends-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline, static trophy guide and progress tracker for **Grand Theft Auto VI on PlayStation 5**, covering all **55 trophies** on the official list — platinum, gold, silver and bronze.

Every trophy comes with a guide written from its official description: what the description actually asks for, whether it is a story, completion, collectible or activity trophy, and a conservative missable warning where a description implies a one-chance sequence. Where a description is too vague to confirm a method (a handful of trophies are deliberately cryptic), the guide says so plainly instead of inventing locations or steps.

## Features

- **Checklist with memory** — tick trophies off and the state persists in `localStorage`, with an earned counter and progress bar.
- **Search and filters** — full-text search plus filters by grade, by kind (story / completion / collectible / activity / misc) and by earned status.
- **Spoiler protection** — hide unearned story trophies behind a reveal button so you can track progress without reading ahead.
- **Roadmap to the Platinum** — an ordered plan (story first, then completion and collectibles, then cleanup) with missable warnings and a 100% completion checklist summary. Open it directly with `?view=roadmap`.
- **Export / import** — download your progress as JSON and import it again on another browser or machine.
- **Reproducible views via URL parameters** — `?q=<term>` pre-fills search, `?spoilers=1` enables spoiler protection, `?earned=<n>` pre-ticks the first *n* trophies, `?view=roadmap` jumps to the roadmap.
- **Fully offline** — no CDN, no web fonts, no external images or scripts. Everything is local files.

## How to use it

Option 1 — just open the app:

```
open app/index.html   # or double-click it in your file manager
```

Option 2 — serve it locally (recommended, so the trophy data loads exactly as in production):

```
node serve.ts          # then visit http://localhost:8080
node serve.ts --port 8091
```

Then search, filter, tick trophies off as you earn them, and follow the Roadmap section for the order that avoids a second playthrough.

## Building the submission dossier

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes `out/dossier.json` using the vendored make.fun library.

## Sources

Trophy names, descriptions and grades follow the official PlayStation 5 trophy list for Grand Theft Auto VI, as published via **Exophase** and **PSNProfiles**. Each trophy in `app/data/trophies.json` carries its own `sources` line. Guides are original text written for this project from those descriptions; unconfirmed methods are labelled as unconfirmed.

## Screenshots

Four screenshots in `screenshots/` (described in `shots.json`) show the checklist with progress ticked, a single-trophy search with its full guide, the roadmap, and spoiler protection in action — all at 1280×800.

## License

MIT — see `LICENSE`.

<sub>Entered on [make.fun](https://make.fun/?ref=caarkdy3&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
