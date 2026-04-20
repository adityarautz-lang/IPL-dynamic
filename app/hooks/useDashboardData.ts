"use client";

import { useEffect, useState } from "react";

type Leader = {
  rank?: number;
  name: string;
  points: number;
  matchId?: number;
  lastMatchPoints?: number;
  transfersLeft?: number;
  boostersUsed?: string | null;
};

type DashboardData = {
  updatedAt: string | null;
  leaders: Leader[];
};

export function useDashboardData() {
  const [data, setData] = useState<DashboardData>({
    updatedAt: null,
    leaders: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/ipl?t=${Date.now()}`);

        // 🔴 Read as text first (prevents crash on HTML response)
        const text = await res.text();

        try {
          const json = JSON.parse(text);

          setData({
            updatedAt: json?.updatedAt || null,
            leaders: Array.isArray(json?.leaders) ? json.leaders : [],
          });

          setLoading(false);
        } catch {
          console.warn("⚠️ Non-JSON response (likely server warming):", text);
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
      }
    };

    // initial fetch
    fetchData();

    // polling every 5 seconds
    interval = setInterval(fetchData, 5000);

    return () => clearInterval(interval);
  }, []);

  return {
    data,
    loading,
  };
}