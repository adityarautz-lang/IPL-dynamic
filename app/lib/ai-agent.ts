/**
 * Truly Dynamic Roast Generator - AI powered, never repetitive
 */

import Groq from "groq-sdk";

export interface RoastResult {
  id: string;
  teamName: string;
  matchPoints: number;
  seasonPoints: number;
  roast: string;
  sentiment: "positive" | "negative" | "neutral";
  matchId: number;
  timestamp: Date;
  analysis: {
    matchRank: number;
    seasonRank: number;
    performance: "legendary" | "solid" | "mid" | "struggling" | "disaster";
    vsExpectation: "overperforming" | "underperforming" | "as_expected";
    rankMovement: "up" | "down" | "same";
    matchPerformance: "very_low" | "low" | "average" | "good" | "excellent";
  };
}

class DynamicRoastAgent {
  private groq: Groq | null = null;
  private generationSeed: number = 0;

  initialize(apiKey: string): void {
    this.groq = new Groq({ apiKey });
    this.generationSeed = Date.now();
    console.log("🔥 Dynamic Roast Agent started at", new Date().toISOString());
  }

  isReady(): boolean {
    return this.groq !== null;
  }

  private getPerformanceLevel(matchPoints: number, avgPoints: number, maxPoints: number): RoastResult["analysis"]["matchPerformance"] {
    if (matchPoints >= maxPoints * 0.9) return "excellent";
    if (matchPoints / avgPoints >= 1.4) return "excellent";
    if (matchPoints / avgPoints >= 1.1) return "good";
    if (matchPoints / avgPoints >= 0.8) return "average";
    if (matchPoints / avgPoints >= 0.4) return "low";
    return "very_low";
  }

  private getRankMovement(matchRank: number, seasonRank: number): "up" | "down" | "same" {
    const diff = seasonRank - matchRank;
    if (diff > 2) return "up";
    if (diff < -2) return "down";
    return "same";
  }

  private randomStyle(): string {
    const styles = [
      "savage", "fake_praise", "commentator", "comparison", 
      "leaderboard_flex", "leaderboard_shame", "motivational_gone_wrong"
    ];
    // Use seed + position for variety but determinism
    const idx = Math.floor((this.generationSeed * Math.random()) % styles.length);
    return styles[idx];
  }

