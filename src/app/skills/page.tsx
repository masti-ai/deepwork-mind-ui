"use client";

import { useEffect, useState } from "react";

interface Tool {
  name: string;
  description: string;
  call_count: number;
  avg_latency_ms: number;
  last_used: string;
  domain: string;
}

function categorizeTool(name: string): string {
  if (name.includes("memory")) return "Memory";
  if (name.includes("wasteland") || name.includes("crown")) return "Auditing";
  if (name.includes("docs") || name.includes("github")) return "Publishing";
  if (name.includes("analytics") || name.includes("health")) return "Analytics";
  if (name.includes("feedback")) return "Feedback";
  return "General";
}

export default function SkillsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/skills");
        const data = await res.json();
        setTools(data.tools || []);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
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

  const domains = [...new Set(tools.map((t) => t.domain))].sort();
  const grouped: Record<string, Tool[]> = {};
  for (const t of tools) {
    (grouped[t.domain] ??= []).push(t);
  }

  const totalCalls = tools.reduce((sum, t) => sum + t.call_count, 0);

  return (
    <div className="space-y-10">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-warm-400">
          <strong className="text-warm-600 font-medium">{tools.length}</strong> tools available
          {totalCalls > 0 && (
            <> &middot; <strong className="text-warm-600 font-medium">{totalCalls}</strong> total invocations</>
          )}
        </p>
        <a
          href="https://versus.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:text-accent/80 transition-colors"
        >
          Browse community skills &rarr;
        </a>
      </div>

      {domains.map((domain) => (
        <section key={domain}>
          <h3 className="text-lg text-warm-800 mb-4" style={{ fontFamily: "'Bitter', Georgia, serif" }}>
            {domain}
          </h3>
          <div className="space-y-1">
            {grouped[domain].map((tool) => (
              <div
                key={tool.name}
                onClick={() => setExpanded(expanded === tool.name ? null : tool.name)}
                className="bg-white rounded-lg px-4 py-3 border border-warm-100 hover:border-warm-200 cursor-pointer transition-all animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <code className="text-sm text-warm-800 font-mono">{tool.name}</code>
                    {tool.call_count > 0 && (
                      <span className="text-[10px] text-warm-400 bg-warm-50 px-1.5 py-0.5 rounded">
                        {tool.call_count} calls
                      </span>
                    )}
                  </div>
                  {tool.avg_latency_ms > 0 && (
                    <span className="text-[10px] text-warm-300">{Math.round(tool.avg_latency_ms)}ms avg</span>
                  )}
                </div>
                {expanded === tool.name && (
                  <div className="mt-3 pt-3 border-t border-warm-100 animate-fade-in">
                    <p className="text-xs text-warm-500 leading-relaxed">{tool.description || "No description available."}</p>
                    {tool.last_used && (
                      <p className="text-[10px] text-warm-300 mt-2">Last used: {tool.last_used}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {tools.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-warm-400">No tools registered yet.</p>
          <p className="text-xs text-warm-300 mt-1">Connect Deepwork Mind MCP to your coding agent to see available tools.</p>
        </div>
      )}
    </div>
  );
}
