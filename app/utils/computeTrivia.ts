export function computeTrivia(data: any[]) {
    if (!data || data.length === 0) return null;
  
    let highest = { team: "", points: 0, match: 0 };
    let lowest = { team: "", points: Infinity, match: 0 };
  
    const teamAverages: any[] = [];
  
    data.forEach((team) => {
      const matches = team.matches || [];
      const totalMatches = matches.length;
  
      const pts = matches.map((m: any) => m.points || 0);
  
      // 📊 Average score
      const avg =
        pts.reduce((a: number, b: number) => a + b, 0) /
        (pts.length || 1);
  
      teamAverages.push({
        team: team.teamName,
        avg,
      });
  
      matches.forEach((m: any) => {
        const actualMatchNumber =
          totalMatches - m.matchIndex + 1;
  
        // 🏆 Highest score
        if (m.points > highest.points) {
          highest = {
            team: team.teamName,
            points: m.points,
            match: actualMatchNumber,
          };
        }
  
        // 💀 Lowest score
        if (m.points < lowest.points) {
          lowest = {
            team: team.teamName,
            points: m.points,
            match: actualMatchNumber,
          };
        }
      });
    });
  
    const bestAvg = [...teamAverages].sort(
      (a, b) => b.avg - a.avg
    )[0];
  
    const worstAvg = [...teamAverages].sort(
      (a, b) => a.avg - b.avg
    )[0];
  
    return {
      highest,
      lowest,
      bestAvg,
      worstAvg,
    };
  }