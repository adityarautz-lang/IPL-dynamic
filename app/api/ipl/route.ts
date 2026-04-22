export const runtime = "nodejs";

import fs from "fs";
import path from "path";

const TMP_FILE = "/tmp/data.json";
const SNAPSHOT_FILE = path.join(process.cwd(), "app/api/ipl/live-snapshot.json");

// 🧠 freshness check (5 mins)
function isFresh(updatedAt: string) {
  return Date.now() - new Date(updatedAt).getTime() < 5 * 60 * 1000;
}

export async function GET() {
  try {
    let tmpData = null;

    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      tmpData = JSON.parse(raw);
    }

    if (tmpData?.updatedAt && isFresh(tmpData.updatedAt)) {
      return Response.json(tmpData);
    }

    // fallback to snapshot
    if (fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
      const snapshot = JSON.parse(raw);
      return Response.json(snapshot);
    }

    return Response.json({ leaders: [], updatedAt: null });

  } catch (err) {
    console.error("❌ GET error:", err);
    return Response.json({ leaders: [], updatedAt: null });
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

    // snapshot fallback
    try {
      fs.writeFileSync(SNAPSHOT_FILE, JSON.stringify(payload, null, 2));
    } catch {}

    return Response.json({ success: true });

  } catch (err) {
    console.error("❌ POST error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}