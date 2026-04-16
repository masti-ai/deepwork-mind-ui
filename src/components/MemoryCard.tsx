"use client";

import { useState } from "react";
import type { Memory } from "@/lib/types";

const kindColors: Record<string, { bg: string; text: string }> = {
  pattern: { bg: "bg-amber-50", text: "text-amber-700" },
  decision: { bg: "bg-blue-50", text: "text-blue-700" },
  incident: { bg: "bg-red-50", text: "text-red-700" },
  skill: { bg: "bg-emerald-50", text: "text-emerald-700" },
  context: { bg: "bg-warm-100", text: "text-warm-600" },
  "anti-pattern": { bg: "bg-orange-50", text: "text-orange-700" },
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const hours = Math.floor(diffMs / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export default function MemoryCard({ memory }: { memory: Memory }) {
  const [expanded, setExpanded] = useState(false);
  const colors = kindColors[memory.kind] || kindColors.context;

  return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full text-left bg-white rounded-lg px-5 py-4 transition-all hover:shadow-sm animate-fade-in border border-warm-100 hover:border-warm-200"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colors.bg} ${colors.text}`}>
              {memory.kind}
            </span>
            <span className="text-xs text-warm-300">
              {memory.scope}
            </span>
          </div>

          <p className="text-sm text-warm-800 leading-relaxed">
            {memory.title}
          </p>

          {expanded && (
            <div className="mt-4 pt-3 border-t border-warm-100 animate-fade-in">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div>
                  <dt className="text-warm-400">Confidence</dt>
                  <dd className="text-warm-700 mt-0.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-warm-100 rounded-full overflow-hidden max-w-[80px]">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${memory.confidence * 100}%` }}
                      />
                    </div>
                    <span>{Math.round(memory.confidence * 100)}%</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-warm-400">Recalled</dt>
                  <dd className="text-warm-700 mt-0.5">
                    {memory.access_count === 0 ? (
                      <span className="text-warm-300">never</span>
                    ) : (
                      `${memory.access_count} time${memory.access_count !== 1 ? "s" : ""}`
                    )}
                  </dd>
                </div>
                {memory.source_bead && (
                  <div>
                    <dt className="text-warm-400">Source</dt>
                    <dd className="text-warm-700 mt-0.5 font-mono">{memory.source_bead}</dd>
                  </div>
                )}
                {memory.decay_at && (
                  <div>
                    <dt className="text-warm-400">Decays</dt>
                    <dd className="text-warm-700 mt-0.5">{timeAgo(memory.decay_at)}</dd>
                  </div>
                )}
              </dl>
              <p className="text-xs text-warm-300 mt-3 font-mono">{memory.id}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-warm-300">{timeAgo(memory.created_at)}</span>
          {memory.access_count === 0 && (
            <span className="text-xs text-warm-300/60">unused</span>
          )}
        </div>
      </div>
    </button>
  );
}
