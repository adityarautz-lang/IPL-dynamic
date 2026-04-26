export const runtime = "nodejs";

import fs from "fs";

const TMP_FILE = "/tmp/data.json";
const SNAPSHOT_FILE = "/tmp/snapshot.json";

// freshness check (3 minutes)
function isFresh(updatedAt: string | undefined) {
  if (!updatedAt) return false;
  const diff = Date.now() - new Date(updatedAt).getTime();
  return diff < 3 * 60 * 1000;
}

function jsonResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

// --------------------------------------------
// 📤 GET
// --------------------------------------------
export async function GET() {
  try {
    let liveData: any = null;

    // 🔥 Try live data
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      liveData = JSON.parse(raw);

      if (isFresh(liveData.updatedAt)) {
        console.log("📡 Serving LIVE data");
        return jsonResponse(liveData);
      }

      console.warn("⚠️ Live data stale → ignoring");
    }

    // 🔥 Fallback to snapshot
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
      const snapshot = JSON.parse(raw);

      console.log("📦 Serving SNAPSHOT");
      return jsonResponse(snapshot);
    }

    // ❌ No data
    return jsonResponse({
      updatedAt: null,
      leaders: [],
      leagueData: [],
    });

  } catch (err) {
    console.error("❌ GET error:", err);
    return jsonResponse({
      updatedAt: null,
      leaders: [],
      leagueData: [],
    });
  }
}

// --------------------------------------------
// 📥 POST
// --------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📥 Incoming keys:", Object.keys(body));

    // 🔧 Load existing data (for merge)
    let existing: any = {
      leaders: [],
      leagueData: [],
      updatedAt: null,
    };

    if (fs.existsSync(TMP_FILE)) {
      try {
        existing = JSON.parse(fs.readFileSync(TMP_FILE, "utf-8"));
      } catch {}
    }

    // ✅ Merge instead of overwrite
    const payload = {
      updatedAt: body.updatedAt || new Date().toISOString(),

      leaders:
        body.leaders !== undefined
          ? body.leaders
          : existing.leaders,

      leagueData:
        body.leagueData !== undefined
          ? body.leagueData
          : existing.leagueData,
    };

    // 💾 Save BOTH live + snapshot
    fs.writeFileSync(TMP_FILE, JSON.stringify(payload));
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(payload));

    console.log("✅ Stored:", {
      leaders: payload.leaders?.length || 0,
      leagueData: payload.leagueData?.length || 0,
    });

    return jsonResponse({ success: true });

  } catch (err) {
    console.error("❌ POST error:", err);
    return jsonResponse({ error: "Server error" });
  }
}