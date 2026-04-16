"use client";

import { useEffect, useState } from "react";

interface PipelineStep {
  name: string;
  status: "shipped" | "building" | "planned";
  bead?: string;
  detail: string;
}

const pipeline: PipelineStep[] = [
  { name: "Epic created → work item", status: "shipped", bead: "di-5s6", detail: "wasteland_forge creates item on epic event" },
  { name: "Bead slung → auto-claim", status: "shipped", bead: "gc-465", detail: "gt sling hook claims wasteland item" },
  { name: "Bead close → dump context", status: "shipped", bead: "di-scw", detail: "Raw context written to docs/dumps/" },
  { name: "Crown per agent", status: "shipped", bead: "di-bwz", detail: "Stamps attributed to actual agent identity" },
  { name: "Memory auto-store", status: "building", bead: "di-pwr", detail: "Session learnings saved to Mind on close" },
  { name: "Epic audit → stamp", status: "building", bead: "di-vvr", detail: "Aggregate review across all child beads" },
  { name: "Epic close → feature docs", status: "planned", bead: "di-1w0", detail: "Agentic feature grouping + changelog" },
  { name: "Auto-release to GitHub", status: "planned", bead: "di-dhb", detail: "Semver tag + release notes on feature accumulation" },
];

const statusColors = {
  shipped: { dot: "bg-emerald-400", text: "text-emerald-700", bg: "bg-emerald-50" },
  building: { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50" },
  planned: { dot: "bg-warm-300", text: "text-warm-500", bg: "bg-warm-100" },
};

export default function WorkflowsPage() {
  const [health, setHealth] = useState<{ dolt: "ok" | "error" | "unknown"; vllm: "ok" | "error" | "unknown"; gitea: "ok" | "error" | "unknown" } | null>(null);

  useEffect(() => {
    async function check() {
      try {
        const res = await fetch("/api/health");
        setHealth(await res.json());
      } catch {
        setHealth({ dolt: "unknown", vllm: "unknown", gitea: "unknown" });
      }
    }
    check();
  }, []);

  const shipped = pipeline.filter((s) => s.status === "shipped").length;
  const total = pipeline.length;

  return (
    <div className="space-y-10">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-warm-400">
          <strong className="text-warm-600 font-medium">{shipped}/{total}</strong> pipeline steps operational
        </p>
        {health && (
          <div className="flex items-center gap-3 text-xs text-warm-400">
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${health.dolt === "ok" ? "bg-emerald-400" : "bg-red-400"}`} />
              Dolt
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${health.vllm === "ok" ? "bg-emerald-400" : "bg-red-400"}`} />
              LLM
            </span>
            <span className="flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${health.gitea === "ok" ? "bg-emerald-400" : "bg-red-400"}`} />
              Git
            </span>
          </div>
        )}
      </div>

      <section>
        <h3 className="text-lg text-warm-800 mb-6" style={{ fontFamily: "'Bitter', Georgia, serif" }}>
          Epic Pipeline
        </h3>
        <div className="relative">
          <div className="absolute left-[7px] top-3 bottom-3 w-px bg-warm-200" />
          <div className="space-y-0">
            {pipeline.map((step, i) => {
              const colors = statusColors[step.status];
              return (
                <div key={i} className="relative pl-8 py-3 animate-fade-in" style={{ animationDelay: `${i * 60}ms` }}>
                  <div className={`absolute left-0 top-[18px] w-[15px] h-[15px] rounded-full border-2 border-white ${colors.dot}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-warm-800">{step.name}</span>
                      <span className={`text-[11px] px-1.5 py-0.5 rounded ${colors.bg} ${colors.text}`}>
                        {step.status}
                      </span>
                    </div>
                    <p className="text-xs text-warm-400 mt-0.5">{step.detail}</p>
                    {step.bead && (
                      <span className="text-[11px] text-warm-300 font-mono mt-1 inline-block">{step.bead}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
