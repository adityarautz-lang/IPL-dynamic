async function test() {
    const res = await fetch("http://localhost:3000/api/ipl");
    const data = await res.json();
  
    const leagueData = data.leagueData;
  
    const totals = {};
    const standings = [];
  
    // init totals
    leagueData.forEach((team) => {
      totals[team.teamName] = 0;
    });
  
    const totalMatches = leagueData[0].matches.length;
  
    for (let i = totalMatches; i >= 1; i--) {
      leagueData.forEach((team) => {
        const match = team.matches.find((m) => m.matchIndex === i);
        totals[team.teamName] += match?.points || 0;
      });
  
      const ranking = Object.entries(totals)
        .map(([team, pts]) => ({ team, pts }))
        .sort((a, b) => b.pts - a.pts)
        .map((t, idx) => ({
          team: t.team,
          rank: idx + 1,
        }));
  
      standings.push({
        match: totalMatches - i + 1,
        table: ranking,
      });
    }
  
    console.log("📈 Sample standings:");
    console.log(JSON.stringify(standings.slice(0, 3), null, 2));
  }
  
  test();