import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  const health: Record<string, string> = { dolt: "unknown", vllm: "unknown", gitea: "unknown" };

  try {
    await query("SELECT 1");
    health.dolt = "ok";
  } catch {
    health.dolt = "error";
  }

  try {
    const res = await fetch("http://127.0.0.1:8000/health", { signal: AbortSignal.timeout(3000) });
    health.vllm = res.ok ? "ok" : "error";
  } catch {
    health.vllm = "error";
  }

  try {
    const res = await fetch("http://localhost:3300/", { signal: AbortSignal.timeout(3000) });
    health.gitea = res.ok ? "ok" : "error";
  } catch {
    health.gitea = "error";
  }

  return NextResponse.json(health);
}
