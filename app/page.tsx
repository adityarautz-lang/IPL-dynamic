import OverallChart from "./components/OverallChart";
import DailyChart from "./components/DailyChart";
import { rawData } from "./lib/data";
import { getOverallData, getDailyData } from "./lib/transform";

export default function Home() {
  const overall = getOverallData(rawData);
  const daily = getDailyData(rawData);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">IPL Fantasy Dashboard</h1>

      <OverallChart data={overall} />
      <DailyChart data={daily} />
    </main>
  );
}
