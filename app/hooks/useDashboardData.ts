"use client";

import { useEffect, useState } from "react";
import type { DashboardData, Leader } from "../types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    updatedAt: undefined,
    leaders: [],
    leagueData: [], // ✅ ADD DEFAULT
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

          // ✅ EXISTING TRANSFORMATION (unchanged)
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

          // 🔥 FIX: ADD leagueData (PASS THROUGH)
          leagueData: Array.isArray(json?.leagueData)
            ? json.leagueData
            : [],
        };

        if (!isMounted) return;

        // ✅ Prevent stale overwrite (your existing logic)
        setData((prev) => {
          if (!prev.updatedAt) return newData;

          const prevTime = new Date(prev.updatedAt).getTime();
          const newTime = new Date(newData.updatedAt || 0).getTime();

          return newTime > prevTime ? newData : prev;
        });

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