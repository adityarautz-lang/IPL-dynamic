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

export async function GET() {
  try {
    let liveData = null;

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

    // 🔥 Fallback to runtime snapshot
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
    });

  } catch (err) {
    console.error("❌ GET error:", err);
    return jsonResponse({
      updatedAt: null,
      leaders: [],
    });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const payload = {
      updatedAt: body.updatedAt || new Date().toISOString(),
      leaders: body.leaders,
    };

    // 🔥 Save BOTH live + snapshot in /tmp
    fs.writeFileSync(TMP_FILE, JSON.stringify(payload));
    fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(payload));

    console.log("✅ Data stored (/tmp live + snapshot)");

    return jsonResponse({ success: true });

  } catch (err) {
    console.error("❌ POST error:", err);
    return jsonResponse({ error: "Server error" });
  }
}