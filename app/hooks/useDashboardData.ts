"use client";

import { useEffect, useState } from "react";
import type { DashboardData, Leader } from "../types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    updatedAt: undefined, // ✅ FIX
    leaders: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/ipl?t=${Date.now()}`);

        // Read as text first (avoids crash on HTML response)
        const text = await res.text();

        try {
          const json = JSON.parse(text);

          const leaders: Leader[] = Array.isArray(json?.leaders)
            ? json.leaders.map((l: any) => ({
                rank: l.rank,
                name: l.name,
                points: Number(l.points ?? 0),
                lastMatchPoints: Number(l.lastMatchPoints ?? 0),
                transfersLeft:
                  typeof l.transfersLeft === "number"
                    ? l.transfersLeft
                    : Number(l.transfersLeft ?? 0),
                boostersUsed:
                  typeof l.boostersUsed === "string"
                    ? l.boostersUsed
                    : typeof l.boostersUsed === "number"
                    ? l.boostersUsed
                    : undefined, // ✅ no null
                matchId: l.matchId,
              }))
            : [];

          setData({
            updatedAt: json?.updatedAt ?? undefined, // ✅ FIX
            leaders,
          });

          setLoading(false);
        } catch {
          console.warn(
            "⚠️ Non-JSON response (likely server warming):",
            text
          );
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
      }
    };

    fetchData();

    interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
  };
}