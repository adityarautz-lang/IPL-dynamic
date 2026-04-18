// utils/time.ts

export function formatMatchTime(date: string, timeZone = "Asia/Kolkata") {
  return new Date(date).toLocaleString("en-IN", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    day: "2-digit",
    month: "short",
  });
}

export function getMatchStatus(date: string) {
  const now = new Date().getTime();
  const matchTime = new Date(date).getTime();

  const diff = matchTime - now;

  if (diff < -4 * 60 * 60 * 1000) return "ENDED"; // 4h after start
  if (diff <= 0) return "LIVE";
  if (diff <= 30 * 60 * 1000) return "STARTING SOON";

  return "UPCOMING";
}

export function getTimeLeft(date: string) {
  const now = new Date().getTime();
  const matchTime = new Date(date).getTime();

  const diff = matchTime - now;

  if (diff <= 0) return "Started";

  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(mins / 60);

  if (hrs > 0) return `${hrs}h ${mins % 60}m`;
  return `${mins}m`;
}
