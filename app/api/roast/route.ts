import { NextResponse } from "next/server";
import roastAgent from "@/app/lib/ai-agent"; // ✅ default import

export async function GET() {
  try {
    const res = await fetch("https://ipl-dynamic.vercel.app/api/ipl", {
      cache: "no-store",
    });

    const json = await res.json();
    const raw = json?.leaders || [];

    const teams = raw.map((t: any) => ({
      name: t.name,
      points: t.points,
      lastMatchPoints: t.lastMatchPoints,
      previousPoints: t.previousPoints || 0, // needed for trend
      rank: t.rank,
      captain: t.captain,
      viceCaptain: t.viceCaptain,
    }));

    roastAgent.initialize(process.env.GROQ_API_KEY!);

    const roasts = await roastAgent.processMatch(teams, 1);

    return NextResponse.json({ roasts });

  } catch (e: any) {
    console.error("Roast API error:", e);
    return NextResponse.json({ error: e.message });
  }
}