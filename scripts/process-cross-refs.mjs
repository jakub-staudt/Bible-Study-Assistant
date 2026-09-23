#!/usr/bin/env node
// Usage: node scripts/process-cross-refs.mjs
// Input:  scripts/cross-references.txt  (from openbible.info)
// Output: data/cross-refs.json

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const INPUT  = path.join(__dirname, 'cross-references.txt');
const OUTPUT = path.join(__dirname, '..', 'data', 'cross-refs.json');

if (!fs.existsSync(INPUT)) {
  console.error('ERROR: scripts/cross-references.txt not found.');
  console.error('Download from https://a.openbible.info/data/cross-references.zip');
  process.exit(1);
}

// OpenBible book abbreviation → API.Bible book ID
const BOOK_MAP = {
  Gen:'GEN', Exo:'EXO', Lev:'LEV', Num:'NUM', Deu:'DEU',
  Jos:'JOS', Jdg:'JDG', Rut:'RUT', '1Sa':'1SA', '2Sa':'2SA',
  '1Ki':'1KI', '2Ki':'2KI', '1Ch':'1CH', '2Ch':'2CH',
  Ezr:'EZR', Neh:'NEH', Est:'EST', Job:'JOB', Psa:'PSA',
  Pro:'PRO', Ecc:'ECC', Sol:'SNG', Isa:'ISA', Jer:'JER',
  Lam:'LAM', Eze:'EZK', Dan:'DAN', Hos:'HOS', Joe:'JOL',
  Amo:'AMO', Oba:'OBA', Jon:'JON', Mic:'MIC', Nah:'NAH',
  Hab:'HAB', Zep:'ZEP', Hag:'HAG', Zec:'ZEC', Mal:'MAL',
  Mat:'MAT', Mar:'MRK', Luk:'LUK', Joh:'JHN', Act:'ACT',
  Rom:'ROM', '1Co':'1CO', '2Co':'2CO', Gal:'GAL', Eph:'EPH',
  Phi:'PHP', Col:'COL', '1Th':'1TH', '2Th':'2TH', '1Ti':'1TI',
  '2Ti':'2TI', Tit:'TIT', Phm:'PHM', Heb:'HEB', Jam:'JAS',
  '1Pe':'1PE', '2Pe':'2PE', '1Jo':'1JN', '2Jo':'2JN', '3Jo':'3JN',
  Jud:'JUD', Rev:'REV',
};

function convertId(openbibleId) {
  const parts = openbibleId.split('.');
  const ob = parts[0];
  const mapped = BOOK_MAP[ob];
  if (!mapped) return null; // skip unknown books (e.g. deuterocanonical not in dataset)
  return `${mapped}.${parts[1]}.${parts[2]}`;
}

const lines = fs.readFileSync(INPUT, 'utf8').split('\n');
const refs = {};
let skipped = 0;
let processed = 0;

for (let i = 1; i < lines.length; i++) { // skip header
  const line = lines[i].trim();
  if (!line) continue;
  const [from, to, votesStr] = line.split('\t');
  const votes = parseInt(votesStr, 10);
  if (isNaN(votes) || votes < 2) { skipped++; continue; } // low confidence

  const fromId = convertId(from);
  const toId   = convertId(to);
  if (!fromId || !toId) { skipped++; continue; }

  if (!refs[fromId]) refs[fromId] = [];
  refs[fromId].push({ ref: toId, votes });
  processed++;
}

// Sort each verse's refs by votes descending; keep top 30
for (const key of Object.keys(refs)) {
  refs[key].sort((a, b) => b.votes - a.votes);
  refs[key] = refs[key].slice(0, 30).map(r => r.ref);
}

fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
fs.writeFileSync(OUTPUT, JSON.stringify(refs));

console.log(`Done. Processed: ${processed}, Skipped: ${skipped}`);
console.log(`Output: ${OUTPUT} (${(fs.statSync(OUTPUT).size / 1024 / 1024).toFixed(1)} MB)`);
