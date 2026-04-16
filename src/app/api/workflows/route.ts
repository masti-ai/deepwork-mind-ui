import { NextResponse } from "next/server";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";
import { query } from "@/lib/db";

interface AgentInfo {
  name: string;
  type: "agent" | "formula" | "cron";
  description: string;
  path: string;
  steps: string[];
  run_count: number;
  last_run: string;
  last_result: "success" | "failed" | "never";
}

async function scanAgents(dir: string): Promise<AgentInfo[]> {
  const agents: AgentInfo[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const agentDir = join(dir, entry.name);
      // Look for Python files
      try {
        const files = await readdir(agentDir);
        const pyFiles = files.filter((f) => f.endsWith(".py") && f !== "__init__.py");
        for (const pyFile of pyFiles) {
          const content = await readFile(join(agentDir, pyFile), "utf-8");
          const docMatch = content.match(/"""([\s\S]*?)"""/);
          const desc = docMatch ? docMatch[1].split("\n")[0].trim() : "";
          agents.push({
            name: `${entry.name}/${pyFile.replace(".py", "")}`,
            type: "agent",
            description: desc.slice(0, 150),
            path: join(agentDir, pyFile),
            steps: [],
            run_count: 0,
            last_run: "",
            last_result: "never",
          });
        }
      } catch { /* skip */ }
    }
  } catch { /* dir doesn't exist */ }
  return agents;
}

async function scanFormulas(dir: string): Promise<AgentInfo[]> {
  const formulas: AgentInfo[] = [];
  try {
    const files = await readdir(dir);
    for (const file of files) {
      if (!file.endsWith(".formula.toml")) continue;
      const content = await readFile(join(dir, file), "utf-8");

      // Extract description from TOML
      const descMatch = content.match(/description\s*=\s*"""([\s\S]*?)"""/);
      const desc = descMatch ? descMatch[1].split("\n").filter((l) => l.trim()).slice(0, 2).join(" ").trim() : "";

      // Extract step titles
      const steps: string[] = [];
      for (const match of content.matchAll(/title\s*=\s*"([^"]+)"/g)) {
        steps.push(match[1]);
      }

      const name = file.replace(".formula.toml", "");
      formulas.push({
        name,
        type: "formula",
        description: desc.slice(0, 150),
        path: join(dir, file),
        steps,
        run_count: 0,
        last_run: "",
        last_result: "never",
      });
    }
  } catch { /* dir doesn't exist */ }
  return formulas;
}

export async function GET() {
  const gtRoot = process.env.GT_ROOT || "/home/pratham2/gt";

  try {
    const [agents, formulas] = await Promise.all([
      scanAgents(join(gtRoot, "deepwork_intelligence/agents")),
      scanFormulas(join(gtRoot, ".beads/formulas")),
    ]);

    // Get cron data if available
    let crons: AgentInfo[] = [];
    try {
      interface CronRow { name: string; schedule: string; last_run: string; run_count: number; }
      const cronRows = await query<CronRow>("SELECT name, schedule, last_run, run_count FROM di.cron_schedule");
      crons = cronRows.map((c) => ({
        name: c.name,
        type: "cron" as const,
        description: `Scheduled: ${c.schedule}`,
        path: "",
        steps: [],
        run_count: c.run_count || 0,
        last_run: c.last_run || "",
        last_result: c.last_run ? "success" as const : "never" as const,
      }));
    } catch { /* no cron table */ }

    // Get event pipeline run counts
    try {
      interface EventCountRow { event_type: string; cnt: number; }
      const eventCounts = await query<EventCountRow>(
        "SELECT event_type, COUNT(*) as cnt FROM pipeline_events WHERE handler_state='done' GROUP BY event_type"
      );
      const countMap = new Map(eventCounts.map((e) => [e.event_type, e.cnt]));

      // Enrich agents with run counts from events
      for (const agent of agents) {
        if (agent.name.includes("stamp")) {
          agent.run_count = countMap.get("epic.completed") || 0;
        }
        if (agent.name.includes("map_beads")) {
          agent.run_count = countMap.get("bead.created") || 0;
        }
      }
    } catch { /* no pipeline_events */ }

    const all = [
      ...agents.map((a) => ({ ...a, category: "Agents" })),
      ...formulas.slice(0, 20).map((f) => ({ ...f, category: "Formulas" })),
      ...crons.map((c) => ({ ...c, category: "Scheduled Jobs" })),
    ];

    return NextResponse.json({ workflows: all, total: all.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg, workflows: [] }, { status: 500 });
  }
}
