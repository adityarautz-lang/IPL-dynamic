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
        const res = await fetch(`/api/ipl`, {
          cache: "no-store", // 🔥 important
        });

        if (!res.ok) throw new Error("Bad response");

        const json = await res.json();

        const newData: DashboardData = {
          updatedAt: json?.updatedAt ?? undefined,
          leaders: Array.isArray(json?.leaders)
            ? json.leaders.map((l: any) => ({
                ...l,
                points: Number(l.points ?? 0),
                lastMatchPoints: Number(l.lastMatchPoints ?? 0),
                transfersLeft: Number(l.transfersLeft ?? 0),
                captain: l.captain,
                viceCaptain: l.viceCaptain,
              }))
            : [],
        };

        if (!isMounted) return;

        // 🔥 prevent stale overwrite
        setData((prev) => {
          if (!prev.updatedAt) return newData;

          return new Date(newData.updatedAt!) > new Date(prev.updatedAt!)
            ? newData
            : prev;
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

  return { data, loading };
}