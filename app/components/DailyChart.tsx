"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function DailyChart({ data }: { data: any[] }) {
  const users = Object.keys(data[0] || {}).filter((k) => k !== "day");

  return (
    <div className="h-75 w-full mt-10">
      <h2 className="text-xl font-bold mb-2">Daily Performance</h2>
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Legend />
          {users.map((u) => (
            <Line key={u} type="monotone" dataKey={u} />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
