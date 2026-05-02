export const runtime = "nodejs";

import { kv } from "@vercel/kv";

// freshness check (10 seconds)
function isFresh(updatedAt: string | undefined) {
  if (!updatedAt) return false;
  const diff = Date.now() - new Date(updatedAt).getTime();
  return diff < 10 * 1000;
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
// 🧠 Match window
// --------------------------------------------
function isLiveTime() {
  const hour = new Date().getHours();
  return hour >= 19 && hour <= 23;
}

// --------------------------------------------
// 🧠 Merge leaders (sticky fields)
// --------------------------------------------
function mergeLeaders(newLeaders: any[], oldLeaders: any[]) {
  if (!oldLeaders?.length) return newLeaders;

  const map = new Map();
  oldLeaders.forEach((l) => map.set(l.name, l));

  return newLeaders.map((l) => {
    const prev = map.get(l.name);

    if (!prev) return l;

    return {
      ...l,

      // 🔥 Preserve fields if scraper misses them
      captain: l.captain ?? prev.captain ?? null,
      viceCaptain: l.viceCaptain ?? prev.viceCaptain ?? null,
      boostersUsed: l.boostersUsed ?? prev.boostersUsed ?? null,
      transfersLeft: l.transfersLeft ?? prev.transfersLeft ?? null,
    };
  });
}

// --------------------------------------------
// 📤 GET
// --------------------------------------------
export async function GET() {
  try {
    const liveData: any = await kv.get("live");
    const snapshot: any = await kv.get("snapshot");

    // 🟢 LIVE
    if (isLiveTime() && liveData && isFresh(liveData.updatedAt)) {
      console.log("📡 Serving LIVE data");
      return jsonResponse({ ...liveData, mode: "live" });
    }

    // 🔵 SNAPSHOT
    if (snapshot) {
      console.log("📸 Serving SNAPSHOT");
      return jsonResponse({
        ...snapshot,
        mode: "snapshot_kv",
      });
    }

    // ❌ No data
    return jsonResponse({
      updatedAt: null,
      leaders: [],
      leagueData: [],
      completedPct: null,
      completedMatches: null,
      mode: "empty",
    });

  } catch (err) {
    console.error("❌ GET error:", err);
    return jsonResponse({
      updatedAt: null,
      leaders: [],
      leagueData: [],
      completedPct: null,
      completedMatches: null,
      mode: "error",
    });
  }
}

// --------------------------------------------
// 📥 POST → LIVE
// --------------------------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log("📥 Incoming keys:", Object.keys(body));

    let existing: any = (await kv.get("live")) || {
      leaders: [],
      leagueData: [],
      updatedAt: null,
      completedPct: null,
      completedMatches: null,
    };

    // 🔥 Merge leaders safely (key fix)
    const mergedLeaders =
      body.leaders !== undefined
        ? mergeLeaders(body.leaders, existing.leaders)
        : existing.leaders;

    const payload = {
      updatedAt: body.updatedAt || new Date().toISOString(),

      leaders: mergedLeaders,

      leagueData:
        body.leagueData !== undefined
          ? body.leagueData
          : existing.leagueData,

      completedPct:
        body.completedPct !== undefined
          ? body.completedPct
          : existing.completedPct,

      completedMatches:
        body.completedMatches !== undefined
          ? body.completedMatches
          : existing.completedMatches,
    };

    await kv.set("live", payload);

    console.log("✅ LIVE Stored:", {
      leaders: payload.leaders?.length || 0,
      completedPct: payload.completedPct,
    });

    return jsonResponse({ success: true });

  } catch (err) {
    console.error("❌ POST error:", err);
    return jsonResponse({ error: "Server error" });
  }
}

// --------------------------------------------
// 📸 PUT → SNAPSHOT
// --------------------------------------------
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    if (!body?.leaders?.length) {
      console.log("⚠️ Snapshot skipped (invalid)");
      return jsonResponse({ skipped: true });
    }

    const age = Date.now() - new Date(body.updatedAt).getTime();
    if (age > 6 * 60 * 60 * 1000) {
      console.log("⚠️ Snapshot skipped (too old)");
      return jsonResponse({ skipped: true });
    }

    // 🔥 Also merge snapshot (important!)
    const existing: any = (await kv.get("snapshot")) || {};
    const mergedLeaders = mergeLeaders(body.leaders, existing.leaders || []);

    const payload = {
      ...body,
      leaders: mergedLeaders,
    };

    await kv.set("snapshot", payload);

    console.log("📸 Snapshot stored");

    return jsonResponse({ success: true });

  } catch (err) {
    console.error("❌ SNAPSHOT error:", err);
    return jsonResponse({ error: "Server error" });
  }
}