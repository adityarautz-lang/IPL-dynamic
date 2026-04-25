export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { roastAgent, type RoastResult } from "@/app/lib/ai-agent";
import fs from "fs";

const TMP_FILE = "/tmp/data.json";
const SNAPSHOT_FILE = "/tmp/snapshot.json";

// NO CACHING - Always fresh generation
function jsonResponse(data: unknown) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
    },
  });
}

function ensureAgent(): void {
  if (!roastAgent.isReady()) {
    const apiKey = process.env.GROQ_API_KEY;
    if (apiKey) {
      roastAgent.initialize(apiKey);
    }
  }
}

interface LeaderboardEntry {
  name: string;
  points: number;
  lastMatchPoints: number;
  previousMatchPoints?: number;
}

export async function GET() {
  ensureAgent();

  if (!roastAgent.isReady()) {
    return jsonResponse({
      error: "Add GROQ_API_KEY to .env.local",
      roasts: [],
    });
  }

  try {
    let dashboardData: { leaders?: LeaderboardEntry[] } | null = null;

    if (fs.existsSync(TMP_FILE)) {
      const raw = fs.readFileSync(TMP_FILE, "utf-8");
      dashboardData = JSON.parse(raw);
    } else if (fs.existsSync(SNAPSHOT_FILE)) {
      const raw = fs.readFileSync(SNAPSHOT_FILE, "utf-8");
      dashboardData = JSON.parse(raw);
    }

    if (!dashboardData?.leaders) {
      return jsonResponse({
        error: "No leaderboard data available",
        roasts: [],
      });
    }

    // ALWAYS generate fresh roasts - NO caching
    const roasts = await roastAgent.processMatch(dashboardData.leaders, Date.now());

    return jsonResponse({
      roasts,
      totalTeams: roasts.length,
      timestamp: new Date().toISOString(),
      generated: true,
    });
  } catch (error) {
    console.error("Roast error:", error);
    return jsonResponse({
      error: String(error),
      roasts: [],
    });
  }
}