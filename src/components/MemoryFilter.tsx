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
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => onChange({ ...filters, tag: "" })}
            className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${
              !filters.tag ? "bg-warm-800 text-white" : "bg-warm-100 text-warm-500 hover:bg-warm-200"
            }`}
          >
            All
          </button>
          {availableTags.map((t) => (
            <button
              key={t}
              onClick={() => onChange({ ...filters, tag: filters.tag === t ? "" : t })}
              className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${
                filters.tag === t ? "bg-accent text-white" : "bg-warm-100 text-warm-500 hover:bg-warm-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      <div className="flex gap-1.5">
        {(["", "private", "org"] as const).map((vis) => (
          <button
            key={vis || "all"}
            onClick={() => onChange({ ...filters, visibility: vis as MemoryVisibility | "" })}
            className={`text-xs px-2.5 py-1.5 rounded-full transition-colors ${
              filters.visibility === vis
                ? vis === "org" ? "bg-accent text-white" : "bg-warm-800 text-white"
                : "bg-warm-100 text-warm-500 hover:bg-warm-200"
            }`}
          >
            {vis === "" ? "All" : vis === "private" ? "Private" : "Org"}
          </button>
        ))}
      </div>
    </div>
  );
}
