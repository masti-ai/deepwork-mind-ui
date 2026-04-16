"use client";

import { useState } from "react";
import type { Memory } from "@/lib/types";

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const hours = Math.floor((now.getTime() - date.getTime()) / 3600000);
  if (hours < 1) return "just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export default function MemoryCard({ memory }: { memory: Memory }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      onClick={() => setExpanded(!expanded)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && setExpanded(!expanded)}
      className="w-full text-left bg-white rounded-lg px-5 py-4 transition-all hover:shadow-sm animate-fade-in border border-warm-100 hover:border-warm-200 cursor-pointer"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {memory.tags.map((tag) => (
              <span key={tag} className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-warm-100 text-warm-600">
                {tag}
              </span>
            ))}
            {memory.visibility === "org" && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-accent/10 text-accent">
                org
              </span>
            )}
          </div>

          <p className="text-sm text-warm-800 leading-relaxed">{memory.title}</p>

          {memory.topics.length > 0 && (
            <div className="flex gap-1.5 mt-2">
              {memory.topics.map((topic) => (
                <span key={topic} className="text-[10px] text-warm-400">#{topic}</span>
              ))}
            </div>
          )}

          {expanded && (
            <div className="mt-4 pt-3 border-t border-warm-100 animate-fade-in">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <div>
                  <dt className="text-warm-400">Importance</dt>
                  <dd className="text-warm-700 mt-0.5 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-warm-100 rounded-full overflow-hidden max-w-[80px]">
                      <div
                        className="h-full bg-accent rounded-full"
                        style={{ width: `${memory.importance * 100}%` }}
                      />
                    </div>
                    <span>{Math.round(memory.importance * 100)}%</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-warm-400">Used</dt>
                  <dd className="text-warm-700 mt-0.5">
                    {memory.access_count === 0 ? (
                      <span className="text-warm-300">never recalled</span>
                    ) : (
                      `${memory.access_count} time${memory.access_count !== 1 ? "s" : ""}`
                    )}
                  </dd>
                </div>
                {memory.source && (
                  <div>
                    <dt className="text-warm-400">Source</dt>
                    <dd className="text-warm-700 mt-0.5 font-mono text-[11px]">{memory.source}</dd>
                  </div>
                )}
              </dl>

              <div className="flex gap-2 mt-4" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => alert(`Memory "${memory.id}" will be injected into your next agent session.`)}
                  className="text-[11px] px-2.5 py-1 rounded bg-warm-50 text-warm-500 hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  Teach agent
                </button>
                <button
                  onClick={() => alert(`Memory added to org knowledge base.`)}
                  className="text-[11px] px-2.5 py-1 rounded bg-warm-50 text-warm-500 hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  Add to knowledge base
                </button>
                <button
                  onClick={() => alert(`Generating workflow from this memory...`)}
                  className="text-[11px] px-2.5 py-1 rounded bg-warm-50 text-warm-500 hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  Generate workflow
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs text-warm-300">{timeAgo(memory.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
