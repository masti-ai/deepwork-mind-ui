"use client";

import { useCallback, useEffect, useState } from "react";
import type { Memory, MemoryFilters, MemoryHealth } from "@/lib/types";
import MemoryCard from "@/components/MemoryCard";
import MemoryFilterBar from "@/components/MemoryFilter";
import MemoryHealthBar from "@/components/MemoryHealth";
import CreateMemory from "@/components/CreateMemory";

function groupByTopic(memories: Memory[]): { topic: string; memories: Memory[] }[] {
  const groups: Record<string, Memory[]> = {};
  for (const mem of memories) {
    if (mem.topics.length === 0) {
      (groups["general"] ??= []).push(mem);
    } else {
      // Group by first topic for now
      const topic = mem.topics[0];
      (groups[topic] ??= []).push(mem);
    }
  }
  return Object.entries(groups)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([topic, mems]) => ({ topic, memories: mems }));
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [health, setHealth] = useState<MemoryHealth>({ total: 0, reads_today: 0, ratio: 0, never_recalled: 0 });
  const [filters, setFilters] = useState<MemoryFilters>({ query: "", tag: "", visibility: "" });
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);

  const fetchMemories = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.tag) params.set("tag", filters.tag);
    if (filters.visibility) params.set("visibility", filters.visibility);

    try {
      const res = await fetch(`/api/memories?${params}`);
      const data = await res.json();
      setMemories(data.memories || []);
      setHealth(data.health || { total: 0, reads_today: 0, ratio: 0, never_recalled: 0 });
    } catch {
      // health bar shows 0s
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchMemories, 200);
    return () => clearTimeout(timeout);
  }, [fetchMemories]);

  async function handleAnalyze() {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await fetch("/api/memories/analyze", { method: "POST" });
      const data = await res.json();
      setAnalysis(data.analysis || "No insights found.");
      fetchMemories(); // Refresh — analysis may have re-tagged
    } catch {
      setAnalysis("Analysis failed. Check DI MCP connection.");
    } finally {
      setAnalyzing(false);
    }
  }

  const allTags = [...new Set(memories.flatMap((m) => m.tags))].sort();
  const groups = groupByTopic(memories);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <MemoryHealthBar health={health} />
        <div className="flex items-center gap-3">
          <button
            onClick={handleAnalyze}
            disabled={analyzing || memories.length === 0}
            className="text-sm text-accent hover:text-accent/80 disabled:text-warm-300 transition-colors"
          >
            {analyzing ? "Analyzing..." : "Analyze memories"}
          </button>
          <CreateMemory onCreated={fetchMemories} />
        </div>
      </div>

      {analysis && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4 mb-6 animate-fade-in">
          <h4 className="text-xs font-medium text-accent mb-2">Analysis</h4>
          <p className="text-sm text-warm-700 leading-relaxed whitespace-pre-wrap">{analysis}</p>
          <button
            onClick={() => setAnalysis(null)}
            className="text-[11px] text-warm-400 hover:text-warm-600 mt-2 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      <MemoryFilterBar filters={filters} onChange={setFilters} availableTags={allTags} />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-warm-100/50 rounded-lg h-20 animate-pulse" />
          ))}
        </div>
      ) : memories.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-warm-400 mb-2">
            {filters.query || filters.tag || filters.visibility
              ? "No memories match your filters."
              : "No memories yet."}
          </p>
          <p className="text-xs text-warm-300 max-w-sm mx-auto leading-relaxed">
            As you work, Deepwork Mind learns from your sessions and accumulates knowledge here.
          </p>
        </div>
      ) : groups.length === 1 ? (
        // No grouping if only one topic
        <div className="space-y-2">
          {memories.map((memory) => (
            <MemoryCard key={memory.id} memory={memory} />
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.topic}>
              <h3 className="text-xs font-medium text-warm-400 mb-3 flex items-center gap-2">
                <span className="uppercase tracking-wider">{group.topic}</span>
                <span className="text-warm-300 font-normal">{group.memories.length}</span>
              </h3>
              <div className="space-y-2">
                {group.memories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
