export function computeHistoryMetrics(history: any) {
    if (!history?.teams) return null;
  
    const teams = history.teams;
    const matchCount = teams[0]?.history.length || 0;
  
    const topperCount: Record<string, number> = {};
    const bottomCount: Record<string, number> = {};
  
    let highest = { team: "", points: -Infinity, match: 0 };
    let lowest = { team: "", points: Infinity, match: 0 };
  
    for (let m = 0; m < matchCount; m++) {
      const ranking = teams
        .map((t: any) => ({
          name: t.teamName,
          points: t.history[m]?.points || 0,
        }))
        .sort((a: any, b: any) => b.points - a.points);
  
      const top = ranking[0];
      const bottom = ranking[ranking.length - 1];
  
      topperCount[top.name] = (topperCount[top.name] || 0) + 1;
      bottomCount[bottom.name] = (bottomCount[bottom.name] || 0) + 1;
  
      ranking.forEach((r: any) => {
        if (r.points > highest.points) {
          highest = { team: r.name, points: r.points, match: m + 1 };
        }
        if (r.points < lowest.points) {
          lowest = { team: r.name, points: r.points, match: m + 1 };
        }
      });
    }
  
    const maxTopper = Object.entries(topperCount).sort(
      (a, b) => b[1] - a[1]
    )[0];
  
    const maxBottom = Object.entries(bottomCount).sort(
      (a, b) => b[1] - a[1]
    )[0];
  
    return {
      maxTopper: { team: maxTopper?.[0], count: maxTopper?.[1] },
      maxBottom: { team: maxBottom?.[0], count: maxBottom?.[1] },
      highest,
      lowest,
    };
  }