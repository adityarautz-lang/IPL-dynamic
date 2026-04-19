import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import type { RawApiUser, ScrapedDashboardPayload } from "../../types";
import {
  buildDashboardFromSnapshot,
  buildManualDashboard,
  normalizeRawApiUsers,
  normalizePayload,
  syncRawUsersWithSnapshot,
} from "./transform";
import { rawApiUsers } from "./data";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SNAPSHOT_PATH = path.join(
  process.cwd(),
  "app/api/ipl/live-snapshot.json",
);
const RAW_DATA_PATH = path.join(process.cwd(), "app/api/ipl/data.ts");
const DASHBOARD_COLLECTION = "ipl";
const DASHBOARD_DOCUMENT_TYPE = "dashboard";
const RAW_USERS_DOCUMENT_TYPE = "raw-users";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "no-store, no-cache, must-revalidate",
  Pragma: "no-cache",
  Expires: "0",
};

const getDb = async () => {
  if (!process.env.MONGODB_URI) {
    return null;
  }

  try {
    const { default: getMongoDb } = await import("../../lib/useDb");

    return await getMongoDb();
  } catch (error) {
    console.error("Failed to initialize MongoDB connection:", error);
    return null;
  }
};

const readFileSnapshot = async () => {
  try {
    const content = await readFile(SNAPSHOT_PATH, "utf8");
    const parsed = JSON.parse(content) as ScrapedDashboardPayload;
    const normalized = normalizePayload(parsed);

    return normalized?.leaders.length ? normalized : null;
  } catch {
    return null;
  }
};

const readMongoSnapshot = async () => {
  const db = await getDb();

  if (!db) {
    return null;
  }

  try {
    const document = await db
      .collection(DASHBOARD_COLLECTION)
      .findOne({ type: DASHBOARD_DOCUMENT_TYPE });

    return normalizePayload(document);
  } catch (error) {
    console.error("Failed to read IPL snapshot from MongoDB:", error);
    return null;
  }
};

const readFileRawUsers = async () => {
  try {
    const content = await readFile(RAW_DATA_PATH, "utf8");
    return content ? rawApiUsers : null;
  } catch {
    return rawApiUsers;
  }
};

const readMongoRawUsers = async () => {
  const db = await getDb();

  if (!db) {
    return null;
  }

  try {
    const document = await db
      .collection(DASHBOARD_COLLECTION)
      .findOne({ type: RAW_USERS_DOCUMENT_TYPE });

    return normalizeRawApiUsers(document?.users);
  } catch (error) {
    console.error("Failed to read IPL raw users from MongoDB:", error);
    return null;
  }
};

const readManualUsers = async () => {
  return (
    (await readMongoRawUsers()) ?? (await readFileRawUsers()) ?? rawApiUsers
  );
};

const writeMongoSnapshot = async (payload: ScrapedDashboardPayload) => {
  const db = await getDb();

  if (!db) {
    return {
      configured: false,
      stored: false,
    };
  }

  try {
    await db.collection(DASHBOARD_COLLECTION).updateOne(
      { type: DASHBOARD_DOCUMENT_TYPE },
      {
        $set: {
          type: DASHBOARD_DOCUMENT_TYPE,
          updatedAt: payload.updatedAt,
          leaders: payload.leaders,
        },
      },
      { upsert: true },
    );

    return {
      configured: true,
      stored: true,
    };
  } catch (error) {
    console.error("Failed to write IPL snapshot to MongoDB:", error);

    return {
      configured: true,
      stored: false,
    };
  }
};

const writeMongoRawUsers = async (users: RawApiUser[]) => {
  const db = await getDb();

  if (!db) {
    return {
      configured: false,
      stored: false,
    };
  }

  try {
    await db.collection(DASHBOARD_COLLECTION).updateOne(
      { type: RAW_USERS_DOCUMENT_TYPE },
      {
        $set: {
          type: RAW_USERS_DOCUMENT_TYPE,
          updatedAt: new Date().toISOString(),
          users: users.map((user) => ({
            rno: user.rno,
            temname: user.temname,
            points: user.points,
            matches: [...user.matches].sort((a, b) => a.matchId - b.matchId),
          })),
        },
      },
      { upsert: true },
    );

    return {
      configured: true,
      stored: true,
    };
  } catch (error) {
    console.error("Failed to write IPL raw users to MongoDB:", error);

    return {
      configured: true,
      stored: false,
    };
  }
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET() {
  const manualUsers = await readManualUsers();
  const snapshot = (await readMongoSnapshot()) ?? (await readFileSnapshot());

  if (snapshot) {
    return NextResponse.json(
      buildDashboardFromSnapshot(snapshot, buildManualDashboard(manualUsers)),
      { headers: corsHeaders },
    );
  }

  return NextResponse.json(buildManualDashboard(manualUsers), {
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

  const manualUsers = await readManualUsers();
  const mongoStorage = await writeMongoSnapshot(payload);

  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(payload, null, 2)}\n`);
  const rawSync = syncRawUsersWithSnapshot(manualUsers, payload);
  const rawUsersStorage =
    rawSync.status === "updated"
      ? await writeMongoRawUsers(rawSync.users)
      : {
          configured: Boolean(process.env.MONGODB_URI),
          stored: false,
        };

  return NextResponse.json(
    {
      ok: true,
      updatedAt: payload.updatedAt,
      count: payload.leaders.length,
      storage: {
        localSnapshot: true,
        mongodbSnapshot: mongoStorage.stored,
        mongodbRawUsers: rawUsersStorage.stored,
        mongodbConfigured: mongoStorage.configured,
      },
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
