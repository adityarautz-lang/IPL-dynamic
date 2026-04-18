# IPL Fantasy Cricket Dashboard 🏏

A modern, interactive dashboard for tracking IPL fantasy cricket team performances with real-time charts, statistics, and AI-powered commentary.

## ✨ Features

- **Overall Leaderboard**: Bar chart showing total points and rankings for all teams
- **Daily Performance Charts**: Match-by-match point distributions with team comparisons
- **Performance Tracker**: Cumulative performance tracking with line charts over the season
- **Statistics Summary**: Key metrics including highest scores, consistency analysis, and volatility measurements
- **AI Commentary**: Sarcastic, roasting, and praising commentary generated for team performances
- **Responsive Design**: Beautiful glass-morphism UI with smooth animations
- **Real-time Data**: Fetches and processes IPL fantasy data from API endpoints

## 🚀 Tech Stack

- **Framework**: Next.js 16 with App Router
- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 with custom glass-morphism effects
- **Charts**: Recharts for data visualization
- **Animations**: Framer Motion for smooth transitions
- **Icons**: Custom emoji-based design system

## 🛠️ Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ipl-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
# or
bun install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📊 Data Structure

The dashboard processes IPL fantasy cricket data including:

- **Team Information**: Team names, total points, and rankings
- **Match Data**: Points earned per match (1-25 matches)
- **Performance Metrics**: Consistency, volatility, and statistical analysis

## 🎯 Key Components

- **OverallChart**: Displays total points leaderboard with rankings
- **DailyChart**: Shows points distribution for each match day
- **PerformanceTracker**: Tracks cumulative performance over time
- **Summary**: Provides statistical insights and AI commentary
- **AI Agent**: Generates contextual commentary for performances

## 📈 API Endpoints

- `GET /api/ipl`: Returns processed dashboard data (overall and daily charts)
- Data includes team rankings, match-by-match points, and calculated statistics

## 🎨 Design Features

- **Dark Theme**: Sleek dark background with blue/purple accent glows
- **Glass Morphism**: Modern frosted glass card effects
- **Responsive Layout**: Optimized for desktop and mobile viewing
- **Smooth Animations**: Page load and hover animations using Framer Motion

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Project Structure

```
ipl-dashboard/
├── app/
│   ├── api/ipl/          # API routes for data
│   ├── components/       # React components
│   ├── lib/              # Utilities and AI agent
│   └── types.ts          # TypeScript definitions
├── public/               # Static assets
└── package.json          # Dependencies and scripts
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is private and proprietary.

---

Built with ❤️ for IPL fantasy cricket enthusiasts
