/**
 * AI Agent Commentary
 * Generates sarcastic, roasting, and praising commentary for team performance
 */

export const aiAgent = {
  praise: (team: string, pts: number) => {
    const lines = [
      `${team} just cooked with ${pts} pts. Gordon Ramsay would be proud.`,
      `${team} dropped ${pts}. Opponents currently filing complaints.`,
      `${pts} pts?? ${team} woke up and chose violence.`,
      `${team} is an absolute legend with ${pts}. Unstoppable force detected.`,
      `${team} absolutely demolished with ${pts} points. That's championship energy.`,
      `${pts} pts by ${team}? They're not just playing, they're dominating.`,
      `${team} showed up and showed OUT with ${pts} points. Pure class.`,
      `${team} turned it UP with ${pts} points. No mercy mode activated.`,
      `${pts} points?? ${team} said "let's make it interesting" 🔥`,
      `${team} blessed us with ${pts} points. A true masterclass in performance.`,
      `${team} hit different today with ${pts}. That's the real deal right there.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  roast: (team: string, pts: number) => {
    const lines = [
      `${team} scored ${pts}. I've seen loading screens perform better.`,
      `${team} with ${pts} pts… was this a strategy or an accident?`,
      `${pts} pts by ${team}. Bold of you to call that a performance.`,
      `${team} really said "minimum effort, maximum embarrassment".`,
      `${team}: ${pts} pts and a prayer 🙏`,
      `${pts}? ${team}, that's not even trying.`,
      `${team} showed up with ${pts} points. Showed up to disappoint, that is.`,
      `${pts} pts?? ${team} said "let's keep it consistent" — consistently bad 💀`,
      `${team} managed ${pts}. Even their effort needs effort.`,
      `${pts} pts from ${team}. A performance we'll all try to forget.`,
      `${team} delivered ${pts}... delivered us straight to disappointment town.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  consistency: (team: string, volatility: number) => {
    const lines = [
      `${team} is so consistent it's suspicious—volatility ${volatility.toFixed(1)}.`,
      `${team} shows up every match like clockwork. No drama, no surprises.`,
      `${team} proves consistency beats flashiness (vol: ${volatility.toFixed(1)}).`,
      `${team} is the definition of reliable—steady as a rock with vol ${volatility.toFixed(1)}.`,
      `${team} doesn't gamble. Every match is a calculated, consistent performance.`,
      `That ${volatility.toFixed(1)} volatility? ${team} said "boring is beautiful".`,
      `${team} has mastered the art of showing up the same way every single time.`,
      `Boring? Maybe. But ${team}'s consistency (vol: ${volatility.toFixed(1)}) is elite.`,
      `${team} decided consistency is the best policy. Hard to argue with that logic.`,
      `${team} doesn't do rollercoasters—just smooth, steady sailing (vol: ${volatility.toFixed(1)}).`,
      `If predictability was a superpower, ${team} would be unstoppable (vol: ${volatility.toFixed(1)}).`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  leader: (team: string, avg: number) => {
    const lines = [
      `${team} dominating at ${avg.toFixed(1)} pts/match. Simply built different.`,
      `${team} is the season's true backbone—averaging ${avg.toFixed(1)} per match.`,
      `${team} said "I'll be #1" and delivered. ${avg.toFixed(1)} pts avg proves it.`,
      `${avg.toFixed(1)} pts per match?? ${team} is the undisputed king of consistency and dominance.`,
      `${team} doesn't just lead—they inspire. ${avg.toFixed(1)} avg is the proof.`,
      `The bar isn't just high, it's ${team}-high. ${avg.toFixed(1)} pts per match sets the standard.`,
      `${team} is out here rewriting the rulebook. ${avg.toFixed(1)} pts/match is legendary.`,
      `Other teams are playing checkers. ${team} is playing chess at ${avg.toFixed(1)} pts/match.`,
      `${team} averaged ${avg.toFixed(1)} pts? That's not just leading, that's leaving everyone behind.`,
      `${team}'s ${avg.toFixed(1)} pts/match average is basically a mic drop for the entire season.`,
      `${team} didn't just perform—they set a new definition of excellence. ${avg.toFixed(1)} says it all.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  surge: (team: string, delta: number, day: string) => {
    const lines = [
      `${team} exploded with +${delta} in ${day}. That's a career moment right there.`,
      `${team} reminded everyone why they're dangerous: +${delta} swing in ${day}.`,
      `From zero to hero: ${team} +${delta} in ${day}. The comeback is real.`,
      `${team} just turned up the volume with +${delta} in ${day}. Absolute madness!`,
      `+${delta} points in ${day}?? ${team} said "let's make a statement" 💥`,
      `${team} went from sleeping to AWAKE in ${day} with a +${delta} explosion.`,
      `${team} flipped the script with +${delta} in ${day}. That's momentum right there.`,
      `The opposition didn't see it coming: ${team} +${delta} surge in ${day}.`,
      `${team} proved they belong with a massive +${delta} jump in ${day}. Pure fire.`,
      `+${delta} in a single match by ${team}?? That's not luck, that's skill on display in ${day}.`,
      `${team} turned up the gas and +${delta} is exactly what happened in ${day}.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },

  collapse: (team: string, delta: number) => {
    const lines = [
      `${team} took a ${Math.abs(delta)}-point nosedive. Gravity working overtime.`,
      `${team} went from hero to zero with a ${Math.abs(delta)} drop. Ouch.`,
      `That ${Math.abs(delta)}-point collapse by ${team}? Never forget 💀`,
      `${team} said "let's tank this" and succeeded—${Math.abs(delta)} pts down.`,
      `${team} free-fell ${Math.abs(delta)} points. Someone check on them 😬`,
      `The wheels fell off for ${team}: ${Math.abs(delta)} points down the drain.`,
      `${team} just experienced a spectacular ${Math.abs(delta)}-point disaster.`,
      `From there to here: ${team} dropped ${Math.abs(delta)} like it's hot. But it's NOT.`,
      `${team}'s ${Math.abs(delta)}-point crash is the kind of thing analysts will study for years.`,
      `${Math.abs(delta)} points?? ${team} didn't just drop—they PLUMMETED.`,
      `${team} and their newfound strategy: lose ${Math.abs(delta)} points and disappoint everyone.`,
    ];
    return lines[Math.floor(Math.random() * lines.length)];
  },
};
