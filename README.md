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

It's a static SPA, so the free Static Site plan is enough. The blueprint in
`render.yaml` now also deploys a lightweight sync service plus a Postgres
database for cross-device note and progress sync.

## Cross-device notes sync

The app syncs edited card notes and progress through either Supabase or the
Render-hosted sync service.

If you want to use Supabase instead of the Render sync backend, set these
environment variables in Render:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- Optional: `VITE_SUPABASE_TABLE` (defaults to `jlpt_sync_state`)

Create a table like this in Supabase:

```sql
create table if not exists public.jlpt_sync_state (
  room text primary key,
  ts bigint not null,
  data jsonb not null
);

alter table public.jlpt_sync_state enable row level security;

create policy "public read jlpt sync"
on public.jlpt_sync_state
for select
using (true);

create policy "public write jlpt sync"
on public.jlpt_sync_state
for insert
with check (true);

create policy "public update jlpt sync"
on public.jlpt_sync_state
for update
using (true)
with check (true);
```

The app uses one shared room (`default`) and last-write-wins syncing, so
notes edited on one device will appear on the others after sync.
