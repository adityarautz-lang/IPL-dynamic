export const runtime = "nodejs";

import fs from "fs";
import path from "path";

const TMP_FILE = "/tmp/data.json";
const SNAPSHOT_FILE = path.join(process.cwd(), "app/api/ipl/live-snapshot.json");

// GET → frontend reads data
export async function GET() {
  try {
    // 1️⃣ LIVE (from /tmp)
    if (fs.existsSync(TMP_FILE)) {
      const data = fs.readFileSync(TMP_FILE, "utf-8");
      return Response.json(JSON.parse(data));
    }

    // 2️⃣ SNAPSHOT fallback
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const fallback = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
      return Response.json(JSON.parse(fallback));
    }

    // 3️⃣ Empty fallback
    return Response.json({ leaders: [], updatedAt: null });

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

    // ✅ 1. Save LIVE data (fast, used immediately)
    fs.writeFileSync(TMP_FILE, JSON.stringify(body));

    // ✅ 2. Save SNAPSHOT (fallback)
    try {
      fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(body, null, 2));
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