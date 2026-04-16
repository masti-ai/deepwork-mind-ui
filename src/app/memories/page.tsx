"use client";

import { useCallback, useEffect, useState } from "react";
import type { Memory, MemoryFilters, MemoryHealth } from "@/lib/types";
import MemoryCard from "@/components/MemoryCard";
import MemoryFilterBar from "@/components/MemoryFilter";
import MemoryHealthBar from "@/components/MemoryHealth";
import CreateMemory from "@/components/CreateMemory";

type ScopeGroup = { scope: string; memories: Memory[] };

function groupByScope(memories: Memory[]): ScopeGroup[] {
  const order = ["global", "town", "rig", "agent"];
  const groups: Record<string, Memory[]> = {};
  for (const mem of memories) {
    const key = mem.scope || "unknown";
    (groups[key] ??= []).push(mem);
  }
  return order
    .filter((s) => groups[s]?.length)
    .map((s) => ({ scope: s, memories: groups[s] }))
    .concat(
      Object.entries(groups)
        .filter(([s]) => !order.includes(s))
        .map(([scope, memories]) => ({ scope, memories }))
    );
}

export default function MemoriesPage() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [health, setHealth] = useState<MemoryHealth>({ total: 0, reads_today: 0, ratio: 0, never_recalled: 0 });
  const [filters, setFilters] = useState<MemoryFilters>({ query: "", kind: "", scope: "", min_confidence: 0 });
  const [loading, setLoading] = useState(true);
  const [showNeverRecalled, setShowNeverRecalled] = useState(false);

  const fetchMemories = useCallback(async () => {
    const params = new URLSearchParams();
    if (filters.query) params.set("q", filters.query);
    if (filters.kind) params.set("kind", filters.kind);
    if (filters.scope) params.set("scope", filters.scope);
    if (filters.min_confidence > 0) params.set("min_confidence", String(filters.min_confidence));

    try {
      const res = await fetch(`/api/memories?${params}`);
      const data = await res.json();
      setMemories(data.memories || []);
      setHealth(data.health || { total: 0, reads_today: 0, ratio: 0, never_recalled: 0 });
    } catch {
      // Silently handle — health bar shows 0s
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timeout = setTimeout(fetchMemories, 200);
    return () => clearTimeout(timeout);
  }, [fetchMemories]);

  const displayMemories = showNeverRecalled
    ? memories.filter((m) => m.access_count === 0)
    : memories;

  const groups = groupByScope(displayMemories);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <MemoryHealthBar health={health} />
        <CreateMemory onCreated={fetchMemories} />
      </div>

      <MemoryFilterBar filters={filters} onChange={setFilters} />

      {health.never_recalled > 0 && (
        <button
          onClick={() => setShowNeverRecalled(!showNeverRecalled)}
          className={`text-xs mb-6 transition-colors ${
            showNeverRecalled ? "text-accent" : "text-warm-300 hover:text-warm-500"
          }`}
        >
          {showNeverRecalled
            ? `Showing ${displayMemories.length} never-recalled memories`
            : `${health.never_recalled} memories never recalled`}
        </button>
      )}

      {loading ? (
        <div className="py-16 text-center text-sm text-warm-300">
          Loading memories...
        </div>
      ) : groups.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-warm-400">
            {filters.query || filters.kind || filters.scope
              ? "No memories match your filters."
              : "No memories yet. As your agents work, knowledge accumulates here."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <section key={group.scope}>
              <h3 className="text-xs font-medium text-warm-400 uppercase tracking-wider mb-3">
                {group.scope}
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
