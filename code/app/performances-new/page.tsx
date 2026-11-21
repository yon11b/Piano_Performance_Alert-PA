import PerformanceResults from "@/app/components/PerformanceResults";
import type { SearchOptions } from "@/lib/performances";
export const dynamic = "force-dynamic";
export default function Page({ searchParams }: { searchParams: Promise<SearchOptions> }) {
  return <PerformanceResults searchParams={searchParams} newbee />;
}
