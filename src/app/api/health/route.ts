import { NextResponse } from "next/server";
import { query } from "@/lib/db";

type ServiceStatus = "ok" | "error" | "unknown";

interface HealthResponse {
  dolt: ServiceStatus;
  vllm: ServiceStatus;
  gitea: ServiceStatus;
}

export async function GET(): Promise<NextResponse<HealthResponse>> {
  const health: HealthResponse = { dolt: "unknown", vllm: "unknown", gitea: "unknown" };

  try {
    await query<{ result: number }>("SELECT 1 as result");
    health.dolt = "ok";
  } catch (_err: unknown) {
    health.dolt = "error";
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/health", { signal: AbortSignal.timeout(3000) });
    health.vllm = res.ok ? "ok" : "error";
  } catch (_err: unknown) {
    health.vllm = "error";
  }

  try {
    const res = await fetch("http://localhost:3300/", { signal: AbortSignal.timeout(3000) });
    health.gitea = res.ok ? "ok" : "error";
  } catch (_err: unknown) {
    health.gitea = "error";
  }

  return NextResponse.json(health);
}
