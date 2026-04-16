import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface ToolRow {
  tool_name: string;
  description: string;
}

interface UsageRow {
  tool_name: string;
  call_count: number;
  avg_latency_ms: number;
  last_called: string;
}

function categorizeTool(name: string): string {
  if (name.includes("memory")) return "Memory";
  if (name.includes("wasteland") || name.includes("crown")) return "Auditing";
  if (name.includes("docs")) return "Documentation";
  if (name.includes("github")) return "GitHub";
  if (name.includes("analytics") || name.includes("health")) return "Analytics";
  if (name.includes("feedback")) return "Feedback";
  return "General";
}

export async function GET() {
  try {
    // Get tool catalog
    let catalog: ToolRow[] = [];
    try {
      catalog = await query<ToolRow>("SELECT tool_name, description FROM di.tool_catalog ORDER BY tool_name");
    } catch {
      // tool_catalog may not exist
    }

    // Get usage stats
    let usage: UsageRow[] = [];
    try {
      usage = await query<UsageRow>(
        `SELECT tool_name, COUNT(*) as call_count, AVG(latency_ms) as avg_latency_ms, MAX(called_at) as last_called
         FROM di.tool_invocations GROUP BY tool_name ORDER BY call_count DESC`
      );
    } catch {
      // tool_invocations may not exist
    }

    const usageMap = new Map(usage.map((u) => [u.tool_name, u]));

    // Merge catalog + usage
    const toolNames = new Set([...catalog.map((t) => t.tool_name), ...usage.map((u) => u.tool_name)]);

    const tools = [...toolNames].map((name) => {
      const cat = catalog.find((c) => c.tool_name === name);
      const use = usageMap.get(name);
      return {
        name,
        description: cat?.description || "",
        call_count: use?.call_count || 0,
        avg_latency_ms: use?.avg_latency_ms || 0,
        last_used: use?.last_called || "",
        domain: categorizeTool(name),
      };
    }).sort((a, b) => b.call_count - a.call_count);

    return NextResponse.json({ tools, total: tools.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg, tools: [] }, { status: 500 });
  }
}
