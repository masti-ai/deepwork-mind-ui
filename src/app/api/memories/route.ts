import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

interface MemoryRow {
  id: string;
  title: string;
  metadata: string;
  created_at: string;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("q") || "";
  const kind = params.get("kind") || "";
  const scope = params.get("scope") || "";
  const minConfidence = parseFloat(params.get("min_confidence") || "0");

  const conditions = ["issue_type = 'memory'", "status = 'open'"];
  const values: string[] = [];

  if (search) {
    conditions.push("title LIKE ?");
    values.push(`%${search}%`);
  }
  if (scope) {
    conditions.push("JSON_EXTRACT(metadata, '$.\"memory.scope\"') = ?");
    values.push(scope);
  }
  if (kind) {
    conditions.push("JSON_EXTRACT(metadata, '$.\"memory.kind\"') = ?");
    values.push(kind);
  }

  const sql = `SELECT id, title, metadata, created_at FROM issues WHERE ${conditions.join(" AND ")} ORDER BY created_at DESC LIMIT 100`;

  try {
    const rows = await query<MemoryRow>(sql, values);

    const memories = rows
      .map((row) => {
        const meta = typeof row.metadata === "string" ? JSON.parse(row.metadata) : row.metadata || {};
        const confidence = parseFloat(meta["memory.confidence"] || "0");
        if (confidence < minConfidence) return null;
        return {
          id: row.id,
          title: row.title,
          kind: meta["memory.kind"] || "",
          scope: meta["memory.scope"] || "",
          confidence,
          access_count: parseInt(meta["memory.access_count"] || "0"),
          last_accessed: meta["memory.last_accessed"] || "",
          decay_at: meta["memory.decay_at"] || "",
          source_bead: meta["memory.source_bead"] || "",
          created_at: row.created_at,
        };
      })
      .filter(Boolean);

    // Health stats
    const totalRows = await query<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM issues WHERE issue_type = 'memory' AND status = 'open'"
    );
    const total = totalRows[0]?.cnt || 0;

    const neverRecalledRows = await query<{ cnt: number }>(
      "SELECT COUNT(*) as cnt FROM issues WHERE issue_type = 'memory' AND status = 'open' AND (JSON_EXTRACT(metadata, '$.\"memory.access_count\"') = '0' OR JSON_EXTRACT(metadata, '$.\"memory.access_count\"') IS NULL)"
    );
    const neverRecalled = neverRecalledRows[0]?.cnt || 0;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const readsRows = await query<{ total_reads: string }>(
      "SELECT COALESCE(SUM(CAST(JSON_EXTRACT(metadata, '$.\"memory.access_count\"') AS UNSIGNED)), 0) as total_reads FROM issues WHERE issue_type = 'memory' AND status = 'open'"
    );
    const totalReads = parseInt(readsRows[0]?.total_reads || "0");

    return NextResponse.json({
      memories,
      health: {
        total,
        reads_today: totalReads,
        ratio: total > 0 ? Math.round((totalReads / total) * 10) / 10 : 0,
        never_recalled: neverRecalled,
      },
    });
  } catch (e) {
    console.error("Memory query failed:", e);
    return NextResponse.json(
      { error: "Failed to fetch memories", memories: [], health: { total: 0, reads_today: 0, ratio: 0, never_recalled: 0 } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, kind = "pattern", scope = "rig", confidence = 0.8, decay_days = 0, source_bead = "" } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const validKinds = ["pattern", "decision", "incident", "skill", "context", "anti-pattern"];
  if (!validKinds.includes(kind)) {
    return NextResponse.json({ error: `Invalid kind. Must be: ${validKinds.join(", ")}` }, { status: 400 });
  }

  const crypto = await import("crypto");
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);
  const hash = crypto.createHash("sha256").update(`${content}${now}`).digest("hex").slice(0, 8);
  const id = `mem-${hash}`;

  const metadata: Record<string, string> = {
    "memory.kind": kind,
    "memory.confidence": String(confidence),
    "memory.scope": scope,
    "memory.access_count": "0",
    "memory.last_accessed": "",
  };

  if (decay_days > 0) {
    const decayDate = new Date(Date.now() + decay_days * 86400000);
    metadata["memory.decay_at"] = decayDate.toISOString();
  }
  if (source_bead) {
    metadata["memory.source_bead"] = source_bead;
  }

  try {
    await query(
      "INSERT INTO issues (id, title, description, design, acceptance_criteria, notes, status, issue_type, priority, created_at, updated_at, metadata) VALUES (?, ?, '', '', '', '', 'open', 'memory', 2, ?, ?, ?)",
      [id, content, now, now, JSON.stringify(metadata)]
    );

    return NextResponse.json({ id, title: content, kind, scope, confidence });
  } catch (e) {
    console.error("Memory create failed:", e);
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}
