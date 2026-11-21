// Leonida Legends — packaging step for the make.fun entry.
// The guide itself is the static app/ folder next to this file: plain HTML,
// CSS and JavaScript plus the trophy data file, with no build step and no
// network loading, so a browser can open app/index.html directly.
// This program prepares the hand-in: it copies app/ and screenshots/ into
// the output folder and writes dossier.json there using the vendored
// make.fun library. The vendor file must stay untouched, because the
// scorer expects dossier.json to match exactly what its own copy writes.
// Run it locally with an explicit output folder:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Preview the guide first with: node serve.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// Caps mirror the scorer's gate: text is shaped by text_max_bytes, and the
// other limits refuse an entry the scorer would refuse anyway — at most 4
// screenshots and none over 256 KiB, plus the app file count and size caps.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
