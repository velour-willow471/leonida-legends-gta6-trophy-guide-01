# Leonida Legends — GTA VI Trophy Guide and Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/velour-willow471/leonida-legends-gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/velour-willow471/leonida-legends-gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
<sub>Entered on [make.fun](https://make.fun/?ref=caarkdy3&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>

An offline, static trophy guide and tracker for Grand Theft Auto VI on
PlayStation 5. It covers all 55 official trophies with a plain-language
guide for each one, a staged roadmap to the platinum, and a checklist
that remembers your progress in your own browser.

## What is inside

- A guide card for every trophy: official name and description, grade,
  kind (story, collectible, completion, activity or misc), a missable
  flag where the description implies a one-time choice, and a fresh
  guide written for this entry.
- Honest guides: where the official description alone does not confirm
  a method, the card says so plainly instead of inventing locations,
  characters or steps.
- A roadmap section that runs story first, then completion and
  collectibles, then cleanup, with missable warnings and a 100%
  checklist summary.
- Filters for search text, grade, kind and earned status, plus a
  spoiler toggle: guides stay hidden behind a reveal button until you
  ask to see them.
- Export and import of your progress as a small JSON file, so a
  checklist can be backed up or moved between browsers.

## Usage

Option 1 — open the file directly:

Open `app/index.html` in a browser. The guide works fully offline and
loads nothing from the network. Note that some browsers restrict local
file data loading; if the trophy list does not appear from a file URL,
use the local server below instead.

Option 2 — serve it locally:

```
node serve.ts
```

Then visit the local address the server prints (port 8080 by default,
or pass `--port <n>`). Everything is still served from your own
machine; no external requests are made.

Tick a trophy's checkbox to mark it earned. The header shows how many
of the 55 you have and a progress bar toward the platinum. Progress is
stored in `localStorage` on that browser only.

Handy URL parameters on load:

- `?view=roadmap` jumps straight to the roadmap.
- `?spoilers=1` reveals all guides at once.
- `?q=<term>` pre-fills the search box.
- `?earned=<n>` marks the first n trophies earned when no saved
  progress exists yet (used for the screenshots).

## Building the submission dossier

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

This copies `app/` and `screenshots/` into `out/` and writes
`out/dossier.json` with the vendored make.fun library.

## Sources

Trophy names, descriptions and grades are the official PS5 trophy list
via Exophase and PSNProfiles, as listed in `app/data/trophies.json`
(the official 55 trophies, 2026-11-18). Each trophy card repeats that
source line. All guide text, the roadmap and the app itself were
written fresh for this entry.

## Licence

MIT — see `LICENSE`. This is an unofficial fan guide and is not
affiliated with the game's publisher.
