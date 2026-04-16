"use client";

import type { MemoryFilters, MemoryVisibility } from "@/lib/types";

interface Props {
  filters: MemoryFilters;
  onChange: (filters: MemoryFilters) => void;
  availableTags: string[];
}

export default function MemoryFilterBar({ filters, onChange, availableTags }: Props) {
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

      {availableTags.length > 0 && (
        <select
          value={filters.tag}
          onChange={(e) => onChange({ ...filters, tag: e.target.value })}
          className="bg-white border border-warm-200 rounded-lg px-3 py-2 text-sm text-warm-600 focus:outline-none focus:border-accent/40 transition-colors appearance-none cursor-pointer pr-8"
        >
          <option value="">All tags</option>
          {availableTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      )}

      <select
        value={filters.visibility}
        onChange={(e) => onChange({ ...filters, visibility: e.target.value as MemoryVisibility | "" })}
        className="bg-white border border-warm-200 rounded-lg px-3 py-2 text-sm text-warm-600 focus:outline-none focus:border-accent/40 transition-colors appearance-none cursor-pointer pr-8"
      >
        <option value="">All</option>
        <option value="private">Private</option>
        <option value="org">Organization</option>
      </select>
    </div>
  );
}
