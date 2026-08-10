import { SilageDashboard } from "@/components/silage-dashboard";
import { getSilageDashboardData } from "@/lib/weather";

export const revalidate = 3600;

export default async function Home() {
  const data = await getSilageDashboardData();
  return <SilageDashboard data={data} />;
}
