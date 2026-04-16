"use client";

import { useEffect, useState } from "react";

interface Workflow {
  id: string;
  name: string;
  type: "cron" | "pipeline" | "agent";
  schedule: string;
  enabled: boolean;
  last_run: string;
  last_result: "success" | "failed" | "running" | "never";
  run_count: number;
  next_run: string;
  stats?: { total: number; done: number; failed: number };
}

interface HealthData {
  dolt: string;
  vllm: string;
  gitea: string;
}

const resultColors = {
  success: { dot: "bg-emerald-400", text: "text-emerald-600" },
  failed: { dot: "bg-red-400", text: "text-red-600" },
  running: { dot: "bg-amber-400", text: "text-amber-600" },
  never: { dot: "bg-warm-300", text: "text-warm-400" },
};

const typeLabels = {
  cron: { label: "Cron", bg: "bg-blue-50 text-blue-600" },
  pipeline: { label: "Event", bg: "bg-purple-50 text-purple-600" },
  agent: { label: "Agent", bg: "bg-emerald-50 text-emerald-600" },
};

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/workflows").then((r) => r.json()),
      fetch("/api/health").then((r) => r.json()),
    ]).then(([wfData, hData]) => {
      setWorkflows(wfData.workflows || []);
      setHealth(hData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-warm-100/50 rounded-lg h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  const crons = workflows.filter((w) => w.type === "cron");
  const pipelines = workflows.filter((w) => w.type === "pipeline");

  return (
    <div className="space-y-10">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-warm-400">
          <strong className="text-warm-600 font-medium">{workflows.length}</strong> workflows
          {health && (
            <span className="ml-4">
              {["dolt", "vllm", "gitea"].map((svc) => (
                <span key={svc} className="inline-flex items-center gap-1 mr-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${health[svc as keyof HealthData] === "ok" ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span className="text-warm-400">{svc}</span>
                </span>
              ))}
            </span>
          )}
        </p>
      </div>

      {crons.length > 0 && (
        <section>
          <h3 className="text-lg text-warm-800 mb-4" style={{ fontFamily: "'Bitter', Georgia, serif" }}>
            Scheduled Jobs
          </h3>
          <div className="space-y-1">
            {crons.map((wf) => {
              const colors = resultColors[wf.last_result];
              return (
                <div
                  key={wf.id}
                  onClick={() => setExpanded(expanded === wf.id ? null : wf.id)}
                  className="bg-white rounded-lg px-4 py-3 border border-warm-100 hover:border-warm-200 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      <span className="text-sm text-warm-800">{wf.name}</span>
                      <span className="text-[10px] bg-warm-50 text-warm-400 px-1.5 py-0.5 rounded font-mono">{wf.schedule}</span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-warm-400">
                      <span>{wf.run_count} runs</span>
                      <span className={colors.text}>{wf.last_result}</span>
                    </div>
                  </div>
                  {expanded === wf.id && (
                    <div className="mt-3 pt-3 border-t border-warm-100 animate-fade-in text-xs text-warm-500">
                      <div className="grid grid-cols-2 gap-4">
                        <div>Last run: <span className="text-warm-700">{wf.last_run || "never"}</span></div>
                        <div>Next run: <span className="text-warm-700">{wf.next_run || "—"}</span></div>
                        <div>Status: <span className={`${wf.enabled ? "text-emerald-600" : "text-warm-300"}`}>{wf.enabled ? "enabled" : "disabled"}</span></div>
                        <div>Total runs: <span className="text-warm-700">{wf.run_count}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {pipelines.length > 0 && (
        <section>
          <h3 className="text-lg text-warm-800 mb-4" style={{ fontFamily: "'Bitter', Georgia, serif" }}>
            Event Pipelines
          </h3>
          <div className="space-y-1">
            {pipelines.map((wf) => {
              const colors = resultColors[wf.last_result];
              const stats = wf.stats;
              return (
                <div
                  key={wf.id}
                  onClick={() => setExpanded(expanded === wf.id ? null : wf.id)}
                  className="bg-white rounded-lg px-4 py-3 border border-warm-100 hover:border-warm-200 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      <span className="text-sm text-warm-800">{wf.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${typeLabels[wf.type].bg}`}>
                        {typeLabels[wf.type].label}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-[11px] text-warm-400">
                      <span>{wf.run_count} events</span>
                      {stats && stats.failed > 0 && (
                        <span className="text-red-500">{stats.failed} failed</span>
                      )}
                    </div>
                  </div>
                  {expanded === wf.id && stats && (
                    <div className="mt-3 pt-3 border-t border-warm-100 animate-fade-in text-xs text-warm-500">
                      <div className="grid grid-cols-3 gap-4">
                        <div>Total: <span className="text-warm-700">{stats.total}</span></div>
                        <div>Completed: <span className="text-emerald-600">{stats.done}</span></div>
                        <div>Failed: <span className={stats.failed > 0 ? "text-red-500" : "text-warm-300"}>{stats.failed}</span></div>
                      </div>
                      <p className="text-[10px] text-warm-300 mt-2">Last event: {wf.last_run}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {workflows.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-warm-400">No workflows configured yet.</p>
          <p className="text-xs text-warm-300 mt-1 max-w-sm mx-auto">
            Workflows run automatically — crons for scheduled tasks, event pipelines for reactive processing.
          </p>
        </div>
      )}
    </div>
  );
}
