export const runtime = "nodejs";

import fs from "fs";
import path from "path";

const TMP_FILE = "/tmp/data.json";
const SNAPSHOT_FILE = path.join(
  process.cwd(),
  "app/api/ipl/live-snapshot.json"
);

// 🔥 freshness check (3 minutes)
function isFresh(updatedAt: string | undefined) {
  if (!updatedAt) return false;

  const diff = Date.now() - new Date(updatedAt).getTime();
  return diff < 3 * 60 * 1000; // 3 minutes
}

// GET → frontend reads data
export async function GET() {
  try {
    let tmpData = null;

    // 🔁 Try reading live data
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      tmpData = JSON.parse(raw);

      // ❌ If stale → ignore + delete
      if (!isFresh(tmpData.updatedAt)) {
        console.warn("⚠️ TMP stale → deleting and falling back");
        try {
          fs.unlinkSync(TMP_FILE); // 🔥 remove stale tmp
        } catch {}
        tmpData = null;
      }
    }

    // ✅ Use fresh tmp data
    if (tmpData) {
      return Response.json(tmpData);
    }

    // 🧾 Fallback to snapshot
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
      const snapshot = JSON.parse(raw);
      return Response.json(snapshot);
    }

    // 🚫 No data available
    return Response.json({
      updatedAt: null,
      leaders: [],
    });

  } catch (err) {
    console.error("❌ GET error:", err);
    return Response.json({
      updatedAt: null,
      leaders: [],
    });
  }
}

// POST → scraper sends data
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.leaders || !Array.isArray(body.leaders)) {
      return Response.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    const payload = {
      updatedAt: body.updatedAt || new Date().toISOString(),
      leaders: body.leaders,
    };

    // 🔥 1. Save LIVE data (/tmp)
    fs.writeFileSync(TMP_FILE, JSON.stringify(payload));

    // 🔥 2. Save SNAPSHOT (fallback)
    try {
      fs.writeFileSync(
        SNAPSHOT_FILE,
        JSON.stringify(payload, null, 2)
      );
    } catch (err) {
      console.warn("⚠️ Snapshot write skipped (expected on Vercel)");
    }

    console.log("✅ Data stored (live + snapshot)");

    return Response.json({ success: true });

  } catch (err) {
    console.error("❌ POST error:", err);
    return Response.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}