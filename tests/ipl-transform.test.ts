import assert from "node:assert/strict";
import { describe, it } from "node:test";

import type {
  DashboardData,
  RawApiUser,
  ScrapedDashboardPayload,
  ScrapedLeaderboardItem,
} from "../app/types.ts";
import {
  addLeaderboardMetrics,
  buildDashboardFromSnapshot,
  buildManualDashboard,
  normalizePayload,
  normalizeRawApiUsers,
  serializeRawApiUsersModule,
  syncRawUsersWithSnapshot,
  toFiniteNumber,
} from "@/app/api/ipl/transform.js";

describe("IPL data transformation", () => {
  it("parses finite numbers from numeric and comma-formatted values", () => {
    assert.equal(toFiniteNumber(1200), 1200);
    assert.equal(toFiniteNumber("7,125.5"), 7125.5);
    assert.equal(toFiniteNumber("0"), 0);
    assert.equal(toFiniteNumber("abc"), undefined);
    assert.equal(toFiniteNumber(null), undefined);
  });

  it("normalizes scraped payloads by trimming names, coercing numbers, and sorting ranks", () => {
    const payload = normalizePayload({
      updatedAt: "2026-04-18T10:55:57.567Z",
      leaders: [
        {
          rank: "2",
          name: " Watapi ",
          points: "6,281",
          lastMatchPoints: "62",
          transfersLeft: "106",
          boostersUsed: " 0 ",
        },
        {
          rank: "1",
          name: "Deccan Dominators",
          points: "7,125",
          lastMatchPoints: "52.5",
          transfersLeft: "101",
          boostersUsed: "1",
        },
        {
          rank: "bad",
          name: "Ignored",
          points: 99,
        },
      ],
    });

    assert.ok(payload);
    assert.equal(payload.leaders.length, 2);
    assert.equal(payload.leaders[0].name, "Deccan Dominators");
    assert.equal(payload.leaders[0].points, 7125);
    assert.equal(payload.leaders[0].lastMatchPoints, 52.5);
    assert.equal(payload.leaders[0].transfersLeft, 101);
    assert.equal(payload.leaders[1].name, "Watapi");
    assert.equal(payload.leaders[1].boostersUsed, "0");
    assert.equal(payload.updatedAt, "2026-04-18T10:55:57.567Z");
  });

  it("rejects invalid scraped payloads", () => {
    assert.equal(normalizePayload(null), null);
    assert.equal(normalizePayload({}), null);
    assert.equal(normalizePayload({ leaders: "nope" }), null);
    assert.equal(
      normalizePayload({
        leaders: [{ rank: "?", name: "", points: "x" }],
      }),
      null,
    );
  });

  it("normalizes raw users loaded from storage by sorting matches and recalculating totals", () => {
    const users = normalizeRawApiUsers([
      {
        rno: "2",
        temname: " Team B ",
        points: 999,
        matches: [
          { matchId: "2", points: "15" },
          { matchId: "1", points: "25" },
        ],
      },
      {
        rno: 1,
        temname: "Team A",
        matches: [{ matchId: 1, points: 10 }],
      },
      {
        rno: 3,
        temname: "Broken",
        matches: [],
      },
    ]);

    assert.ok(users);
    assert.equal(users.length, 2);
    assert.equal(users[0].temname, "Team A");
    assert.equal(users[1].temname, "Team B");
    assert.deepEqual(users[1].matches, [
      { matchId: 1, points: 25 },
      { matchId: 2, points: 15 },
    ]);
    assert.equal(users[1].points, 40);
  });

  it("adds rank movement, point gaps, efficiency, and latest-match winner flags", () => {
    const leaders: ScrapedLeaderboardItem[] = [
      {
        rank: 3,
        name: "Gamma",
        points: 80,
        lastMatchPoints: 0,
        transfersLeft: 190,
      },
      {
        rank: 1,
        name: "Alpha",
        points: 100,
        lastMatchPoints: 10,
        transfersLeft: 200,
      },
      {
        rank: 2,
        name: "Beta",
        points: 95,
        lastMatchPoints: 50,
        transfersLeft: 205,
      },
    ];

    const rows = addLeaderboardMetrics(leaders);

    assert.deepEqual(
      rows.map((row) => row.name),
      ["Alpha", "Beta", "Gamma"],
    );
    assert.equal(rows[0].previousPoints, 90);
    assert.equal(rows[0].gapToNext, 5);
    assert.equal(rows[0].gapPercent, 25);
    assert.equal(rows[0].movement, "same");
    assert.equal(rows[0].efficiency, 10);
    assert.equal(rows[1].movement, "up");
    assert.equal(rows[1].isLastMatchLeader, true);
    assert.equal(rows[1].efficiency, 19);
    assert.equal(rows[2].movement, "down");
    assert.equal(rows[2].gapToNext, 0);
    assert.equal(rows[2].isLastMatchLeader, false);
  });

  it("builds manual dashboard data from raw match rows", () => {
    const users: RawApiUser[] = [
      {
        rno: 1,
        temname: "Team A",
        points: 30,
        matches: [
          { matchId: 1, points: 10 },
          { matchId: 2, points: 20 },
        ],
      },
      {
        rno: 2,
        temname: "Team B",
        points: 40,
        matches: [
          { matchId: 1, points: 25 },
          { matchId: 2, points: 15 },
        ],
      },
    ];

    const dashboard = buildManualDashboard(users);

    assert.equal(dashboard.source, "manual");
    assert.deepEqual(
      dashboard.overall.map((row) => row.name),
      ["Team B", "Team A"],
    );
    assert.equal(dashboard.overall[0].lastMatchPoints, 15);
    assert.equal(dashboard.daily.length, 2);
    assert.equal(dashboard.daily[0].day, "Match 1");
    assert.equal(dashboard.daily[0]["Team B"], 25);
    assert.equal(dashboard.daily[1]["Team A"], 20);
  });

  it("merges live snapshots with manual daily rows when latest match points exist", () => {
    const manualDashboard: DashboardData = {
      source: "manual",
      overall: [],
      daily: [{ day: "Match 1", Alpha: 10, Beta: 20 }],
    };
    const snapshot: ScrapedDashboardPayload = {
      updatedAt: "2026-04-18T10:55:57.567Z",
      leaders: [
        {
          rank: 1,
          name: "Alpha",
          points: 100,
          lastMatchPoints: 55,
        },
        {
          rank: 2,
          name: "Beta",
          points: 90,
          lastMatchPoints: 44,
        },
      ],
    };

    const dashboard = buildDashboardFromSnapshot(snapshot, manualDashboard);

    assert.equal(dashboard.source, "live-snapshot");
    assert.equal(dashboard.updatedAt, snapshot.updatedAt);
    assert.equal(dashboard.daily.length, 2);
    assert.equal(dashboard.daily[1].day, "Live Update");
    assert.equal(dashboard.daily[1]["Alpha"], 55);
    assert.equal(dashboard.overall[0].name, "Alpha");
    assert.equal(dashboard.overall[0].isLastMatchLeader, true);
  });

  it("does not append a live daily row when snapshot has no latest match points", () => {
    const manualDashboard: DashboardData = {
      source: "manual",
      overall: [],
      daily: [{ day: "Match 1", Alpha: 10 }],
    };
    const snapshot: ScrapedDashboardPayload = {
      updatedAt: "2026-04-18T10:55:57.567Z",
      leaders: [
        {
          rank: 1,
          name: "Alpha",
          points: 100,
        },
      ],
    };

    const dashboard = buildDashboardFromSnapshot(snapshot, manualDashboard);

    assert.equal(dashboard.daily.length, 1);
    assert.equal(dashboard.daily[0].day, "Match 1");
  });

  it("syncs raw users by appending the next match from scraped total deltas", () => {
    const users: RawApiUser[] = [
      {
        rno: 1,
        temname: "Alpha",
        points: 100,
        matches: [{ matchId: 1, points: 100 }],
      },
      {
        rno: 2,
        temname: "Beta",
        points: 90,
        matches: [{ matchId: 1, points: 90 }],
      },
    ];
    const snapshot: ScrapedDashboardPayload = {
      leaders: [
        { rank: 1, name: "Alpha", points: 130, lastMatchPoints: 30 },
        { rank: 2, name: "Beta", points: 105, lastMatchPoints: 15 },
      ],
    };

    const result = syncRawUsersWithSnapshot(users, snapshot);

    assert.equal(result.status, "updated");
    assert.equal(result.mode, "append");
    assert.equal(result.matchId, 2);
    assert.equal(result.users[0].points, 130);
    assert.deepEqual(result.users[0].matches.at(-1), {
      matchId: 2,
      points: 30,
    });
    assert.equal(users[0].matches.length, 1);
  });

  it("keeps raw users unchanged when scraped totals are already synced", () => {
    const users: RawApiUser[] = [
      {
        rno: 1,
        temname: "Alpha",
        points: 130,
        matches: [
          { matchId: 1, points: 100 },
          { matchId: 2, points: 30 },
        ],
      },
    ];
    const snapshot: ScrapedDashboardPayload = {
      leaders: [{ rank: 1, name: "Alpha", points: 130, lastMatchPoints: 30 }],
    };

    const result = syncRawUsersWithSnapshot(users, snapshot);

    assert.equal(result.status, "unchanged");
    assert.equal(result.matchId, 2);
    assert.equal(result.users[0].matches.length, 2);
  });

  it("updates the latest raw match when a later scrape belongs to the same match", () => {
    const users: RawApiUser[] = [
      {
        rno: 1,
        temname: "Alpha",
        points: 130,
        matches: [
          { matchId: 1, points: 100 },
          { matchId: 2, points: 30 },
        ],
      },
    ];
    const snapshot: ScrapedDashboardPayload = {
      leaders: [{ rank: 1, name: "Alpha", points: 145, lastMatchPoints: 45 }],
    };

    const result = syncRawUsersWithSnapshot(users, snapshot);

    assert.equal(result.status, "updated");
    assert.equal(result.mode, "update-latest");
    assert.equal(result.matchId, 2);
    assert.equal(result.users[0].points, 145);
    assert.deepEqual(result.users[0].matches.at(-1), {
      matchId: 2,
      points: 45,
    });
  });

  it("matches scraped player aliases back to raw fantasy team names", () => {
    const users: RawApiUser[] = [
      {
        rno: 4,
        temname: "VATVAGHOOL XI",
        points: 100,
        matches: [{ matchId: 1, points: 100 }],
      },
    ];
    const snapshot: ScrapedDashboardPayload = {
      leaders: [
        { rank: 1, name: "Vijay Swami", points: 125, lastMatchPoints: 25 },
      ],
    };

    const result = syncRawUsersWithSnapshot(users, snapshot);

    assert.equal(result.status, "updated");
    assert.deepEqual(result.unmatchedNames, []);
    assert.equal(result.users[0].temname, "VATVAGHOOL XI");
    assert.equal(result.users[0].points, 125);
  });

  it("serializes synced raw users back into a data.ts module", () => {
    const source = serializeRawApiUsersModule([
      {
        rno: 1,
        temname: "Alpha",
        points: 130,
        matches: [
          { matchId: 1, points: 100 },
          { matchId: 2, points: 30 },
        ],
      },
    ]);

    assert.match(source, /export const rawApiUsers: RawApiUser\[\]/);
    assert.match(source, /"temname": "Alpha"/);
    assert.match(source, /"matchId": 2/);
    assert.match(source, /calculateTotalPoints/);
  });
});
