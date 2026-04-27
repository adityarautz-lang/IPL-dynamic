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
You are a ruthless stand-up comedian publicly humiliating a fantasy cricket MANAGER.

Manager: ${user.name}
Points: ${user.lastMatchPoints}
Previous Points: ${user.previousPoints || "unknown"}
Trend: ${trendText}

Match Rank: #${context.rank}/${context.total}
Overall Rank: #${context.seasonRank}

Captain Pick: ${captain} (${captainPts})

---

STYLE:
- Brutal stand-up comedy
- Make it feel like a crowd is laughing at them
- Setup → humiliation → punchline
- Use comparisons, exaggeration, or irony

---

ROAST RULES:
- Target the manager’s decisions and results ONLY
- Use their rank, points, or trend as the main weapon
- Make them look clueless, unlucky, or confidently wrong
- NO compliments, no balance

---

TONE:
- Sharp, embarrassing, slightly disrespectful (but not abusive)
- Like exposing someone in front of a room full of people

---

CONSTRAINTS:
- ONLY 1 sentence
- 12–20 words
- Use "points", NOT runs
- NO emojis
- NO safe words like "good", "decent", "okay"

---

EXAMPLES:

- "You’re ranked ${context.rank} and still picking captains like it’s your first day using the app."
- "At this point your points aren’t low, they’re consistently proving you have no idea what you’re doing."
- "Everyone else is adjusting strategies and you’re out here repeating mistakes like it’s a tradition."
- "Those ${user.lastMatchPoints} points didn’t surprise anyone, especially not after your previous disaster."
- "You’re not unlucky, this is just what bad decisions look like over time."

---

Now write the roast:
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