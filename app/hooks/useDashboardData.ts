"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "../types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    updatedAt: undefined,
    leaders: [],
    leagueData: [],
    completedPct: undefined,
    completedMatches: undefined,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let interval: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const res = await fetch("/api/ipl", {
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Bad response");

        const json = await res.json();

        const newData: DashboardData = {
          updatedAt: json?.updatedAt ?? undefined,

          // ✅ FIX: handle string OR number
          completedPct:
            json?.completedPct != null
              ? Number(json.completedPct)
              : undefined,

          completedMatches:
            json?.completedMatches != null
              ? Number(json.completedMatches)
              : undefined,

          leaders: Array.isArray(json?.leaders)
            ? json.leaders.map((l: any) => ({
                rank: l.rank,
                name: l.name,
                points: Number(l.points ?? 0),
                lastMatchPoints: Number(l.lastMatchPoints ?? 0),
                transfersLeft: Number(l.transfersLeft ?? 0),
                boostersUsed: l.boostersUsed ?? undefined,

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
            : [],

          leagueData: Array.isArray(json?.leagueData)
            ? json.leagueData
            : [],
        };

        if (!isMounted) return;

        // ✅ Simple merge (no timestamp blocking)
        setData((prev) => ({
          ...prev,
          ...newData,
        }));

      } catch (err) {
        console.warn("⚠️ transient fetch issue");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
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