  async generateRoast(
    teamName: string,
    matchPoints: number,
    matchRank: number,
    seasonPoints: number,
    seasonRank: number,
    totalTeams: number,
    avgPerMatch: number,
    maxPoints: number,
    performance: RoastResult["analysis"]["matchPerformance"],
    rankMovement: "up" | "down" | "same",
    generationOrder: number
  ): Promise<string> {
    if (!this.groq) {
      throw new Error("Not initialized");
    }

    this.generationSeed = Date.now() + generationOrder * 1000;
    const style = this.randomStyle();
    
    const isTop = matchRank <= totalTeams * 0.1;
    const isBottom = matchRank > totalTeams * 0.5;
    const isMid = !isTop && !isBottom;

    // Dynamic context based on exact numbers
    const rankPercentile = Math.round((matchRank / totalTeams) * 100);
    const ptsAboveAvg = Math.round(matchPoints - avgPerMatch);
    const seasonAvgPts = Math.round(seasonPoints / (totalTeams * 3));
    const isPeak = matchPoints >= maxPoints * 0.95;
    const isFloor = matchPoints <= maxPoints * 0.1;

    const prompt = `You are a savage WhatsApp group friend roasting teams. Generate a UNIQUE roast.

CONTEXT for "${teamName}":
- ${matchPoints} POINTS scored today
- RANK #${matchRank} of ${totalTeams} teams (top ${rankPercentile}%)
- ${seasonPoints} TOTAL season points
- SEASON RANK #${seasonRank}
- ${Math.round(avgPerMatch)} avg per match
- ${ptsAboveAvg >= 0 ? "+" : ""}${ptsAboveAvg} vs average

${isTop && performance !== "excellent" ? "TOP team having an off day - DESTROY them" : ""}
${isBottom && performance !== "very_low" ? "Bottom team struggling - mock gently" : ""}
${isMid ? "Mid-table team - confused energy" : ""}
${performance === "very_low" ? "Terrible performance - savage comedy roast" : ""}
${performance === "excellent" ? "Top performance - hype with warning" : ""}
${performance === "low" ? "Below average - mock disappointment" : ""}
${isPeak ? "Personal best! Acknowledge greatness" : ""}
${isFloor ? "Rock bottom - destroy with comedy" : ""}
${rankMovement === "down" ? "Rank dropped - expose them" : ""}
${rankMovement === "up" ? "Rank improved - acknowledge but tease" : ""}

RULES:
- Exactly 2 lines, use \n
- Mix Hinglish naturally (bhai, re, kya, kaar)
- No more than 3 emojis
- Be funny and savage
- Different from other teams
- Include the EXACT points: ${matchPoints}

Write the roast now:`;

    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a chaotic WhatsApp group friend who roasts teams savagely.
Examples:
- "727 points at #1. Top of the world but tomorrow everything changes 🔥"
- "25 points at #8. Kay re, auto-pick would do better 💀"
- "285 points from nowhere. The ghost has returned! 👻"

Always include exact points. 2 lines max. Mix Hindi/English. Vary your style. Be brutal but funny.`
          },
          { role: "user", content: prompt }
        ],
        model: "llama-3.1-8b-instant",
        max_tokens: 80,
        temperature: 1.0 + (generationOrder * 0.05), // Increasing randomness per team
        top_p: 0.9 + (generationOrder * 0.01),
        frequency_penalty: 0.5 + (generationOrder * 0.1), // Reduce repetition
        presence_penalty: 0.3 + (generationOrder * 0.05),
      });

      let roast = response.choices[0]?.message?.content?.trim() || "";
      
      // Clean up
      roast = roast.replace(/^["']|["']$/g, "").trim();
      roast = roast.replace(/^[^]*?:?\s*/, "").trim(); // Remove "Roast:" prefix if any
      
      // Ensure 2 lines
      const lines = roast.split("\n").filter(l => l.trim().length > 5);
      if (lines.length >= 2) {
        roast = lines.slice(0, 2).join("\n");
      } else if (lines.length === 1) {
        const words = lines[0].split(" ");
        if (words.length > 8) {
          const mid = Math.floor(words.length / 2);
          roast = words.slice(0, mid).join(" ") + "\n" + words.slice(mid).join(" ");
        } else {
          roast = lines[0] + "\n" + (performance === "very_low" ? "Random pick better hota 💀" : "Not bad, not great either 🤷");
        }
      } else {
        roast = this.getFallback(teamName, matchPoints, matchRank, performance);
      }

      // Ensure it mentions points
      if (!roast.includes(matchPoints.toString()) && !roast.includes("points")) {
        roast = roast.split("\n")[0] + ` (${matchPoints} pts)\n` + roast.split("\n")[1];
      }

      return roast;

    } catch (error) {
      console.error("AI roast failed:", error);
      return this.getFallback(teamName, matchPoints, matchRank, performance);
    }
  }

  private getFallback(team: string, pts: number, rank: number, perf: string): string {
    if (perf === "very_low") {
      return `${team} scored ${pts} at #${rank}.\nKay re, random click kela tar better hota! 💀`;
    }
    if (perf === "low") {
      return `${team} got ${pts} points at #${rank}.\nThoda try kar le bhai, itna chill nahi! 😅`;
    }
    if (perf === "excellent") {
      return `${team} dropped ${pts} at #${rank} 🔥\nFull jhakaas mode today!`;
    }
    if (perf === "good") {
      return `${team} at #${rank} with ${pts}.\nAaj thoda dimag use kiya lagta hai 😏`;
    }
    return `${team} at #${rank} with ${pts}.\nNa jeet raha, na haar raha... 🤔`;
  }

  async processMatch(
    users: { name: string; points: number; lastMatchPoints: number; previousMatchPoints?: number }[],
    matchId: number
  ): Promise<RoastResult[]> {
    if (!this.isReady()) {
      throw new Error("Not initialized");
    }

    this.generationSeed = Date.now();
    console.log("🔥 Generating fresh roasts at", new Date().toISOString());

    const validUsers = users.filter(u => u.lastMatchPoints > 0);
    const allMatchPoints = validUsers.map(u => u.lastMatchPoints);
    const maxPoints = Math.max(...allMatchPoints);

    const matchRanking = [...validUsers].sort((a, b) => b.lastMatchPoints - a.lastMatchPoints);
    const matchRankMap = new Map(matchRanking.map((u, i) => [u.name, i + 1]));

    const seasonRanking = [...validUsers].sort((a, b) => b.points - a.points);
    const seasonRankMap = new Map(seasonRanking.map((u, i) => [u.name, i + 1]));

    const roasts: RoastResult[] = [];

    // Generate with increasing randomness for variety
    for (let i = 0; i < validUsers.length; i++) {
      const user = validUsers[i];
      const mRank = matchRankMap.get(user.name) || 1;
      const sRank = seasonRankMap.get(user.name) || 1;
      const avg = user.points / Math.max(validUsers.length, 1);

      const perf = this.getPerformanceLevel(user.lastMatchPoints, avg, maxPoints);
      const rankMov = this.getRankMovement(mRank, sRank);

      const roast = await this.generateRoast(
        user.name,
        user.lastMatchPoints,
        mRank,
        user.points,
        sRank,
        validUsers.length,
        avg,
        maxPoints,
        perf,
        rankMov,
        i
      );

      let performance: RoastResult["analysis"]["performance"];
      let vsExpectation: RoastResult["analysis"]["vsExpectation"];
      let sentiment: RoastResult["sentiment"];

      if (perf === "excellent") {
        performance = "legendary";
        sentiment = "positive";
        vsExpectation = "overperforming";
      } else if (perf === "very_low" || perf === "low") {
        performance = "disaster";
        sentiment = "negative";
        vsExpectation = "underperforming";
      } else if (mRank <= sRank - 3) {
        performance = "solid";
        sentiment = "positive";
        vsExpectation = "overperforming";
      } else if (mRank > sRank + 3 || (sRank <= 3 && mRank > 6)) {
        performance = "struggling";
        sentiment = "negative";
        vsExpectation = "underperforming";
      } else {
        performance = perf === "good" ? "solid" : "mid";
        sentiment = "neutral";
        vsExpectation = "as_expected";
      }

      roasts.push({
        id: `roast_${Date.now()}_${i}_${Math.random().toString(36).slice(2, 6)}`,
        teamName: user.name,
        matchPoints: user.lastMatchPoints,
        seasonPoints: user.points,
        roast,
        sentiment,
        matchId,
        timestamp: new Date(),
        analysis: {
          matchRank: mRank,
          seasonRank: sRank,
          performance,
          vsExpectation,
          rankMovement: rankMov,
          matchPerformance: perf,
        },
      });
    }

    return roasts.sort((a, b) => b.matchPoints - a.matchPoints);
  }
}

export const roastAgent = new DynamicRoastAgent();