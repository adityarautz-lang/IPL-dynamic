export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { roastGenerator, type Roast } from "@/app/lib/ai-roast";
import type { DashboardData } from "@/app/types";

// Store roasts in memory (in production, use Redis or a database)
let cachedRoasts: Roast[] = [];
let lastGeneratedAt: Date | null = null;

export async function GET() {
  try {
    return NextResponse.json({
      roasts: cachedRoasts,
      lastGeneratedAt: lastGeneratedAt?.toISOString() || null,
      count: cachedRoasts.length,
    });
  } catch (error) {
    console.error("Roast GET error:", error);
    return NextResponse.json(
      { error: "Failed to get roasts" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const dashboardData: DashboardData = body.dashboardData;

    if (!dashboardData) {
      return NextResponse.json(
        { error: "No dashboard data provided" },
        { status: 400 }
      );
    }

    // Generate fresh roasts based on dashboard data
    const newRoasts = roastGenerator.generateAllRoasts(dashboardData);
    
    // Update cache
    cachedRoasts = newRoasts;
    lastGeneratedAt = new Date();

    return NextResponse.json({
      success: true,
      roasts: cachedRoasts,
      lastGeneratedAt: lastGeneratedAt.toISOString(),
      summary: {
        total: cachedRoasts.length,
        positive: cachedRoasts.filter(r => r.sentiment === "positive").length,
        negative: cachedRoasts.filter(r => r.sentiment === "negative").length,
        neutral: cachedRoasts.filter(r => r.sentiment === "neutral").length,
      },
    });
  } catch (error) {
    console.error("Roast POST error:", error);
    return NextResponse.json(
      { error: "Failed to generate roasts" },
      { status: 500 }
    );
  }
}

// DELETE to clear roast history
export async function DELETE() {
  try {
    roastGenerator.clearHistory();
    cachedRoasts = [];
    lastGeneratedAt = null;
    
    return NextResponse.json({ success: true, message: "Roast history cleared" });
  } catch (error) {
    console.error("Roast DELETE error:", error);
    return NextResponse.json(
      { error: "Failed to clear history" },
      { status: 500 }
    );
  }
}