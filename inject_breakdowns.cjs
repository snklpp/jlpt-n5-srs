#!/usr/bin/env node
/* One-off helper: inject Visual Link `breakdown` objects into DECK cards.
   Usage: node inject_breakdowns.cjs <module-with-{section, byRomaji}>
   The data module default-exports { section: "<name>", byRomaji: { romaji: breakdown } }. */
const fs = require('fs');
const path = require('path');

const FILE = path.join(__dirname, 'JlptN5Srs.jsx');
const dataPath = process.argv[2];
if (!dataPath) { console.error('need data module'); process.exit(1); }
const { section, byRomaji } = require(path.resolve(dataPath));

const src = fs.readFileSync(FILE, 'utf8');
const marker = 'const DECK = ';
const start = src.indexOf(marker);
const rest = src.slice(start + marker.length);
let depth = 0, i = 0;
for (; i < rest.length; i++) {
  const ch = rest[i];
  if (ch === '[' || ch === '{') depth++;
  else if (ch === ']' || ch === '}') { depth--; if (depth === 0) break; }
}
const deckStr = rest.slice(0, i + 1);
const deck = JSON.parse(deckStr);

const sec = deck.find(s => s.name === section);
if (!sec) { console.error('section not found:', section); process.exit(1); }

let applied = 0, missing = [];
for (const [romaji, breakdown] of Object.entries(byRomaji)) {
  const card = sec.cards.find(c => c.romaji === romaji);
  if (!card) { missing.push(romaji); continue; }
  card.breakdown = breakdown;
  applied++;
}
if (missing.length) { console.error('NOT FOUND in section:', missing.join(', ')); process.exit(1); }

const newDeckStr = JSON.stringify(deck);
const out = src.slice(0, start + marker.length) + newDeckStr + rest.slice(i + 1);
fs.writeFileSync(FILE, out);

const withB = sec.cards.filter(c => c.breakdown).length;
console.log(`${section}: applied ${applied}, now ${withB}/${sec.cards.length} have breakdown`);
