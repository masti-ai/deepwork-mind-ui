import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface CronRow {
  name: string;
  schedule: string;
  last_run: string;
  next_run: string;
  enabled: number;
  run_count: number;
}

interface EventRow {
  event_type: string;
  handler_state: string;
  cnt: number;
  latest: string;
}

export async function GET() {
  try {
    // Get cron schedules
    let crons: CronRow[] = [];
    try {
      crons = await query<CronRow>(
        `SELECT name, schedule, last_run, next_run, enabled, run_count FROM di.cron_schedule ORDER BY name`
      );
    } catch {
      // cron_schedule may not exist
    }

    // Get pipeline event stats (actual workflow runs)
    let events: EventRow[] = [];
    try {
      events = await query<EventRow>(
        `SELECT event_type, handler_state, COUNT(*) as cnt, MAX(emitted_at) as latest
         FROM pipeline_events GROUP BY event_type, handler_state ORDER BY latest DESC`
      );
    } catch {
      // pipeline_events may not have data
    }

    // Build workflow list
    const workflows = [];

    // Cron workflows
    for (const cron of crons) {
      workflows.push({
        id: `cron-${cron.name}`,
        name: cron.name,
        type: "cron" as const,
        schedule: cron.schedule,
        enabled: cron.enabled === 1,
        last_run: cron.last_run || "never",
        last_result: cron.last_run ? "success" as const : "never" as const,
        run_count: cron.run_count || 0,
        next_run: cron.next_run || "",
      });
    }

    // Event-driven workflows (from pipeline_events)
    const eventTypes = [...new Set(events.map((e) => e.event_type))];
    for (const et of eventTypes) {
      const typeEvents = events.filter((e) => e.event_type === et);
      const total = typeEvents.reduce((s, e) => s + e.cnt, 0);
      const done = typeEvents.find((e) => e.handler_state === "done")?.cnt || 0;
      const failed = typeEvents.find((e) => e.handler_state === "failed")?.cnt || 0;
      const latest = typeEvents[0]?.latest || "";

      workflows.push({
        id: `event-${et}`,
        name: et.replace(".", " → "),
        type: "pipeline" as const,
        schedule: "event-driven",
        enabled: true,
        last_run: latest,
        last_result: failed > 0 ? "failed" as const : done > 0 ? "success" as const : "never" as const,
        run_count: total,
        next_run: "on next event",
        stats: { total, done, failed },
      });
    }

    return NextResponse.json({ workflows, total: workflows.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg, workflows: [] }, { status: 500 });
  }
}
