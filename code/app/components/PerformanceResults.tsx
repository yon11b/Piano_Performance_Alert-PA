import PerformanceList from "./PerformanceList";
import { getPerformances, type SearchOptions } from "@/lib/performances";

export default async function PerformanceResults({ searchParams, newbee = false }: { searchParams: Promise<SearchOptions>; newbee?: boolean }) {
  const raw = await searchParams;
  const options: SearchOptions = Object.fromEntries(
    Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])
  );
  const result = await getPerformances({ ...options, limit: "100", famous: newbee ? "NEWBEE" : options.famous });
  return <PerformanceList {...result} search={options.search} famous={newbee ? "NEWBEE" : options.famous} composer={options.composer} newbee={newbee} />;
}
