import { readFile } from "node:fs/promises";
import path from "node:path";
import { MongoClient } from "mongodb";
import {
  normalizePayload,
  normalizeRawApiUsers,
} from "@/app/api/ipl/transform";
import { rawApiUsers } from "@/app/api/ipl/data";

const DB_NAME = "ipl";
const COLLECTION_NAME = "ipl";
const DASHBOARD_DOCUMENT_TYPE = "dashboard";
const RAW_USERS_DOCUMENT_TYPE = "raw-users";
const SNAPSHOT_PATH = path.join(
  process.cwd(),
  "app/api/ipl/live-snapshot.json",
);

const args = new Set(process.argv.slice(2));
const dryRun = args.has("--dry-run");
const force = args.has("--force");

const loadSeedUsers = () => {
  const users = normalizeRawApiUsers(rawApiUsers);

  if (!users) {
    throw new Error(
      "Failed to normalize raw seed users from app/api/ipl/data.ts",
    );
  }

  return users;
};

const loadSnapshot = async () => {
  try {
    const content = await readFile(SNAPSHOT_PATH, "utf8");
    return normalizePayload(JSON.parse(content));
  } catch {
    return null;
  }
};

const createRawUsersDocument = (users: ReturnType<typeof loadSeedUsers>) => ({
  type: RAW_USERS_DOCUMENT_TYPE,
  updatedAt: new Date().toISOString(),
  users: users.map((user) => ({
    rno: user.rno,
    temname: user.temname,
    points: user.points,
    matches: [...user.matches].sort((a, b) => a.matchId - b.matchId),
  })),
});

const logPlan = async () => {
  const users = loadSeedUsers();
  const snapshot = await loadSnapshot();

  console.log(`Seed users: ${users.length}`);
  console.log(
    `Latest match id: ${Math.max(...users.flatMap((user) => user.matches.map((match) => match.matchId)))}`,
  );
  console.log(`Live snapshot found: ${snapshot ? "yes" : "no"}`);

  if (snapshot) {
    console.log(`Snapshot leaders: ${snapshot.leaders.length}`);
    console.log(`Snapshot updatedAt: ${snapshot.updatedAt ?? "n/a"}`);
  }
};

const run = async () => {
  if (dryRun) {
    await logPlan();
    console.log("Dry run only. No MongoDB writes performed.");
    return;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is required to seed MongoDB.");
  }

  const users = loadSeedUsers();
  const snapshot = await loadSnapshot();
  const client = new MongoClient(uri);

  try {
    await client.connect();

    const collection = client.db(DB_NAME).collection(COLLECTION_NAME);
    const existingRawUsers = await collection.findOne({
      type: RAW_USERS_DOCUMENT_TYPE,
    });
    const existingSnapshot = await collection.findOne({
      type: DASHBOARD_DOCUMENT_TYPE,
    });

    if (!existingRawUsers || force) {
      await collection.updateOne(
        { type: RAW_USERS_DOCUMENT_TYPE },
        { $set: createRawUsersDocument(users) },
        { upsert: true },
      );
      console.log(
        existingRawUsers
          ? "Updated raw-users document from local seed data."
          : "Inserted raw-users document from local seed data.",
      );
    } else {
      console.log(
        "Skipped raw-users document because it already exists. Use --force to overwrite.",
      );
    }

    if (!snapshot) {
      console.log(
        "Skipped dashboard snapshot because no local live snapshot file was found.",
      );
    } else if (!existingSnapshot || force) {
      await collection.updateOne(
        { type: DASHBOARD_DOCUMENT_TYPE },
        {
          $set: {
            type: DASHBOARD_DOCUMENT_TYPE,
            updatedAt: snapshot.updatedAt,
            leaders: snapshot.leaders,
          },
        },
        { upsert: true },
      );
      console.log(
        existingSnapshot
          ? "Updated dashboard snapshot from local live snapshot file."
          : "Inserted dashboard snapshot from local live snapshot file.",
      );
    } else {
      console.log(
        "Skipped dashboard snapshot because it already exists. Use --force to overwrite.",
      );
    }
  } finally {
    await client.close();
  }
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
