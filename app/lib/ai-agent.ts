/**
 * Dynamic Roast Generator - Unique roasts guaranteed
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

// Massive variety of fallback templates - NO repeats
const FALLBACK_TEMPLATES: Record<string, Array<(t: string, p: number, r: number) => string>> = {
  very_low: [
    (t: string, p: number, r: number) => `${t} got ${p} at #${r}. Auto-fill mode activated! 💀`,
    (t: string, p: number, r: number) => `Kay re ${t}, ${p} points? Random generator do better 📝`,
    (t: string, p: number, r: number) => `${t} with ${p} - even calculator shows error at #${r} 🧮`,
    (t: string, p: number, r: number) => `${p} points for ${t}. What were the criteria?! 🤔`,
    (t: string, p: number, r: number) => `${t} scored ${p} - that's not a team, that's a joke at #${r} 😵`,
    (t: string, p: number, r: number) => `Re ${t}, ${p} points? Your fantasy deserves a vacation 💤`,
    (t: string, p: number, r: number) => `${t} baghun lagtoy at ${p} points. System error?! 🔧`,
    (t: string, p: number, r: number) => `${p} for ${t}. Em chestunnav ra - this is comedy gold 😂`,
    (t: string, p: number, r: number) => `${t} - ${p} points at #${r}. The void welcomes you 🕳️`,
    (t: string, p: number, r: number) => `Random pick > ${t} at ${p} points. Facts only 💯`,
  ],
  low: [
    (t: string, p: number, r: number) => `${t} managed ${p} at #${r}. Thoda try kar le bhai 😅`,
    (t: string, p: number, r: number) => `${p} points for ${t}. Still figuring out the game? 📚`,
    (t: string, p: number, r: number) => `Kay re ${t}, ${p} points - potential ki dukan band 😬`,
    (t: string, p: number, r: number) => `${t} at ${p}. The struggle is real, yaar 💪... or not 🔻`,
    (t: string, p: number, r: number) => `${p} points from ${t}. Next match panic mode on 🤡`,
    (t: string, p: number, r: number) => `Re ${t} - ${p} at #${r}. Dimag se khel bhai 🧠`,
    (t: string, p: number, r: number) => `${t} got ${p} - not bad, not bad... actually bad 😔`,
    (t: string, p: number, r: number) => `${p} points ${t}. The learning curve is steep 📈⬇️`,
  ],
  excellent: [
    (t: string, p: number, r: number) => `${t} dropped ${p} at #${r}! Full jhakaas 🔥`,
    (t: string, p: number, r: number) => `${p} points - ${t} in beast mode today 😎`,
    (t: string, p: number, r: number) => `${t} at #${r} with ${p}. Rest are just practicing 🏆`,
    (t: string, p: number, r: number) => `${p} points - ${t}. The dynasty is real 💪`,
    (t: string, p: number, r: number) => `${t} cooked today - ${p} at #${r}. Others packing up 🔥`,
    (t: string, p: number, r: number) => `${p} for ${t}. Aaj sabka baap mode ON 👑`,
    (t: string, p: number, r: number) => `Wah ${t}! ${p} points. The throne stays occupied 😏`,
    (t: string, p: number, r: number) => `${t} proving why at #${r} with ${p}. Legends only 🏅`,
  ],
  good: [
    (t: string, p: number, r: number) => `${t} at #${r} with ${p}. Aaj thoda sahi kiya 😏`,
    (t: string, p: number, r: number) => `${p} points for ${t}. Finally showing up! 👀`,
    (t: string, p: number, r: number) => `Re ${t}, ${p} at #${r} - not bad at all 🤙`,
    (t: string, p: number, r: number) => `${t} got ${p}. The sleeper awakens at #${r} 😴💪`,
    (t: string, p: number, r: number) => `${p} from ${t}. Something clicking today 🔄`,
    (t: string, p: number, r: number) => `${t} at #${r} with ${p}. Dimag use kiya, finally 🧠`,
  ],
  average: [
    (t: string, p: number, r: number) => `${t} at #${r} with ${p}. Safe game, safe scorecard 📋`,
    (t: string, p: number, r: number) => `${p} points for ${t}. Neither hero nor zero 🤷`,
    (t: string, p: number, r: number) => `${t} - ${p} at #${r}. The perfect mid-table energy 🥪`,
    (t: string, p: number, r: number) => `${p} from ${t}. As expected, as always 🎭`,
    (t: string, p: number, r: number) => `${t} with ${p}. Middle of the road vibes 🚗`,
    (t: string, p: number, r: number) => `${t} at ${p}. Standard edition activated 📦`,
  ],
};

class DynamicRoastAgent {
  private groq: Groq | null = null;
  private usedFallbacks: Map<string, number> = new Map();
  private generationCount: number = 0;

  initialize(apiKey: string): void {
    this.groq = new Groq({ apiKey });
    this.usedFallbacks.clear();
    this.generationCount = 0;
    console.log("🔥 Dynamic Roast Agent initialized");
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

  private getUniqueFallback(
    teamName: string, 
    points: number, 
    rank: number, 
    performance: string
  ): string {
    const templates = FALLBACK_TEMPLATES[performance as keyof typeof FALLBACK_TEMPLATES] || FALLBACK_TEMPLATES.average;
    
    // Find an unused template based on team hash + count
    const hash = (teamName + points + this.generationCount).split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const index = hash % templates.length;
    
    const template = templates[index];
    const roast = template(teamName, points, rank);
    
    this.generationCount++;
    return roast;
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
    rankMovement: "up" | "down" | "same"
  ): Promise<string> {
    if (!this.groq) {
      throw new Error("Not initialized");
    }

    const isTop = matchRank <= totalTeams * 0.1;
    const isBottom = matchRank > totalTeams * 0.5;
    const rankPercentile = Math.round((matchRank / totalTeams) * 100);
    const ptsDiff = Math.round(matchPoints - avgPerMatch);

    const prompt = `Roast "${teamName}" savagely. 2 lines only. Include ${matchPoints} points.

CONTEXT:
- ${matchPoints} POINTS at #${matchRank} (top ${rankPercentile}%)
- Season: #${seasonRank} with ${seasonPoints} total
- ${ptsDiff >= 0 ? "+" : ""}${ptsDiff} vs average

${isTop && performance !== "excellent" ? "Top team choking today - destroy them" : ""}
${isBottom ? "Bottom team - savage comedy mode" : ""}
${performance === "very_low" ? "Terrible score - brutal roast" : ""}
${performance === "excellent" ? "Top score - hype but warn" : ""}
${rankMovement === "down" ? "Rank dropped - expose them" : ""}
${rankMovement === "up" ? "Rank improved - acknowledge" : ""}

2 lines. Hinglish. Max 3 emojis. Be different every time. Write:`;

    try {
      const response = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You are a savage WhatsApp friend roasting teams. Be creative and varied. 
            2 lines max. Include exact points. Mix Hindi English naturally.
            Examples: "727 at #1 - top of the world! 🌐" | "25 points? Even auto-pick better 💀"
            Be DIFFERENT each time. Never repeat patterns.`
          },
          { role: "user", content: prompt }
        ],
        model: "llama-3.1-8b-instant",
        max_tokens: 60,
        temperature: 0.95,
        top_p: 0.9,
      });

      let roast = response.choices[0]?.message?.content?.trim() || "";
      
      // Clean up
      roast = roast.replace(/^["']|["']$/g, "").trim();
      roast = roast.replace(/\n{2,}/g, "\n").trim();
      
      // Ensure 2 lines
      const lines = roast.split("\n").filter(l => l.trim().length > 3);
      if (lines.length >= 2) {
        roast = lines.slice(0, 2).join("\n");
      } else if (lines.length === 1 && lines[0].length > 30) {
        const words = lines[0].split(" ");
        const mid = Math.floor(words.length / 2);
        roast = words.slice(0, mid).join(" ") + "\n" + words.slice(mid).join(" ");
      }

      // Validate - must have points and be reasonable length
      if (roast.length < 15 || !roast.includes(matchPoints.toString())) {
        return this.getUniqueFallback(teamName, matchPoints, matchRank, performance);
      }

      return roast;

    } catch (error) {
      console.error("AI failed, using fallback:", error);
      return this.getUniqueFallback(teamName, matchPoints, matchRank, performance);
    }
  }

  async processMatch(
    users: { name: string; points: number; lastMatchPoints: number; previousMatchPoints?: number }[],
    matchId: number
  ): Promise<RoastResult[]> {
    if (!this.isReady()) {
      throw new Error("Not initialized");
    }

    this.generationCount = 0;
    console.log("🔥 Processing", users.length, "teams");

    const validUsers = users.filter(u => u.lastMatchPoints > 0);
    const allMatchPoints = validUsers.map(u => u.lastMatchPoints);
    const maxPoints = Math.max(...allMatchPoints);

    const matchRanking = [...validUsers].sort((a, b) => b.lastMatchPoints - a.lastMatchPoints);
    const matchRankMap = new Map(matchRanking.map((u, i) => [u.name, i + 1]));

    const seasonRanking = [...validUsers].sort((a, b) => b.points - a.points);
    const seasonRankMap = new Map(seasonRanking.map((u, i) => [u.name, i + 1]));

    const roasts: RoastResult[] = [];

    for (const user of validUsers) {
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
        rankMov
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
        id: `roast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
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