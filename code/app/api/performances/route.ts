import { NextRequest, NextResponse } from "next/server";
import { getPerformances } from "@/lib/performances";
export async function GET(req: NextRequest) {
  try {
    const options = Object.fromEntries(req.nextUrl.searchParams.entries());
    const result = await getPerformances(options);
    return NextResponse.json({ Message: "Success", ResultCode: "ERR_OK", Size: result.total,
      Response: { page: { total: result.pages, current: result.page }, performance_list: result.performances } });
  } catch (error) {
    console.error("Performance list query failed", error);
    return NextResponse.json({ Message: "Internal server error", ResultCode: "ERR_INTERNAL_SERVER" }, { status: 500 });
  }
}
