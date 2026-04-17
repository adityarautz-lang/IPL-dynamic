import type {
  DailyChartRow,
  OverallChartItem,
  RawDailyUser,
  RawOverviewUser,
} from "../types";

export const getOverallData = (data: RawOverviewUser[]): OverallChartItem[] => {
  return data.map((u) => ({
    name: u.name,
    points: u.totalPoints,
    rank: 0,
  }));
};

export const getDailyData = (data: RawDailyUser[]): DailyChartRow[] => {
  const map: Record<string, DailyChartRow> = {};

  data.forEach((user) => {
    user.daily.forEach((d) => {
      if (!map[d.day]) map[d.day] = { day: d.day };

      map[d.day][user.name] = d.points;
    });
  });

  return Object.values(map);
};
