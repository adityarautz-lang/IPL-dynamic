export function computeSeasonInsights(
    history: any
  ) {
    if (!history?.teams)
      return [];
  
    const teams =
      history.teams;
  
    const insights: string[] =
      [];
  
    // =====================================
    // 🔥 Highest Avg Score
    // =====================================
    const averages = teams.map(
      (t: any) => {
        const avg =
          t.history.reduce(
            (
              s: number,
              m: any
            ) =>
              s +
              (m.points || 0),
  
            0
          ) /
          t.history.length;
  
        return {
          team: t.teamName,
          avg,
        };
      }
    );
  
    const bestAvg =
      averages.sort(
        (a, b) =>
          b.avg - a.avg
      )[0];
  
    insights.push(
      `🔥 ${bestAvg.team} owns the highest average match score this season (${bestAvg.avg.toFixed(
        1
      )} pts).`
    );
  
    // =====================================
    // ⚔️ Best Single Match
    // =====================================
    let bestMatch = {
      team: "",
  
      points: 0,
  
      match: "",
    };
  
    teams.forEach((t: any) => {
      t.history.forEach(
        (m: any) => {
          if (
            m.points >
            bestMatch.points
          ) {
            bestMatch = {
              team: t.teamName,
  
              points: m.points,
  
              match:
                m.matchName,
            };
          }
        }
      );
    });
  
    insights.push(
      `⚔️ ${bestMatch.team} produced the highest single-match explosion of the season (${bestMatch.points} pts in ${bestMatch.match}).`
    );
  
    // =====================================
    // 📈 Momentum
    // =====================================
    const momentum = teams.map(
      (t: any) => {
        const last5 =
          t.history
            .slice(-5)
            .reduce(
              (
                s: number,
                m: any
              ) =>
                s +
                (m.points || 0),
  
              0
            );
  
        return {
          team: t.teamName,
  
          total: last5,
        };
      }
    );
  
    const hottest =
      momentum.sort(
        (a, b) =>
          b.total - a.total
      )[0];
  
    insights.push(
      `📈 ${hottest.team} is the hottest playoff team right now, scoring ${hottest.total.toFixed(
        0
      )} pts across the last 5 matches.`
    );
  
    // =====================================
    // ❄️ Volatility
    // =====================================
    const volatility =
      teams.map((t: any) => {
        const values =
          t.history.map(
            (m: any) =>
              m.points || 0
          );
  
        const avg =
          values.reduce(
            (
              a: number,
              b: number
            ) => a + b,
            0
          ) / values.length;
  
        const variance =
          values.reduce(
            (
              s: number,
              v: number
            ) =>
              s +
              Math.pow(
                v - avg,
                2
              ),
  
            0
          ) / values.length;
  
        return {
          team: t.teamName,
  
          variance,
        };
      });
  
    const volatile =
      volatility.sort(
        (a, b) =>
          b.variance -
          a.variance
      )[0];
  
    insights.push(
      `❄️ ${volatile.team} remains the most volatile playoff contender, capable of both elite spikes and dramatic collapses.`
    );
  
    // =====================================
    // 🧠 Consistency
    // =====================================
    const consistency =
      teams.map((t: any) => {
        const top3 =
          t.history.filter(
            (m: any) =>
              m.points > 300
          ).length;
  
        return {
          team: t.teamName,
  
          top3,
        };
      });
  
    const mostConsistent =
      consistency.sort(
        (a, b) =>
          b.top3 - a.top3
      )[0];
  
    insights.push(
      `🧠 ${mostConsistent.team} has delivered the highest number of 300+ point performances this season.`
    );
  
    return insights;
  }