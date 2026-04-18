import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { ScrapedDashboardPayload } from "../../types";
import {
  buildDashboardFromSnapshot,
  buildManualDashboard,
  normalizePayload,
  serializeRawApiUsersModule,
  syncRawUsersWithSnapshot,
} from "./transform";
import { rawApiUsers } from "./data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SNAPSHOT_PATH = path.join(process.cwd(), "app/api/ipl/live-snapshot.json");
const RAW_DATA_PATH = path.join(process.cwd(), "app/api/ipl/data.ts");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const readSnapshot = async () => {
  try {
    const content = await readFile(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(content) as ScrapedDashboardPayload;

    return parsed.leaders?.length ? parsed : null;
  } catch {
    return null;
  }
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const snapshot = await readSnapshot();

  if (snapshot) {
    return NextResponse.json(
      buildDashboardFromSnapshot(snapshot, buildManualDashboard(rawApiUsers)),
      { headers: corsHeaders },
    );
  }

  return NextResponse.json(buildManualDashboard(rawApiUsers), {
    headers: corsHeaders,
  });
}

export async function POST(request: Request) {
  const payload = normalizePayload(await request.json().catch(() => null));

  if (!payload) {
    return NextResponse.json(
      { error: "Invalid payload. Expected { leaders: [...] }." },
      { status: 400, headers: corsHeaders },
    );
  }

  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  const rawSync = syncRawUsersWithSnapshot(rawApiUsers, payload);

  if (rawSync.status === "updated") {
    await writeFile(RAW_DATA_PATH, serializeRawApiUsersModule(rawSync.users));
  }

  return NextResponse.json(
    {
      ok: true,
      updatedAt: payload.updatedAt,
      count: payload.leaders.length,
      rawSync: {
        status: rawSync.status,
        matchId: rawSync.matchId,
        mode: rawSync.mode,
        unmatchedNames: rawSync.unmatchedNames,
      },
    },
    { headers: corsHeaders },
  );
}
