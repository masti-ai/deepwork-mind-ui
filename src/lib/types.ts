export type MemoryKind = "pattern" | "decision" | "incident" | "skill" | "context" | "anti-pattern";
export type MemoryScope = "agent" | "rig" | "town" | "global";

export interface Memory {
  id: string;
  title: string;
  kind: MemoryKind;
  scope: MemoryScope;
  confidence: number;
  access_count: number;
  last_accessed: string;
  decay_at: string;
  source_bead: string;
  created_at: string;
}

export interface MemoryHealth {
  total: number;
  reads_today: number;
  ratio: number;
  never_recalled: number;
}

export interface MemoryFilters {
  query: string;
  kind: MemoryKind | "";
  scope: MemoryScope | "";
  min_confidence: number;
}
