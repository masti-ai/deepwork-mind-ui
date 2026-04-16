"use client";

import { useEffect, useState } from "react";

interface Workflow {
  name: string;
  type: "agent" | "formula" | "cron";
  description: string;
  category: string;
  steps: string[];
  run_count: number;
  last_run: string;
  last_result: "success" | "failed" | "never";
}

interface HealthData {
  dolt: string;
  vllm: string;
  gitea: string;
}

const typeColors = {
  agent: { bg: "bg-emerald-50 text-emerald-600", label: "Agent" },
  formula: { bg: "bg-blue-50 text-blue-600", label: "Formula" },
  cron: { bg: "bg-purple-50 text-purple-600", label: "Cron" },
};

const resultDots = {
  success: "bg-emerald-400",
  failed: "bg-red-400",
  never: "bg-warm-300",
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
    ]).then(([wf, h]) => {
      setWorkflows(wf.workflows || []);
      setHealth(h);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-warm-100/50 rounded-lg h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  const categories = [...new Set(workflows.map((w) => w.category))];
  const grouped: Record<string, Workflow[]> = {};
  for (const w of workflows) {
    (grouped[w.category] ??= []).push(w);
  }

  return (
    <div className="space-y-10">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-warm-400">
          <strong className="text-warm-600 font-medium">{workflows.length}</strong> workflows
          {health && (
            <span className="ml-4">
              {(["dolt", "vllm", "gitea"] as const).map((svc) => (
                <span key={svc} className="inline-flex items-center gap-1 mr-3">
                  <span className={`w-1.5 h-1.5 rounded-full ${health[svc] === "ok" ? "bg-emerald-400" : "bg-red-400"}`} />
                  <span>{svc}</span>
                </span>
              ))}
            </span>
          )}
        </p>
      </div>

      {categories.map((cat) => (
        <section key={cat}>
          <h3 className="text-lg text-warm-800 mb-4" style={{ fontFamily: "'Bitter', Georgia, serif" }}>
            {cat}
          </h3>
          <div className="space-y-1">
            {grouped[cat].map((wf) => {
              const tc = typeColors[wf.type];
              return (
                <div
                  key={`${wf.category}-${wf.name}`}
                  onClick={() => setExpanded(expanded === wf.name ? null : wf.name)}
                  className="bg-white rounded-lg px-4 py-3 border border-warm-100 hover:border-warm-200 cursor-pointer transition-all animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`w-2 h-2 rounded-full ${resultDots[wf.last_result]}`} />
                      <span className="text-sm text-warm-800">{wf.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${tc.bg}`}>{tc.label}</span>
                    </div>
                    {wf.run_count > 0 && (
                      <span className="text-[11px] text-warm-400">{wf.run_count} runs</span>
                    )}
                  </div>
                  {wf.description && (
                    <p className="text-xs text-warm-500 mt-1 leading-relaxed line-clamp-2">{wf.description}</p>
                  )}
                  {expanded === wf.name && (
                    <div className="mt-3 pt-3 border-t border-warm-100 animate-fade-in">
                      {wf.steps.length > 0 && (
                        <div className="mb-3">
                          <p className="text-[10px] text-warm-400 mb-1.5">Steps:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {wf.steps.map((step, i) => (
                              <span key={i} className="text-[10px] bg-warm-50 text-warm-600 px-2 py-1 rounded">
                                {i + 1}. {step}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="grid grid-cols-3 gap-3 text-xs text-warm-500">
                        <div>Runs: <span className="text-warm-700">{wf.run_count}</span></div>
                        <div>Last: <span className="text-warm-700">{wf.last_run || "never"}</span></div>
                        <div>Result: <span className={wf.last_result === "success" ? "text-emerald-600" : wf.last_result === "failed" ? "text-red-500" : "text-warm-300"}>{wf.last_result}</span></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}

      {workflows.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-warm-400">No workflows found.</p>
          <p className="text-xs text-warm-300 mt-1">Agents, formulas, and cron jobs will appear here.</p>
        </div>
      )}
    </div>
  );
}
