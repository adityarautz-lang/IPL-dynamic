# IPL Fantasy Cricket Dashboard

A private Next.js dashboard for league members participating in an IPL fantasy cricket league. It tracks team performance with charts, summaries, live leaderboard ingestion, and a detailed data view.

This web app is intended for participating league members only. It is not a public product and should not expose league data broadly.

## Features

- Overall leaderboard points and ranks
- Latest match performance chart
- Cumulative season performance chart
- Point gaps between adjacent teams
- AI-style season summary cards
- Detailed data table for all enriched leaderboard fields
- Full match-by-match score matrix
- Bookmarklet-based live data extraction from the fantasy leaderboard page

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Recharts
- Framer Motion

## Local Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

If port `3000` is already busy, Next.js will print another local URL such as `http://localhost:3001`.

## Data Flow

The dashboard reads data from:

```text
GET /api/ipl
```

The API returns:

- `overall`: enriched leaderboard rows
- `daily`: match-by-match score rows
- `updatedAt`: latest live snapshot timestamp, when available
- `source`: either `manual` or `live-snapshot`

When no live scraped data exists, `/api/ipl` falls back to the manual match data in:

```text
app/api/ipl/data.ts
```

When live data exists, `/api/ipl` reads:

```text
app/api/ipl/live-snapshot.json
```

and merges that live leaderboard snapshot with the existing daily data.

## Live Update Automation

The fantasy site cannot be scraped directly by this dashboard because browser security prevents this app from reading another site’s DOM.

Instead, the project uses a bookmarklet that participating league members can run from the fantasy leaderboard page.

Bookmarklet endpoint:

```text
GET /api/ipl/bookmarklet
```

Open this locally:

```text
http://localhost:3000/api/ipl/bookmarklet
```

It returns a long script starting with:

```text
javascript:(async()=>{...
```

Create a browser bookmark and paste that script as the bookmark URL.

## How To Use The Bookmarklet

1. Run the dashboard with `npm run dev`.
2. Open `http://localhost:3000/api/ipl/bookmarklet`.
3. Copy the full `javascript:(...)` script.
4. Create a browser bookmark named `Update IPL Dashboard`.
5. Paste the script into the bookmark URL.
6. Open the fantasy leaderboard page.
7. Click the bookmark.

If successful, the bookmarklet shows:

```text
IPL dashboard updated: 8 teams
```

The dashboard polls `/api/ipl` every 30 seconds, so it updates automatically after the bookmarklet uploads data. You can also refresh the dashboard immediately.

## What The Bookmarklet Extracts

The bookmarklet only extracts data. It does not write HTML, inject CSS, call `document.write`, or change dashboard component styling.

It extracts:

- rank
- team name
- total points
- latest match points
- transfers left
- boosters used

Then it sends JSON to:

```text
POST /api/ipl
```

## API Endpoints

### `GET /api/ipl`

Returns dashboard data.

If live snapshot data exists, the response includes:

```json
{
  "source": "live-snapshot",
  "updatedAt": "2026-04-18T10:55:57.567Z"
}
```

Otherwise it returns:

```json
{
  "source": "manual"
}
```

### `POST /api/ipl`

Accepts live scraped leaderboard data.

Expected shape:

```json
{
  "updatedAt": "2026-04-18T10:55:57.567Z",
  "leaders": [
    {
      "rank": 1,
      "name": "Deccan Dominators",
      "points": 7125,
      "lastMatchPoints": 52.5,
      "transfersLeft": 101,
      "boostersUsed": "1"
    }
  ]
}
```

The API enriches this into:

- previous points
- previous rank
- movement
- gap to next team
- gap percentage
- transfer efficiency
- latest match leader flag

On a successful sync, the API also updates:

```text
app/api/ipl/data.ts
```

The sync updates `rawApiUsers` by matching scraped teams back to raw fantasy team names, then either:

- appends the next match row when the scraped totals represent a new match, or
- updates the latest match row when the scrape belongs to the same in-progress/latest match.

This keeps the manual fallback data moving forward after each bookmarklet upload.

### `GET /api/ipl/bookmarklet`

Returns the current bookmarklet script as plain text.

## Components

- `DailyChart`: latest match bar chart
- `OverallChart`: total points leaderboard
- `PerformanceTracker`: cumulative season chart
- `PointDifferences`: gap chart between adjacent teams
- `Summary`: season insight cards
- `DetailedDataTable`: full overall details and match-by-match matrix
- `LiveMatchTicker`: sticky top match ticker

## Detailed Data View

The dashboard includes a bottom section called `Detailed Data`.

It shows:

- rank
- team
- points
- previous points
- movement
- gap to next
- gap percentage
- transfers left
- boosters used
- efficiency
- latest match points
- all daily match rows

This is useful for league members who want to verify exactly what `/api/ipl` is returning.

## Private League Usage

This app is meant to be used by members of the league only.

Recommended usage:

- Run locally during development.
- Share only with participating members if deployed.
- Avoid making scraped league data publicly indexed or broadly accessible.
- Keep any fantasy-site session or auth details outside the repo.

## Does It Work From Anywhere?

The dashboard UI can be deployed and opened by league members, but the current live update storage is local file storage:

```text
app/api/ipl/live-snapshot.json
```

That works for local development, but it is not durable on serverless hosting such as Vercel.

For a member-accessible deployed version, replace `live-snapshot.json` with persistent storage such as:

- Vercel KV
- Upstash Redis
- Supabase
- Neon/Postgres
- MongoDB

Then generate the bookmarklet from the deployed domain:

```text
https://your-private-dashboard.example.com/api/ipl/bookmarklet
```

The bookmarklet will POST data to:

```text
https://your-private-dashboard.example.com/api/ipl
```

Any league member opening the deployed dashboard can then see the latest uploaded snapshot.

## Automation Level

Current automation:

- No manual data entry
- No manual code edits
- Bookmarklet extracts data from the fantasy page
- API stores the latest snapshot
- Dashboard auto-refreshes every 30 seconds

Still required:

- A league member with access to the fantasy leaderboard must click the bookmarklet when fresh data is needed.

Fully hands-free automation would require one of:

- an official fantasy API
- a browser extension
- a scheduled Playwright scraper with login/session handling
- a backend job with persistent auth

## Verification

Run:

```bash
npm test
npm run lint
npm run build
```

Check the API:

```text
http://localhost:3000/api/ipl
```

Check the bookmarklet:

```text
http://localhost:3000/api/ipl/bookmarklet
```

## Project Structure

```text
app/
  api/
    ipl/
      bookmarklet/
        route.ts
      data.ts
      live-snapshot.json
      route.ts
  components/
    DailyChart.tsx
    DetailedDataTable.tsx
    LiveMatchTicker.tsx
    OverallChart.tsx
    PerformanceTracker.tsx
    PointDifferences.tsx
    Summary.tsx
  page.tsx
  types.ts
```

## Scripts

```bash
npm run dev
npm test
npm run build
npm run start
npm run lint
```

## License

Private project for participating IPL fantasy league members.
