// Product-facing types — no Gas Town terminology

export type MemoryVisibility = "private" | "org";

export interface Memory {
  id: string;
  title: string;
  tags: string[];
  visibility: MemoryVisibility;
  importance: number;
  access_count: number;
  last_accessed: string;
  source: string;
  topics: string[];
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
  tag: string;
  visibility: MemoryVisibility | "";
}

export interface Skill {
  name: string;
  description: string;
  path: string;
  tags: string[];
  source: "local" | "org" | "community";
  last_used: string;
}

export interface Workflow {
  id: string;
  name: string;
  type: "cron" | "pipeline" | "agent";
  schedule: string;
  last_run: string;
  last_result: "success" | "failed" | "running" | "never";
  run_count: number;
  steps: string[];
}
