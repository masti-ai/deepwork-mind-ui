import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface ToolUsageRow {
  tool_name: string;
  call_count: number;
  avg_latency_ms: number;
  error_count: number;
}

interface CallerRow {
  caller: string;
  call_count: number;
}

export async function GET() {
  try {
    const toolUsage = await query<ToolUsageRow>(
      `SELECT tool_name, COUNT(*) as call_count,
        AVG(latency_ms) as avg_latency_ms,
        SUM(CASE WHEN error IS NOT NULL AND error != '' THEN 1 ELSE 0 END) as error_count
      FROM di.tool_invocations
      GROUP BY tool_name
      ORDER BY call_count DESC
      LIMIT 30`
    );

    const callers = await query<CallerRow>(
      `SELECT caller, COUNT(*) as call_count
      FROM di.tool_invocations
      GROUP BY caller
      ORDER BY call_count DESC
      LIMIT 20`
    );

    const totalRow = await query<{ total: number; errors: number }>(
      `SELECT COUNT(*) as total,
        SUM(CASE WHEN error IS NOT NULL AND error != '' THEN 1 ELSE 0 END) as errors
      FROM di.tool_invocations`
    );

    return NextResponse.json({
      total_calls: totalRow[0]?.total || 0,
      error_count: totalRow[0]?.errors || 0,
      by_tool: toolUsage,
      by_caller: callers,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: message, total_calls: 0, by_tool: [], by_caller: [] }, { status: 500 });
  }
}
