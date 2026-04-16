import type { MemoryHealth } from "@/lib/types";

export default function MemoryHealthBar({ health }: { health: MemoryHealth }) {
  return (
    <div className="flex items-center gap-6 text-xs text-warm-400 py-3">
      <span>
        <strong className="text-warm-600 font-medium">{health.total}</strong> memories
      </span>
      <span>
        <strong className="text-warm-600 font-medium">{health.reads_today}</strong> total reads
      </span>
      <span>
        ratio <strong className="text-warm-600 font-medium">{health.ratio}</strong>
      </span>
      {health.never_recalled > 0 && (
        <span className="text-warm-300">
          {health.never_recalled} never recalled
        </span>
      )}
    </div>
  );
}
