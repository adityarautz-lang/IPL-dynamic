// Shared base type
export type Leader = {
  rank?: number;
  name: string;
  points?: number;
  lastMatchPoints?: number;
  transfersLeft?: number;
  boostersUsed?: string | number; // ✅ FIXED (no null)
  matchId?: number;
};


// =====================
// Charts
// =====================

export type OverallChartItem = {
  name: string;
  points: number;
  rank: number;
  previousRank?: number;
  previousPoints?: number;
  lastMatchPoints?: number;
  gapToNext?: number;
  gapPercent?: number;
  movement?: "up" | "down" | "same" | "new";
  transfersLeft?: number;
  boostersUsed?: string | number;
  efficiency?: number;
  isLastMatchLeader?: boolean;
};

export type DailyChartRow = {
  day: string;
  [teamName: string]: string | number;
};


// =====================
// Dashboard API
// =====================

export type DashboardData = {
  updatedAt?: string;
  leaders: Leader[];
  leagueData?: any[];

  // ✅ ADD THESE
  overall?: any;
  daily?: any;
};


// =====================
// Raw / Scraped
// =====================

export type RawApiUser = {
  rno: number;
  temname: string;
  points: number;
  matches: Array<{
    matchId: number;
    points: number;
  }>;
};

export type ScrapedLeaderboardItem = {
  rank: number;
  name: string;
  points: number;
  lastMatchPoints?: number;
  transfersLeft?: number;
  boostersUsed?: string | number; // ✅ FIXED
};

export type ScrapedDashboardPayload = {
  updatedAt?: string;
  leaders: ScrapedLeaderboardItem[];
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