import { chromium } from "playwright";
import fs from "fs";

const TARGET_URL =
  "https://fantasy.iplt20.com/classic/league/view/66930102";

async function scrapeIPL() {
  console.log("🧪 Starting LOCAL IPL scraper...");

  const browser = await chromium.launch({ headless: true });

  const context = await browser.newContext({
    storageState: "state.json",
  });

  const page = await context.newPage();

  try {
    await page.goto(TARGET_URL, { waitUntil: "networkidle" });
    await page.waitForSelector("#leadersList li");

    const results = [];
    const totalRows = await page.$$eval("#leadersList li", (els) => els.length);

    for (let i = 0; i < totalRows; i++) {
      const rows = await page.$$("#leadersList li");
      const row = rows[i];

      const rank = parseInt(
        (await row.$eval(".m11c-matchCount", (el) => el.innerText)).trim(),
        10
      );

      const name = await row.$eval(
        ".m11c-plyrSel__name span",
        (el) => el.innerText
      );

      await row.click();
      await page.waitForTimeout(1200);

      await page.waitForSelector(".m11c-pitch__plyr");

      let captain = null;
      let viceCaptain = null;

      const players = await page.$$(".m11c-pitch__plyr");

      for (const player of players) {
        const className = (await player.getAttribute("class")) || "";

        const playerName = await player.$eval(
          ".m11c-pitch__plyr-name span",
          (el) => el.innerText
        );

        const pointsText = await player.$eval(
          ".m11c-pitch__plyr-num span",
          (el) => el.innerText
        );

        const playerPoints = parseInt(pointsText) || 0;

        const style = await player.$eval(
          ".m11c-pitch__plyr-thumb",
          (el) => el.getAttribute("style")
        );

        const imageMatch = style.match(/url\(["']?(.+?)["']?\)/);
        const image = imageMatch
          ? imageMatch[1]
          : "https://via.placeholder.com/40";

        if (className.includes("m11c-cap")) {
          captain = { name: playerName, points: playerPoints, image };
        }

        if (className.includes("m11c-vcap")) {
          viceCaptain = { name: playerName, points: playerPoints, image };
        }
      }

      results.push({ rank, name, captain, viceCaptain });

      await page.keyboard.press("Escape");
      await page.waitForSelector("#leadersList li");
    }

    results.sort((a, b) => a.rank - b.rank);

    // Captain stats
    const counts = {};
    results.forEach((t) => {
      if (!t.captain) return;
      counts[t.captain.name] = (counts[t.captain.name] || 0) + 1;
    });

    const total = results.length;

    const captainStats = Object.entries(counts)
      .map(([name, count]) => ({
        name,
        percentage: ((count / total) * 100).toFixed(1),
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // HTML
    let html = `
<!DOCTYPE html>
<html>
<head>
<link href="https://fonts.googleapis.com/css2?family=Mukta:wght@400;600;700&display=swap" rel="stylesheet">

<style>
body {
  margin: 0;
  background: #0a0a0a;
  color: #ededed;
  font-family: 'Mukta', sans-serif;
}

/* Title */
.title {
  text-align: center;
  font-size: 26px;
  font-weight: 700;
  margin: 30px 0;
  background: linear-gradient(to right, #67e8f9, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* Section */
.section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.section h2 {
  font-size: 14px;
  margin-bottom: 10px;
  color: #9ca3af;
}

/* Captain row */
.captains {
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
}

.pill {
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.1);
  padding: 6px 12px;
  border-radius: 999px;
  backdrop-filter: blur(12px);
}

/* Grid */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 20px;
}

/* Glass Card */
.card {
  border-radius: 24px;
  border: 1px solid rgba(255,255,255,0.1);
  background: rgba(255,255,255,0.05);
  backdrop-filter: blur(16px);
  padding: 16px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.6);
  transition: 0.2s ease;
}

.card:hover {
  transform: translateY(-5px);
}

/* Header */
.header {
  font-weight: 600;
  margin-bottom: 12px;
}

/* Divider */
.divider {
  height: 1px;
  background: rgba(255,255,255,0.08);
  margin: 10px 0;
}

/* Player */
.player {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
}

.left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 38px;
  height: 38px;
  border-radius: 999px;
  background-size: cover;
}

/* Colors */
.c { color: #facc15; }
.vc { color: #38bdf8; }

</style>
</head>

<body>

<div class="title">🏏 IPL Snapshot</div>

<div class="section">
  <h2>Popular Captain Choice</h2>
  <div class="captains">
`;

    captainStats.forEach((c) => {
      html += `<div class="pill">${c.name} ${c.percentage}%</div>`;
    });

    html += `
  </div>
</div>

<div class="container">
`;

    results.forEach((t) => {
      html += `
      <div class="card">
        <div class="header">#${t.rank} ${t.name}</div>

        <div class="divider"></div>

        <div class="player c">
          <div class="left">
            <div class="avatar" style="background-image:url('${t.captain?.image}')"></div>
            <span>${t.captain?.name}</span>
          </div>
          <span>${t.captain?.points}</span>
        </div>

        <div class="player vc">
          <div class="left">
            <div class="avatar" style="background-image:url('${t.viceCaptain?.image}')"></div>
            <span>${t.viceCaptain?.name}</span>
          </div>
          <span>${t.viceCaptain?.points}</span>
        </div>
      </div>
      `;
    });

    html += `</div></body></html>`;

    fs.writeFileSync("./scrape.html", html);
    console.log("✅ Done: scrape.html generated");
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

scrapeIPL();