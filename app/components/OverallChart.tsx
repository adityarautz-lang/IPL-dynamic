"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function OverallChart({ data }: { data: any[] }) {
  return (
    <div className="h-75 w-full">
      <h2 className="text-xl font-bold mb-2">Overall Leaderboard</h2>
      <ResponsiveContainer>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="points" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
