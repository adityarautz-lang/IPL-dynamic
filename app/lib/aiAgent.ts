/**
 * AI Agent Commentary (Stand-Up Comedy Edition 🎤🔥)
 * Less "sports analyst", more "guy roasting your entire existence on stage"
 */

export const aiAgent = {
  praise: (team: string, pts: number) => {
    const lines = [
      `${team} dropped ${pts} points... ${pts}!! At this point, check them for hacks. That's not performance, that's a software update.`,
      `${pts} points by ${team}? Bro, the opponent didn’t lose, they experienced character development.`,
      `${team} scored ${pts} like rent was due tomorrow. Urgency. Panic. Excellence.`,
      `${team} put up ${pts}… I’ve seen less dominance in dictatorship documentaries.`,
      `${pts} points?? ${team} woke up and chose violence… and then scheduled overtime.`,
      `${team} with ${pts} points. At this point it's not a match, it’s a TED Talk on superiority.`,
      `${team} dropped ${pts}… even their warm-up probably had better stats than the other team.`,
      `${pts} points by ${team}. That’s not a score, that’s a public service announcement.`,
      `${team} really said “fair play” and then ignored it completely with ${pts}.`,
      `${team} scored ${pts}. Somewhere, the opponent just googled “how to uninstall match”.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  roast: (team: string, pts: number) => {
    const lines = [
      `${team} scored ${pts}… ${pts}. I’ve seen people accidentally type higher numbers.`,
      `${pts} points by ${team}? That’s not a score, that’s a typo.`,
      `${team} with ${pts}… were they playing or just… present emotionally?`,
      `${team} scored ${pts}. At this point, even their excuses need practice.`,
      `${pts} points?? Bro my phone battery lasts longer than that performance.`,
      `${team} dropped ${pts}… dropped is correct, because nothing was lifted.`,
      `${team} really gave us ${pts} and said “this is enough”. The confidence?? Delusional.`,
      `${pts} points by ${team}. That’s not effort, that’s a suggestion.`,
      `${team}: ${pts} points and zero explanation. Scientists are still confused.`,
      `${team} scored ${pts}. Honestly I respect it… takes courage to fail this publicly.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  consistency: (team: string, volatility: number) => {
    const lines = [
      `${team} is so consistent (vol ${volatility.toFixed(1)}), it’s honestly suspicious. Check if they’re a government job.`,
      `${team} plays the same every time. Same energy, same results… same personality too probably.`,
      `${volatility.toFixed(1)} volatility? ${team} said “why grow when you can plateau professionally?”`,
      `${team} is consistent. Not exciting, not terrible… just emotionally stable like a spreadsheet.`,
      `${team} with that ${volatility.toFixed(1)} volatility… I’ve seen more variation in elevator music.`,
      `${team} doesn’t believe in surprises. Every match feels like a rerun episode.`,
      `${team} is so predictable, even spoilers don’t matter anymore (vol ${volatility.toFixed(1)}).`,
      `${volatility.toFixed(1)} volatility? ${team} said “we don’t do chaos here, only mild satisfaction.”`,
      `${team} brings the same performance every time… like a franchise that refuses to innovate.`,
      `${team} is consistent. Not winning hearts, not breaking records… just existing reliably.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  leader: (team: string, avg: number) => {
    const lines = [
      `${team} averaging ${avg.toFixed(1)}… at this point, they’re not leading, they’re gatekeeping success.`,
      `${avg.toFixed(1)} per match?? ${team} didn’t climb the leaderboard, they bought property there.`,
      `${team} with ${avg.toFixed(1)} average. Others are competing, these guys are hosting the event.`,
      `${team} said “we’ll lead” and then never looked back. Toxic behavior honestly.`,
      `${avg.toFixed(1)} pts average by ${team}. That’s not leadership, that’s intimidation.`,
      `${team} averaging ${avg.toFixed(1)}… the rest of the teams are basically extras in their story.`,
      `${team} didn’t just take first place… they redecorated it. ${avg.toFixed(1)} says it all.`,
      `${avg.toFixed(1)} average?? ${team} is playing chess, others are still reading the rules.`,
      `${team} at ${avg.toFixed(1)}… this isn’t a leaderboard, it’s a gap analysis.`,
      `${team} leads with ${avg.toFixed(1)}. At this point, even second place needs therapy.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  surge: (team: string, delta: number, day: string) => {
    const lines = [
      `${team} jumped +${delta} in ${day}… out of nowhere. Even they didn’t see that coming.`,
      `+${delta} by ${team} in ${day}? That’s not improvement, that’s a plot twist.`,
      `${team} went +${delta} in ${day}. Someone clearly threatened them.`,
      `${team} with a +${delta} surge… this is what happens when panic meets talent.`,
      `+${delta} in ${day}?? ${team} remembered they’re actually good. Timing is interesting.`,
      `${team} exploded +${delta}… this wasn’t a comeback, this was revenge.`,
      `${team} gained +${delta} in ${day}. Motivation finally downloaded successfully.`,
      `${team} said “enough is enough” and added +${delta}. Character arc completed.`,
      `+${delta} jump by ${team}… from background character to main storyline in one episode.`,
      `${team} surged +${delta} in ${day}. That’s not momentum, that’s a personality change.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  collapse: (team: string, delta: number) => {
    const lines = [
      `${team} dropped ${Math.abs(delta)}… not a fall, a full documentary on failure.`,
      `${Math.abs(delta)} point drop by ${team}. That wasn’t a mistake, that was a lifestyle choice.`,
      `${team} lost ${Math.abs(delta)} points… even gravity was like “damn relax”.`,
      `${team} with a ${Math.abs(delta)} drop. That’s not collapse, that’s early retirement.`,
      `${Math.abs(delta)} down?? ${team} didn’t choke, they evaporated.`,
      `${team} fell ${Math.abs(delta)} points. At this point, just restart the season.`,
      `${team} lost ${Math.abs(delta)}… I’ve seen smoother crashes in video games.`,
      `${Math.abs(delta)} drop by ${team}. Investors are pulling out as we speak.`,
      `${team} went down ${Math.abs(delta)}. That wasn’t a dip, that was a disappearance.`,
      `${team} dropped ${Math.abs(delta)}… even their confidence left the chat.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },
};