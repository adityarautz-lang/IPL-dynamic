/**
 * Real AI Roast Generator using Groq
 * Dynamically generates roast comments for each team based on their actual performance
 */

import Groq from "groq-sdk";

export interface MatchRoast {
  id: string;
  teamName: string;
  matchId: number;
  points: number;
  previousPoints: number;
  delta: number;
  message: string;
  sentiment: "positive" | "negative" | "neutral";
  timestamp: Date;
}

// Initialize Groq client
let groqClient: Groq | null = null;

function getGroqClient(): Groq {
  if (!groqClient) {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY not found in environment");
    }
    groqClient = new Groq({ apiKey });
  }
  return groqClient;
}

// System prompt for the AI roaster
const SYSTEM_PROMPT = `You are a hilarious, savage IPL fantasy league commentator. You roast teams in a funny,阴阳怪气的 style.
You MUST:
- Be sarcastic and witty
- Reference their actual points (DELTA shows change from last match)
- Make jokes about specific scores
- Use casual internet humor
- Keep roasts SHORT (1-2 sentences max)
- NEVER be overly nice - roast hard!
- Mix of Hindi-English slang is encouraged

Examples:
- "700 points?? Bro was COOKING while others were reheating leftover teams 💀"
- "Yikes, 25 points. Even my WiFi router scores higher than {team} today"
- "{team} went from {prev} to {curr}. That's not a comeback, that's a cry for help 📉"
- "POV: You're {team} with {points} points. The leaderboard laughed. Then cried."`;

async function generateSingleRoast(
  teamName: string,
  points: number,
  prevPoints: number,
  delta: number,
  allTeamsPoints: number[]
): Promise<string> {
  const client = getGroqClient();

  const avgPoints = allTeamsPoints.reduce((a, b) => a + b, 0) / allTeamsPoints.length;
  const percentile = Math.round(
    (allTeamsPoints.filter(p => p < points).length / allTeamsPoints.length) * 100
  );

  const userPrompt = `Generate a SHORT roast comment for "${teamName}" who scored ${points} points this match.
${prevPoints > 0 ? `Previous match: ${prevPoints} points.` : 'First match of the season.'}
${delta !== 0 ? `Change: ${delta >= 0 ? '+' : ''}${delta} points.` : ''}
League average: ${Math.round(avgPoints)} pts. They're at ${percentile}th percentile.

Keep it under 25 words. Make it savage and funny. No emojis in the middle of sentences - only at the end if needed.`;

  try {
    const chat = await client.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 100,
      temperature: 0.8,
    });

    const roast = chat.choices[0]?.message?.content?.trim();
    if (roast) return roast;
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("AI roast error:", error);
    // Fallback
    return generateFallbackRoast(teamName, points, prevPoints, delta, avgPoints);
  }
}

function generateFallbackRoast(
  teamName: string,
  points: number,
  prevPoints: number,
  delta: number,
  avgPoints: number
): string {
  if (delta > 200) {
    return `${teamName} just dropped ${points} points after ${prevPoints}. ABSOLUTE UNITS!`;
  } else if (points > avgPoints * 1.5) {
    return `${teamName} with ${points} pts is absolutely cooking today. Others are catching up? Never.`;
  } else if (points < avgPoints * 0.3) {
    return `${teamName} managed ${points} pts. Even the stadium WiFi had better connectivity today.`;
  } else if (delta > 50) {
    return `${teamName} bounced back from ${prevPoints} to ${points}. Redemption arc activated.`;
  } else if (delta < -50) {
    return `${teamName} dropped from ${prevPoints} to ${points}. That's not a slump, that's a freefall.`;
  } else {
    return `${teamName} scored ${points} pts. Mid-tier energy but someone's gotta be there.`;
  }
}

// Generate roasts for all teams
export async function generateMatchRoasts(
  users: { temname: string; matches: { matchId: number; points: number }[] }[],
  currentMatchId: number
): Promise<MatchRoast[]> {
  const roasts: MatchRoast[] = [];
  const totalTeams = users.length;

  // Collect all points for this match for percentile calculation
  const allTeamsPoints: number[] = [];
  const teamData: { name: string; points: number; prev: number; delta: number }[] = [];

  users.forEach((user) => {
    const currentMatch = user.matches.find((m) => m.matchId === currentMatchId);
    const previousMatch = user.matches
      .filter((m) => m.matchId < currentMatchId && m.points > 0)
      .sort((a, b) => b.matchId - a.matchId)[0];

    if (!currentMatch) return;

    const currentPoints = currentMatch.points;
    const previousPoints = previousMatch?.points ?? 0;
    const delta = currentPoints - previousPoints;

    allTeamsPoints.push(currentPoints);
    teamData.push({
      name: user.temname,
      points: currentPoints,
      prev: previousPoints,
      delta,
    });
  });

  // Sort by points (best to worst)
  teamData.sort((a, b) => b.points - a.points);

  // Generate AI roast for each team
  const roastPromises = teamData.map(async (data, index) => {
    const message = await generateSingleRoast(
      data.name,
      data.points,
      data.prev,
      data.delta,
      allTeamsPoints
    );

    const sentiment: MatchRoast["sentiment"] =
      data.points > 500 || data.delta > 100
        ? "positive"
        : data.points < 100 || data.delta < -100
        ? "negative"
        : "neutral";

    return {
      id: "roast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      teamName: data.name,
      matchId: currentMatchId,
      points: data.points,
      previousPoints: data.prev,
      delta: data.delta,
      message,
      sentiment,
      timestamp: new Date(),
    };
  });

  // Wait for all roasts (they run in parallel)
  const results = await Promise.all(roastPromises);
  roasts.push(...results);

  return roasts.sort((a, b) => b.delta - a.delta);
}

// Singleton for caching
let lastMatchId: number | null = null;
let cachedRoasts: MatchRoast[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000; // 1 minute

export function getCachedRoasts(matchId: number): MatchRoast[] {
  if (lastMatchId !== matchId) return [];
  if (Date.now() - cacheTimestamp > CACHE_DURATION) return [];
  return cachedRoasts;
}

export function cacheRoasts(matchId: number, roasts: MatchRoast[]): void {
  lastMatchId = matchId;
  cachedRoasts = roasts;
  cacheTimestamp = Date.now();
}