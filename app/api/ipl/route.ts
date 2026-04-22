export const runtime = "nodejs";

import fs from "fs";
import path from "path";

const TMP_FILE = "/tmp/data.json";
const SNAPSHOT_FILE = path.join(process.cwd(), "app/api/ipl/live-snapshot.json");

// 🔧 helper: normalize data shape
function normalize(data: any) {
  if (Array.isArray(data)) {
    return {
      updatedAt: new Date().toISOString(),
      leaders: data,
    };
  }
  return data;
}

// GET → frontend reads data
export async function GET() {
  try {
    let data = null;

    // 1️⃣ Try LIVE (/tmp)
    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      data = JSON.parse(raw);

      // 🧠 If tmp data is missing captain, ignore it
      if (
        !data?.leaders?.[0]?.captain &&
        !data?.[0]?.captain // handle array case
      ) {
        console.warn("⚠️ TMP data stale → ignoring");
        data = null;
      }
    }

    // 2️⃣ Fallback to SNAPSHOT
    if (!data && fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
      data = JSON.parse(raw);
    }

    // 3️⃣ Normalize shape
    data = normalize(data);

    return Response.json(data || { leaders: [], updatedAt: null });

  } catch (err) {
    console.error("❌ GET error:", err);
    return Response.json({ leaders: [], updatedAt: null });
  }
}

// POST → scraper sends data
export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body?.leaders || !Array.isArray(body.leaders)) {
      return Response.json({ error: "Invalid payload" }, { status: 400 });
    }

    // ✅ Always ensure shape is correct
    const payload = {
      updatedAt: body.updatedAt || new Date().toISOString(),
      leaders: body.leaders,
    };

    // ✅ 1. Save LIVE data
    fs.writeFileSync(TMP_FILE, JSON.stringify(payload));

    // ✅ 2. Save SNAPSHOT
    try {
      fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(payload, null, 2));
    } catch (err) {
      console.warn("⚠️ Snapshot write skipped (expected on Vercel)");
    }

    console.log("✅ Data stored (live + snapshot)");

    return Response.json({ success: true });

  } catch (err) {
    console.error("❌ POST error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}