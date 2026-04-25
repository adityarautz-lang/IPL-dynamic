/**
 * Real AI Roast Generator using Groq
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

// ✅ UPDATED SYSTEM PROMPT (STRICT ENGLISH + CURRENT MATCH FOCUS)
const SYSTEM_PROMPT = `You are a witty IPL fantasy league commentator with a dry, British-style sense of humour.

Tone:
- Lightly sarcastic, never insulting
- Calm, observant, and clever
- Fully in English (no slang or mixed language)
- Respectful and suitable for a broad audience

Context:
- You are commenting ONLY on the current match performance
- Do NOT reference past matches, trends, or improvements
- Focus only on how the team performed in this match

Style:
- Use cricketing language (innings, form, collapse, partnerships)
- Optional light Bollywood-style comparisons, but subtle
- Keep it relatable for an Indian audience

Rules:
- Maximum 1–2 short sentences
- No aggressive humour or internet slang
- No emojis in the middle of sentences (optional at end)

Examples:
- "{team} put up {points} — a steady innings, though not one that will trouble the scorers."
- "{team} with {points} points. A performance that felt more cautious than commanding."
- "{team} managed {points}. One might say it lacked the final flourish."
- "{team} on {points}. A decent outing, though unlikely to dominate discussions."`;

async function generateSingleRoast(
  teamName: string,
  points: number,
  prevPoints: number,
  delta: number,
  allTeamsPoints: number[]
): Promise<string> {
  const client = getGroqClient();

  const avgPoints =
    allTeamsPoints.reduce((a, b) => a + b, 0) / allTeamsPoints.length;

  // ✅ USER PROMPT — CURRENT MATCH ONLY
  const userPrompt = `Generate a short cricket-style comment for "${teamName}" who scored ${points} points in this match.

League average for this match is ${Math.round(avgPoints)} points.

Keep it under 25 words. Make it subtle, witty, and focused only on this match performance.`;

  try {
    const chat = await client.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      model: "llama-3.1-8b-instant",
      max_tokens: 100,
      temperature: 0.7,
    });

    const roast = chat.choices[0]?.message?.content?.trim();
    if (roast) return roast;
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("AI roast error:", error);
    return generateFallbackRoast(teamName, points, avgPoints);
  }
}

// ✅ SIMPLIFIED FALLBACK (CURRENT MATCH ONLY)
function generateFallbackRoast(
  teamName: string,
  points: number,
  avgPoints: number
): string {
  if (points > avgPoints * 1.5) {
    return `${teamName} delivered ${points} — a commanding performance with little left to question.`;
  } else if (points < avgPoints * 0.5) {
    return `${teamName} managed ${points}. A difficult outing that never quite found momentum.`;
  } else {
    return `${teamName} scored ${points}. A measured performance without much drama.`;
  }
}

export async function generateMatchRoasts(
  users: { temname: string; matches: { matchId: number; points: number }[] }[],
  currentMatchId: number
): Promise<MatchRoast[]> {
  const roasts: MatchRoast[] = [];

  const allTeamsPoints: number[] = [];
  const teamData: {
    name: string;
    points: number;
    prev: number;
    delta: number;
  }[] = [];

  users.forEach((user) => {
    const currentMatch = user.matches.find(
      (m) => m.matchId === currentMatchId
    );
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

  teamData.sort((a, b) => b.points - a.points);

  const roastPromises = teamData.map(async (data) => {
    const message = await generateSingleRoast(
      data.name,
      data.points,
      data.prev,
      data.delta,
      allTeamsPoints
    );

    const sentiment: MatchRoast["sentiment"] =
      data.points > 500
        ? "positive"
        : data.points < 100
        ? "negative"
        : "neutral";

    return {
      id:
        "roast_" +
        Date.now() +
        "_" +
        Math.random().toString(36).substring(2, 7),
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

  const results = await Promise.all(roastPromises);
  roasts.push(...results);

  return roasts.sort((a, b) => b.points - a.points);
}

// Cache
let lastMatchId: number | null = null;
let cachedRoasts: MatchRoast[] = [];
let cacheTimestamp: number = 0;
const CACHE_DURATION = 60000;

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