/**
 * Dynamic AI Roast Generator
 * Each team gets ONE unique roast based on their exact performance
 */

import type { DashboardData, Leader } from "@/app/types";

export type RoastType = 
  | "legendary"
  | "great"
  | "decent"
  | "struggling"
  | "disaster"
  | "consistent"
  | "sleeper";

export interface Roast {
  id: string;
  teamName: string;
  message: string;
  type: RoastType;
  points: number;
  sentiment: "positive" | "negative" | "neutral";
  timestamp: Date;
  performance: {
    rank: number;
    percentile?: number;
    delta?: number;
  };
}

// Templates are rank-specific for uniqueness
const roastTemplates = {
  // Rank 1 - The Champion
  1: [
    "Na, {team}! You didn't just win, you made everyone else question their life choices at {points} points. ����",
    "POV: You're {team} at #{rank} with {points} points. Everyone else is just background noise. 📢",
    "{team} hit {points} and the leaderboard rearranged itself around them. That's called dominance.",
    "When you're {team} with {points} points, the competition isn't chasing you—they're just hoping you trip.",
  ],
  
  // Rank 2-3 - Podium Pushers
  2: [
    "{team} sitting pretty at #{rank} with {points} pts. Silver/bronze energy but the hunger of gold. 🥈",
    "{points} points for {team} (#{rank}). So close to glory you can taste it... literally. 👅",
    "{team} at #{rank} with {points}. The view from here is nice, but that #1 spot? Feels far. 👀",
  ],
  3: [
    "{team} scraped together {points} points for #{rank}. The podium beckons but someone's blocking. 🙄",
  ],

  // Rank 4-6 - Mid-tier
  4: [
    "{team} is mid-pack at #{rank} with {points} pts. Not bad, not memorable. The beige of fantasy. 🟫",
  ],
  5: [
    "{team} at #{rank} with {points} points. The \"nice effort\" trophy has their name on it. 🏆📎",
  ],
  6: [
    "{team} is exactly in the middle of nowhere at #{rank}. {points} pts of \"could be worse.\" 😅",
  ],

  // Rank 7+ - The Struggle Bus
  7: [
    "{team} at #{rank} with {points} points. Someone's parent must be so proud of this participation. 👪",
  ],
  8: [
    "{points} pts for {team} at #{rank}. That's not last, but it's making eye contact with last. 👀",
  ],
  9: [
    "{team}: #{rank} with {points}. The \"at least we tried\" energy is strong here. 💪... or not.",
  ],
  10: [
    "{points} points at #{rank}? {team} showed up. They also left a bit early though. 🏃",
  ],

  // Bottom 3 - The Dungeon Dwellers
  bottom3: [
    "{points} points for {team}. Even the WiFi has more consistency. 📶",
    "{team} at #{rank} with {points} pts. This is a cry for help disguised as a scoreboard. 🆘",
    "{points} from {team} (#{rank}). I've seen parking tickets higher than this. 🚗❌",
    "Dear {team}, {points} points at #{rank}. The void welcomes you. Sincerely, everyone else. 🕳️",
  ],

  // Surge roasts - positive delta
  surge: [
    "+{delta} since last match! {team} is cooking at {points} pts. 🔥",
    "{team} just flipped the script with +{delta}! The comeback arc begins. 📖✨",
  ],

  // Collapse roasts - negative delta
  collapse: [
    "{team} dropped {delta} pts. Gravity said \"I got you.\" 🍃",
    "{delta} points gone like that. {team} just experienced a freefall. 🪂❌",
  ],
};

// Track used templates to avoid repeats in same session
const usedTemplateIds = new Set<string>();

