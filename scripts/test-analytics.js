async function test() {
    const res = await fetch("http://localhost:3000/api/ipl");
    const data = await res.json();
  
    const leagueData = data.leagueData;
  
    const matchMap = {};
  
    leagueData.forEach((team) => {
      team.matches.forEach((m) => {
        if (!matchMap[m.matchIndex]) {
          matchMap[m.matchIndex] = [];
        }
  
        matchMap[m.matchIndex].push({
          team: team.teamName,
          points: m.points,
        });
      });
    });
  
    const highlights = Object.entries(matchMap).map(([match, arr]) => {
      const sorted = arr.sort((a, b) => b.points - a.points);
  
      return {
        match,
        highest: sorted[0],
        lowest: sorted[sorted.length - 1],
      };
    });
  
    console.log("🔥 SAMPLE OUTPUT:");
    console.log(highlights.slice(0, 3));
  }
  
  test();