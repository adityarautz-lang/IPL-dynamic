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
    matchPerformance: string;
  };
}

// 🔥 PERSONALITY MAP (manager traits)
const TEAM_PERSONALITY: Record<string, string> = {
  "PKs11": "plays cricket day and night, still chaotic",
  "RSAwesome 11": "always late, ditches plans",
  "Watapi": "sarpanch mindset, big land owner energy",
  "Deccan Dominators": "lavish lifestyle, talks big",
  "VATVAGHOOL XI": "food lover, everywhere but distracted",
  "Bat Bowl XI": "missing from plans, lost in his own world",
  "SquadSeven9": "travels more than plans",
  "RushS01": "barely participates but still here somehow"
};

class DynamicRoastAgent {
  private groq: Groq | null = null;

  initialize(apiKey: string) {
    this.groq = new Groq({ apiKey });
  }

  isReady() {
    return !!this.groq;
  }

  async generateRoast(user: any, context: any) {
    if (!this.groq) throw new Error("Not initialized");

    const captain = user.captain?.name || "Unknown";
    const captainPts = user.captain?.points || 0;
    const personality = TEAM_PERSONALITY[user.name] || "";

    const trend =
      user.previousPoints !== undefined
        ? user.lastMatchPoints - user.previousPoints
        : 0;

    let trendText = "same pattern again";
    if (trend > 50) trendText = "finally improved";
    if (trend < -50) trendText = "somehow got worse";

    // 🎲 Random angle to reduce repetition
    const angles = [
      "decision making",
      "personality mismatch",
      "pattern repetition",
      "expectation vs reality",
      "captain choice"
    ];

    const angle = angles[Math.floor(Math.random() * angles.length)];

    const prompt = `
Manager: ${user.name}
Points: ${user.lastMatchPoints}
Previous Points: ${user.previousPoints || "unknown"}
Trend: ${trendText}

Match Rank: #${context.rank}/${context.total}
Overall Rank: #${context.seasonRank}

Captain Pick: ${captain} (${captainPts})

Personality:
${personality}

Focus Angle:
${angle}

Write a sarcastic roast about the MANAGER (not players).

STRICT RULES:
- Roast the manager’s decisions, not players
- ALWAYS compare (vs others, vs past, or expectation)
- Personality MUST be central
- Avoid phrases like "good", "decent", "nice"
- Avoid repeating structure

Tone:
- Sarcastic, slightly harsh, playful
- Like teasing a friend

Constraints:
- 1 sentence only
- Max 18–20 words
- Use "points", NOT runs
- No emojis
- No formal commentary

Examples:
- "All that cricket all day and still these captain calls, others clearly thinking ahead."
- "Always late and now even your points seem to arrive after everyone else."
- "Big talk off the field, but these decisions keep you exactly where you started."
- "Barely shows up and somehow the points reflect that commitment perfectly."

Write:
`;

    try {
      const res = await this.groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `You roast fantasy team managers.

Rules:
- Never talk like a cricket commentator
- Always target decisions and patterns
- Be sarcastic, varied, and slightly harsh (but not abusive)
- Avoid repetition`,
          },
          { role: "user", content: prompt },
        ],
        model: "llama-3.1-8b-instant",
        temperature: 1.0,
        top_p: 0.95,
        max_tokens: 60,
      });

      let roast = res.choices[0]?.message?.content?.trim() || "";

      // enforce wording
      roast = roast.replace(/\bruns\b/gi, "points");
      roast = roast.replace(/\n+/g, " ").trim();

      // safety trim
      const words = roast.split(" ");
      if (words.length > 20) {
        roast = words.slice(0, 20).join(" ");
      }

      return roast;

    } catch (err) {
      console.error("AI error:", err);

      return `${user.name} keeps doing the same thing and expecting different results, which is honestly impressive at this point.`;
    }
  }

  async processMatch(users: any[], matchId: number): Promise<RoastResult[]> {
    const sorted = [...users].sort(
      (a, b) => b.lastMatchPoints - a.lastMatchPoints
    );

    return Promise.all(
      sorted.map(async (u, i) => {
        const roast = await this.generateRoast(u, {
          rank: i + 1,
          total: users.length,
          seasonRank: u.rank,
        });

        return {
          id: `roast_${i}`,
          teamName: u.name,
          matchPoints: u.lastMatchPoints,
          seasonPoints: u.points,
          roast,
          sentiment: "neutral",
          matchId,
          timestamp: new Date(),
          analysis: {
            matchRank: i + 1,
            seasonRank: u.rank,
            matchPerformance: "avg",
          },
        };
      })
    );
  }
}

// ✅ FIXED EXPORT
const roastAgent = new DynamicRoastAgent();
export default roastAgent;