import type { MemoryHealth } from "@/lib/types";

export default function MemoryHealthBar({ health }: { health: MemoryHealth }) {
  const ratioColor = health.ratio >= 1 ? "text-emerald-600" : health.ratio >= 0.5 ? "text-amber-600" : "text-red-500";

  return (
    <div className="flex items-center gap-6 text-xs text-warm-400 py-3">
      <span>
        <strong className="text-warm-600 font-medium">{health.total}</strong> memories
      </span>
      <span>
        <strong className="text-warm-600 font-medium">{health.reads_today}</strong> total reads
      </span>
      <span>
        read ratio <strong className={`font-medium ${ratioColor}`}>{health.ratio}</strong>
      </span>
      {health.never_recalled > 0 && (
        <span className="text-warm-300">
          {health.never_recalled} unused
        </span>
      )}
    </div>
  );
}
