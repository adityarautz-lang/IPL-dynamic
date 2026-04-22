"use client";

import { useEffect, useState } from "react";
import type { DashboardData, Leader } from "../types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    updatedAt: undefined,
    leaders: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/ipl?t=${Date.now()}`, {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Bad response");

        const json = await res.json();

        if (!isMounted) return;

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
                  : undefined,

              matchId: l.matchId,

              // ✅ CRITICAL: preserve captain data
              captain: l.captain
                ? {
                    name: l.captain.name,
                    points: Number(l.captain.points ?? 0),
                    image: l.captain.image ?? null,
                  }
                : undefined,

              viceCaptain: l.viceCaptain
                ? {
                    name: l.viceCaptain.name,
                    points: Number(l.viceCaptain.points ?? 0),
                    image: l.viceCaptain.image ?? null,
                  }
                : undefined,
            }))
          : [];

        setData({
          updatedAt: json?.updatedAt ?? undefined,
          leaders,
        });

      } catch (err) {
        // 🔥 do NOT break UI on transient failures
        console.warn("⚠️ transient fetch issue");

      } finally {
        if (isMounted) setLoading(false);
      }
    };

    // 👉 initial load
    fetchData();

    // 👉 polling every 5 sec
    interval = setInterval(fetchData, 5000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return {
    data,
    loading,
  };
}