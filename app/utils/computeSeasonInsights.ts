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
        (
          a: any,
          b: any
        ) => b.avg - a.avg
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
        (
          a: any,
          b: any
        ) =>
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
        (
          a: any,
          b: any
        ) =>
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
        (
          a: any,
          b: any
        ) =>
          b.top3 - a.top3
      )[0];
  
    insights.push(
      `🧠 ${mostConsistent.team} has delivered the highest number of 300+ point performances this season.`
    );
  
    // =====================================
    // 🚀 Late Season Surge
    // =====================================
    const surges = teams.map(
      (t: any) => {
        const recent =
          t.history
            .slice(-10)
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
  
          recent,
        };
      }
    );
  
    const surgeLeader =
      surges.sort(
        (
          a: any,
          b: any
        ) =>
          b.recent -
          a.recent
      )[0];
  
    insights.push(
      `🚀 ${surgeLeader.team} has dominated the last 10 matches with ${surgeLeader.recent.toFixed(
        0
      )} total points.`
    );
  
    // =====================================
    // 🎯 Elite Ceiling
    // =====================================
    const ceiling = teams.map(
      (t: any) => {
        const max =
          Math.max(
            ...t.history.map(
              (m: any) =>
                m.points || 0
            )
          );
  
        return {
          team: t.teamName,
  
          max,
        };
      }
    );
  
    const highestCeiling =
      ceiling.sort(
        (
          a: any,
          b: any
        ) => b.max - a.max
      )[0];
  
    insights.push(
      `🎯 ${highestCeiling.team} owns the highest scoring ceiling this season with a peak of ${highestCeiling.max} points.`
    );
  
    // =====================================
    // 🧱 Stability
    // =====================================
    const stability = teams.map(
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
  
        const lowGames =
          t.history.filter(
            (m: any) =>
              (m.points || 0) <
              avg * 0.5
          ).length;
  
        return {
          team: t.teamName,
  
          lowGames,
        };
      }
    );
  
    const safest =
      stability.sort(
        (
          a: any,
          b: any
        ) =>
          a.lowGames -
          b.lowGames
      )[0];
  
    insights.push(
      `🧱 ${safest.team} has been the steadiest playoff performer with the fewest low-scoring collapses.`
    );
  
    // =====================================
    // 💥 Explosive Team
    // =====================================
    const explosive =
      teams.map((t: any) => {
        const bigGames =
          t.history.filter(
            (m: any) =>
              m.points > 500
          ).length;
  
        return {
          team: t.teamName,
  
          bigGames,
        };
      });
  
    const boomTeam =
      explosive.sort(
        (
          a: any,
          b: any
        ) =>
          b.bigGames -
          a.bigGames
      )[0];
  
    insights.push(
      `💥 ${boomTeam.team} has recorded the highest number of 500+ point explosions this season.`
    );
  
    // =====================================
    // ⚠️ Collapse Detection
    // =====================================
    const collapses =
      teams.map((t: any) => {
        const worst =
          Math.min(
            ...t.history.map(
              (m: any) =>
                m.points || 0
            )
          );
  
        return {
          team: t.teamName,
  
          worst,
        };
      });
  
    const collapseLeader =
      collapses.sort(
        (
          a: any,
          b: any
        ) =>
          a.worst -
          b.worst
      )[0];
  
    insights.push(
      `⚠️ ${collapseLeader.team} suffered the harshest single-match collapse with only ${collapseLeader.worst} points.`
    );
  
    return insights;
  }