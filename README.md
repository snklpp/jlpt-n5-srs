# JLPT N5 · 語彙 SRS

Single-page spaced-repetition flashcard app for JLPT N5 vocabulary
(655 words across 15 sections). Anki-style learning steps + SM-2 review
scheduling, three study directions, tap-to-copy, undo, and furigana on
above-level kanji inside the mnemonics.

The whole app is one component — [`JlptN5Srs.jsx`](./JlptN5Srs.jsx).
`src/main.jsx` mounts it and provides a `window.storage` implementation
(backed by `localStorage`) so progress persists in the browser.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build → dist/
npm run preview    # serve the production build locally
```

## Deploy on Render

**Option A — Blueprint (uses `render.yaml`)**
1. Push this folder to a GitHub/GitLab repo.
2. Render dashboard ▸ **New ▸ Blueprint** ▸ pick the repo ▸ **Apply**.

**Option B — Static Site (manual, no render.yaml needed)**
1. Push to a Git repo.
2. Render dashboard ▸ **New ▸ Static Site** ▸ connect the repo.
3. Settings:
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. **Create Static Site.**

It's a static SPA, so the free Static Site plan is enough. Progress is
stored per-browser via `localStorage`; for cross-device sync, replace the
`window.storage` shim in `src/main.jsx` with a backend.