function generateId(): string {
  return `roast_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

function getAvailableTemplates(rank: number, isBottom: boolean): string[] {
  if (isBottom) {
    return roastTemplates.bottom3;
  }
  if (rank === 1) return roastTemplates[1];
  if (rank === 2) return roastTemplates[2];
  if (rank === 3) return roastTemplates[3];
  if (rank <= 6) return roastTemplates[4];
  if (rank <= 7) return roastTemplates[7];
  if (rank <= 8) return roastTemplates[8];
  if (rank <= 9) return roastTemplates[9];
  if (rank <= 10) return roastTemplates[10];
  return roastTemplates.bottom3;
}

function pickUniqueTemplate(templates: string[], rank: number): string {
  const templateKey = `rank_${rank}`;
  const available = templates.filter(t => !usedTemplateIds.has(`${templateKey}_${t.substring(0, 30)}`));
  
  const pool = available.length > 0 ? available : templates;
  const selected = pool[Math.floor(Math.random() * pool.length)];
  usedTemplateIds.add(`${templateKey}_${selected.substring(0, 30)}`);
  
  // Keep set manageable
  if (usedTemplateIds.size > 100) {
    const arr = Array.from(usedTemplateIds);
    arr.slice(0, 50).forEach(id => usedTemplateIds.delete(id));
  }
  
  return selected;
}

function formatTemplate(template: string, data: { team: string; points: number; rank: number; delta?: number }): string {
  return template
    .replace('{team}', data.team)
    .replace('{points}', String(data.points))
    .replace('{rank}', String(data.rank))
    .replace('{delta}', data.delta ? String(Math.abs(data.delta)) : '');
}

/**
 * Main AI Roast Generator Class
 */
export class AIRoastGenerator {
  private roastHistory: Roast[] = [];
  private maxHistory = 50;
  private currentSessionTemplates = new Set<string>();

  /**
   * Generate ONE roast for a team based on their exact rank
   */
  generateTeamRoast(team: Leader, rank: number, totalCount: number, delta?: number): Roast {
    const isBottom = rank > totalCount * 0.7; // Bottom 30%
    const percentile = (rank / totalCount) * 100;
    const points = team.points ?? 0;
    
    let sentiment: Roast["sentiment"] = "positive";
    let type: RoastType = "legendary";
    
    if (rank === 1) {
      type = "legendary";
      sentiment = "positive";
    } else if (rank <= 3) {
      type = "great";
      sentiment = "positive";
    } else if (rank <= totalCount * 0.5) {
      type = "decent";
      sentiment = "neutral";
    } else if (rank <= totalCount * 0.85) {
      type = "struggling";
      sentiment = "negative";
    } else {
      type = "disaster";
      sentiment = "negative";
    }

    // Get templates based on rank
    const templates = getAvailableTemplates(rank, isBottom);
    const rawTemplate = pickUniqueTemplate(templates, rank);
    
    // Format the message
    const message = formatTemplate(rawTemplate, {
      team: team.name,
      points,
      rank,
      delta,
    });

    const roast: Roast = {
      id: generateId(),
      teamName: team.name,
      message,
      type,
      points,
      sentiment,
      timestamp: new Date(),
      performance: {
        rank,
        percentile: Math.round(percentile),
        delta,
      },
    };

    this.addToHistory(roast);
    return roast;
  }

  /**
   * Generate roasts for ALL teams - ONE roast per team
   */
  generateAllRoasts(data: DashboardData): Roast[] {
    const roasts: Roast[] = [];
    const list = Array.isArray(data.leaders) ? data.leaders : [];
    
    if (list.length === 0) return roasts;

    // Sort by points to determine true ranks
    const sorted = [...list].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    const totalCount = sorted.length;

    // ONE roast per team based on final rank
    sorted.forEach((team, idx) => {
      const rank = idx + 1;
      const delta = team.lastMatchPoints !== undefined 
        ? (team.points ?? 0) - team.lastMatchPoints 
        : undefined;
      
      roasts.push(this.generateTeamRoast(team, rank, totalCount, delta));
    });

    return roasts;
  }

  /**
   * Generate targeted roasts: top 3 and bottom 3 only
   */
  generateKeyRoasts(data: DashboardData): Roast[] {
    const roasts: Roast[] = [];
    const list = Array.isArray(data.leaders) ? data.leaders : [];
    
    if (list.length === 0) return roasts;

    const sorted = [...list].sort((a, b) => (b.points ?? 0) - (a.points ?? 0));
    const totalCount = sorted.length;

    // Top 3
    sorted.slice(0, 3).forEach((team, idx) => {
      roasts.push(this.generateTeamRoast(team, idx + 1, totalCount));
    });

    // Bottom 3
    sorted.slice(-3).forEach((team, idx) => {
      const rank = totalCount - 2 + idx;
      roasts.push(this.generateTeamRoast(team, rank, totalCount));
    });

    return roasts;
  }

  getLatestRoasts(count: number = 4): Roast[] {
    return this.roastHistory.slice(-count);
  }

  getRoastsBySentiment(sentiment: Roast["sentiment"]): Roast[] {
    return this.roastHistory.filter(r => r.sentiment === sentiment);
  }

  getAllRoasts(): Roast[] {
    return [...this.roastHistory];
  }

  private addToHistory(roast: Roast): void {
    this.roastHistory.push(roast);
    if (this.roastHistory.length > this.maxHistory) {
      this.roastHistory = this.roastHistory.slice(-this.maxHistory);
    }
  }

  clearHistory(): void {
    this.roastHistory = [];
    usedTemplateIds.clear();
  }

  clearSessionTemplates(): void {
    this.currentSessionTemplates.clear();
  }
}

// Singleton instance
export const roastGenerator = new AIRoastGenerator();

// Quick function for one-off roasts
export function roastTeam(team: Leader, rank: number, totalCount: number): string {
  const roast = roastGenerator.generateTeamRoast(team, rank, totalCount);
  return roast.message;
}