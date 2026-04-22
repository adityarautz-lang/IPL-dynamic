export const runtime = "nodejs";

import fs from "fs";
import path from "path";

const TMP_FILE = "/tmp/data.json";
const SNAPSHOT_FILE = path.join(
  process.cwd(),
  "app/api/ipl/live-snapshot.json"
);

// freshness check (3 mins)
function isFresh(updatedAt: string | undefined) {
  if (!updatedAt) return false;
  const diff = Date.now() - new Date(updatedAt).getTime();
  return diff < 3 * 60 * 1000;
}

function jsonResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store", // 🔥 critical fix
    },
  });
}

export async function GET() {
  try {
    let tmpData = null;

    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      tmpData = JSON.parse(raw);

      if (!isFresh(tmpData.updatedAt)) {
        console.warn("⚠️ TMP stale → deleting");
        try {
          fs.unlinkSync(TMP_FILE);
        } catch {}
        tmpData = null;
      }
    }

    if (tmpData) {
      console.log("📡 Serving LIVE (/tmp)");
      return jsonResponse(tmpData);
    }

    if (fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
      const snapshot = JSON.parse(raw);
      console.log("📦 Serving SNAPSHOT");
      return jsonResponse(snapshot);
    }

    return jsonResponse({ updatedAt: null, leaders: [] });

  } catch (err) {
    console.error("❌ GET error:", err);
    return jsonResponse({ updatedAt: null, leaders: [] });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payload = {
      updatedAt: body.updatedAt || new Date().toISOString(),
      leaders: body.leaders,
    };

    // live store
    fs.writeFileSync(TMP_FILE, JSON.stringify(payload));

    // snapshot
    try {
      fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(payload, null, 2));
    } catch {}

    console.log("✅ Data stored (live + snapshot)");

    return jsonResponse({ success: true });

  } catch (err) {
    console.error("❌ POST error:", err);
    return jsonResponse({ error: "Server error" });
  }
}