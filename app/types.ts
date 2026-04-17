export type OverallChartItem = {
  name: string;
  points: number;
  rank: number;
};

export type DailyChartRow = {
  day: string;
  [teamName: string]: string | number;
};

export type DashboardData = {
  overall: OverallChartItem[];
  daily: DailyChartRow[];
};

export type RawApiUser = {
  rno: number;
  temname: string;
  points: number;
};

export type RawOverviewUser = {
  name: string;
  totalPoints: number;
};

export type RawDailyUser = {
  name: string;
  daily: Array<{
    day: string;
    points: number;
  }>;
};
