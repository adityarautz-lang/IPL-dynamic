"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "../types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const res = await fetch(`/api/ipl?t=${Date.now()}`, {
          cache: "no-store",
        });

        const json = await res.json();

        if (active) {
          setData((prev) => {
            if (JSON.stringify(prev) === JSON.stringify(json)) {
              return prev;
            }
            return json;
          });
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    };

    fetchData();

    const interval = setInterval(fetchData, 5000); // 🔥 5 sec

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return data;
}
