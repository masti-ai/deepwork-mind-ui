"use client";

import type { MemoryFilters, MemoryKind, MemoryScope } from "@/lib/types";

const kinds: MemoryKind[] = ["pattern", "decision", "incident", "skill", "context", "anti-pattern"];
const scopes: MemoryScope[] = ["agent", "rig", "town", "global"];

interface Props {
  filters: MemoryFilters;
  onChange: (filters: MemoryFilters) => void;
}

export default function MemoryFilterBar({ filters, onChange }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-6">
      <div className="flex-1 min-w-[200px]">
        <input
          type="text"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search memories..."
          className="w-full bg-white border border-warm-200 rounded-lg px-3.5 py-2 text-sm text-warm-800 placeholder:text-warm-300 focus:outline-none focus:border-accent/40 focus:ring-1 focus:ring-accent/20 transition-colors"
        />
      </div>

      <select
        value={filters.kind}
        onChange={(e) => onChange({ ...filters, kind: e.target.value as MemoryKind | "" })}
        className="bg-white border border-warm-200 rounded-lg px-3 py-2 text-sm text-warm-600 focus:outline-none focus:border-accent/40 transition-colors appearance-none cursor-pointer pr-8"
      >
        <option value="">All kinds</option>
        {kinds.map((k) => (
          <option key={k} value={k}>{k}</option>
        ))}
      </select>

      <select
        value={filters.scope}
        onChange={(e) => onChange({ ...filters, scope: e.target.value as MemoryScope | "" })}
        className="bg-white border border-warm-200 rounded-lg px-3 py-2 text-sm text-warm-600 focus:outline-none focus:border-accent/40 transition-colors appearance-none cursor-pointer pr-8"
      >
        <option value="">All scopes</option>
        {scopes.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
    </div>
  );
}
