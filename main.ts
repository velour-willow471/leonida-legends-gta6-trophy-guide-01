// Leonida Legends — hand-in program for the gta6-trophy-guide-01 bounty.
//
// What lives here: the guide itself is the static site under app/ (open
// app/index.html in any browser; it needs no build and no network). This
// file only packages that site for judging: it mirrors app/ and
// screenshots/ into the output folder and then asks the vendored make.fun
// library to summarise the result as dossier.json. The vendored file must
// stay untouched, because the scorer compares the dossier against what its
// own copy of the library would produce.
//
// Local run:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Preview the site itself with: node serve.ts

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

// Entry limits mirrored from the scorer: at most 4 screenshots of at most
// 256 KiB each, at most 993 entries / 48 MiB under app/, and a text budget
// of 163840 bytes for the dossier body.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
