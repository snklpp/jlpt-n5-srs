import { build } from "esbuild";
import { JSDOM } from "jsdom";
import { readFileSync } from "fs";

const src = readFileSync("/Users/sankalpkumar/Desktop/jlpt_n3/JlptN5Srs.jsx", "utf-8");
const DECK = JSON.parse(src.split("\n").find((l) => l.startsWith("const DECK = ")).slice("const DECK = ".length).replace(/;\s*$/, ""));

// every covered card carries a deck-level md breakdown:
// verbs G1 7/22/43, G2 8/23/44, G3 24 · i-adj 9/40 · na-adj 10/39 · adverbs/conj/expr 11/13/25/41/42
const sis = [7, 22, 43, 8, 23, 44, 24, 9, 40, 10, 39, 11, 13, 25, 41, 42];
let total = 0, withMd = 0, wellFormed = 0;
for (const si of sis)
  for (const c of DECK[si].cards) {
    total++;
    if (typeof c.md === "string" && c.md.length > 0) withMd++;
    if (c.md && c.md.includes("🧩 Kanji breakdown") && c.md.includes("🔊 Sound trick") && c.md.includes("💡 Link") && c.md.includes("✅")) wellFormed++;
  }
console.log("u-verb cards:", total, "| with md:", withMd, "| well-formed (🧩/🔊/💡/✅):", wellFormed);
const otherMd = DECK.flatMap((s, si) => (sis.includes(si) ? [] : s.cards.filter((c) => c.md)));
console.log("md leaked outside u-verb sections:", otherMd.length);

const entry = `import React from "react";import {createRoot} from "react-dom/client";import App from "/Users/sankalpkumar/Desktop/jlpt_n3/JlptN5Srs.jsx";window.__m=()=>createRoot(document.getElementById("root")).render(React.createElement(App));`;
const res = await build({ stdin: { contents: entry, resolveDir: "/Users/sankalpkumar/Desktop/jlpt_n3", loader: "js" }, bundle: true, format: "iife", write: false, define: { "process.env.NODE_ENV": '"development"' }, loader: { ".js": "jsx", ".jsx": "jsx" } });
const dom = new JSDOM(`<!DOCTYPE html><html><head><meta name="theme-color" content="#000"></head><body><div id="root"></div></body></html>`, { runScripts: "outside-only", pretendToBeVisual: true });
const { window } = dom;
window.matchMedia = () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} });
// seed pre-md state: a stale pasted note on an md card (7.0 会う) must be purged once
// (bdRev migration); a note on a non-md card (16.0) must survive
const mem = { jlpt_n5_srs_v1: { v: 1, deckRev: 2, bdEdits: { "7.0": "OLD SOUND TRICK NOTE", "16.0": "KEEP ME" } } };
window.storage = { get: async (k) => (k in mem ? mem[k] : null), set: async (k, v) => { mem[k] = v; } };
window.requestAnimationFrame=(cb)=>setTimeout(()=>cb(Date.now()),0); window.cancelAnimationFrame=(id)=>clearTimeout(id);
window.fetch = async () => ({ json: async () => ({ ts: 0, data: null }) });
const errs=[],warns=[]; console.error=(...a)=>{const s=a.join(" ");(/Warning:/.test(s)?warns:errs).push(s);};
const root=window.document.getElementById("root");
const all=()=>[...root.querySelectorAll("button")];
const byText=(s)=>all().find(b=>(b.textContent||"").includes(s));
const click=(el)=>el&&el.dispatchEvent(new window.MouseEvent("click",{bubbles:true}));
const wait=(ms)=>new Promise(r=>setTimeout(r,ms));

window.eval(res.outputFiles[0].text); window.__m(); await wait(700);

// bdRev migration: stale note on md card purged, other note kept, epoch stamped
const saved = mem.jlpt_n5_srs_v1 || {};
const migOk = saved.bdRev === 2 && saved.bdEdits && !("7.0" in saved.bdEdits) && saved.bdEdits["16.0"] === "KEEP ME";
console.log("bdRev migration (7.0 purged, 16.0 kept, bdRev=2):", migOk);

// study N5 U-Verbs: first card 会う should render the md breakdown after reveal
click(byText("U-Verbs")); await wait(260);
click(byText("Show answer")); await wait(200);
let t = root.textContent || "";
const renderOk = t.includes("Kanji breakdown") && t.includes("AAO") && t.includes("MEET") && t.includes("Sound trick");
console.log("会う md rendered after reveal:", renderOk);
const noBadge = !t.includes("✎ edited");
console.log("no '✎ edited' badge for deck-level md:", noBadge);

// Copy button copies the note and toasts
let copied = null;
Object.defineProperty(window.navigator, "clipboard", { value: { writeText: async (t) => { copied = t; } }, configurable: true });
click(byText("Copy")); await wait(150);
const copyOk = typeof copied === "string" && copied.includes("会う") && copied.includes("AAO") && (root.textContent || "").includes("Card copied");
console.log("copy button copies md + toasts:", copyOk);

// Edit must seed from card.md
click(byText("Edit")); await wait(200);
const ta = root.querySelector("textarea");
const seedOk = !!ta && ta.value.includes("会う") && ta.value.includes("AAO");
console.log("editor seeds from md:", seedOk);
click(byText("Cancel")); await wait(150);

// Revision merged groups 1–3 show md breakdowns too
click([...root.querySelectorAll("header button")].find(b=>(b.textContent||"").includes("‹"))); await wait(150);
click(byText("Revision")); await wait(180);
const groupOk = [];
for (const g of ["Verbs · Group 1 (u-verbs)", "Verbs · Group 2 (ru-verbs)", "Verbs · Group 3 & Irregular", "i-Adjectives", "na-Adjectives", "Adverbs, Conjunctions & Expressions"]) {
  click(byText(g)); await wait(260);
  click(byText("Show answer")); await wait(200);
  t = root.textContent || "";
  groupOk.push(t.includes("Kanji breakdown") && t.includes("Sound trick") && t.includes("Link:"));
  click([...root.querySelectorAll("header button")].find(b=>(b.textContent||"").includes("‹"))); await wait(180);
}
console.log("revision groups (verbs 1-3, i-adj, na-adj, adverbs) show md breakdowns:", groupOk.join(","));

console.log("errors:",errs.length,"warnings:",warns.length);
errs.slice(0,4).forEach(e=>console.log("  ERR "+e.slice(0,160)));
const ok = total===1022 && withMd===1022 && wellFormed===1022 && otherMd.length===0 && migOk && renderOk && noBadge && copyOk && seedOk && groupOk.every(Boolean) && errs.length===0 && warns.length===0;
console.log("RESULT:", ok?"PASS ✅":"CHECK ❌");
