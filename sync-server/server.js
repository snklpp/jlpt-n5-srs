/* Tiny cross-device sync for the JLPT SRS app.
   One Postgres table of {room -> {payload, ts}}, last-write-wins by ts.
   No auth (the app is single-user / public by design). CORS open. */
const http = require("http");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function init() {
  await pool.query(
    "CREATE TABLE IF NOT EXISTS sync_kv (room text PRIMARY KEY, payload jsonb, ts bigint)"
  );
  console.log("sync_kv ready");
}

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,PUT,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
}

function json(res, code, obj) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(obj));
}

const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }
  let url;
  try {
    url = new URL(req.url, "http://localhost");
  } catch (e) {
    return json(res, 400, { error: "bad url" });
  }
  const room = (url.searchParams.get("room") || "default").slice(0, 120);

  if (url.pathname === "/" || url.pathname === "/health") {
    return json(res, 200, { ok: true, service: "jlpt-sync" });
  }

  if (url.pathname === "/api/state" && req.method === "GET") {
    try {
      const r = await pool.query("SELECT payload, ts FROM sync_kv WHERE room=$1", [room]);
      if (!r.rows.length) return json(res, 200, { ts: 0, data: null });
      return json(res, 200, { ts: Number(r.rows[0].ts), data: r.rows[0].payload });
    } catch (e) {
      return json(res, 500, { error: String(e && e.message ? e.message : e) });
    }
  }

  if (url.pathname === "/api/state" && req.method === "PUT") {
    let body = "";
    req.on("data", (c) => {
      body += c;
      if (body.length > 5e6) req.destroy(); // 5MB guard
    });
    req.on("end", async () => {
      try {
        const parsed = JSON.parse(body || "{}");
        const ts = Number(parsed.ts) || Date.now();
        const data = parsed.data || {};
        // last-write-wins: only overwrite if the incoming ts is newer-or-equal
        await pool.query(
          "INSERT INTO sync_kv (room, payload, ts) VALUES ($1,$2,$3) " +
            "ON CONFLICT (room) DO UPDATE SET payload=EXCLUDED.payload, ts=EXCLUDED.ts WHERE sync_kv.ts <= EXCLUDED.ts",
          [room, data, ts]
        );
        const r = await pool.query("SELECT payload, ts FROM sync_kv WHERE room=$1", [room]);
        return json(res, 200, { ok: true, ts: Number(r.rows[0].ts), data: r.rows[0].payload });
      } catch (e) {
        return json(res, 400, { error: String(e && e.message ? e.message : e) });
      }
    });
    return;
  }

  return json(res, 404, { error: "not found" });
});

init()
  .then(() => server.listen(process.env.PORT || 10000, () => console.log("sync listening")))
  .catch((e) => {
    console.error("init failed", e);
    process.exit(1);
  });
