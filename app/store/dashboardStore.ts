// store/dashboardStore.ts
import { create } from "zustand";
import type { DashboardData } from "@/app/types";

type State = {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  fetchData: () => Promise<void>;
};

export const useDashboardStore = create<State>((set) => ({
  data: null,
  loading: true,
  error: null,

  fetchData: async () => {
    try {
      set({ loading: true, error: null });

      const res = await fetch(`/api/ipl?t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();

      set({
        data: json.data,
        loading: false,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      set({
        error: err.message,
        loading: false,
      });
    }
  },
}));
