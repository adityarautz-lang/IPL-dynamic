"use client";

import { useEffect, useState } from "react";
import type { DashboardData } from "../types";

export function useDashboardData() {
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const loadDashboardData = () => {
      fetch(`/api/ipl?t=${Date.now()}`, { cache: "no-store" })
        .then((res) => res.json() as Promise<DashboardData>)
        .then(setData);
    };

    loadDashboardData();

    const intervalId = window.setInterval(loadDashboardData, 30000);
    window.addEventListener("focus", loadDashboardData);
    document.addEventListener("visibilitychange", loadDashboardData);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", loadDashboardData);
      document.removeEventListener("visibilitychange", loadDashboardData);
    };
  }, []);

  return data;
}
