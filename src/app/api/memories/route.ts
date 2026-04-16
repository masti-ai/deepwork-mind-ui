import { NextRequest, NextResponse } from "next/server";
import { query } from "@/lib/db";

interface CuratedMemoryRow {
  id: string;
  content: string;
  category: string;
  topics: string;
  importance: number;
  access_count: number;
  last_accessed_at: string | null;
  decay_lambda: number;
  source_town: string;
  created_at: string;
  archived: number;
}

interface HealthRow {
  total: number;
  total_reads: number;
  never_recalled: number;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const search = params.get("q") || "";
  const category = params.get("kind") || "";
  const scope = params.get("scope") || "";
  const minImportance = parseFloat(params.get("min_confidence") || "0");

  const conditions: string[] = ["archived = 0"];
  const values: (string | number)[] = [];

  if (search) {
    conditions.push("content LIKE ?");
    values.push(`%${search}%`);
  }
  if (category) {
    conditions.push("category = ?");
    values.push(category);
  }
  if (scope === "town" || scope === "global") {
    // For skills tab: high-importance org memories
    conditions.push("importance >= 0.5");
  }
  if (minImportance > 0) {
    conditions.push("importance >= ?");
    values.push(minImportance);
  }

  const sql = `SELECT id, content, category, topics, importance, access_count, last_accessed_at, decay_lambda, source_town, created_at, archived FROM curated_memories WHERE ${conditions.join(" AND ")} ORDER BY importance DESC, created_at DESC LIMIT 100`;

  try {
    const rows = await query<CuratedMemoryRow>(sql, values);

    // Also fetch from gc.issues (old system — MCP memory_remember writes here)
    interface GcMemoryRow { id: string; title: string; metadata: string; created_at: string; }
    let gcRows: GcMemoryRow[] = [];
    try {
      gcRows = await query<GcMemoryRow>(
        "SELECT id, title, metadata, created_at FROM gc.issues WHERE issue_type = 'memory' AND status = 'open' ORDER BY created_at DESC LIMIT 50"
      );
    } catch { /* gc may not be accessible */ }

    // Merge: add gc memories not already in curated
    const curatedIds = new Set(rows.map((r) => r.id));
    for (const gc of gcRows) {
      if (curatedIds.has(gc.id)) continue;
      const meta = typeof gc.metadata === "string" ? JSON.parse(gc.metadata) : gc.metadata || {};
      rows.push({
        id: gc.id,
        content: gc.title,
        category: meta["memory.kind"] || "context",
        topics: "[]",
        importance: parseFloat(meta["memory.confidence"] || "0.8"),
        access_count: parseInt(meta["memory.access_count"] || "0"),
        last_accessed_at: meta["memory.last_accessed"] || null,
        decay_lambda: 0,
        source_town: "deepwork",
        created_at: gc.created_at,
        archived: 0,
      });
    }

    const memories = rows.map((row) => {
      let topics: string[] = [];
      try {
        topics = typeof row.topics === "string" ? JSON.parse(row.topics) : row.topics || [];
      } catch { /* empty */ }

      return {
        id: row.id,
        title: row.content,
        tags: row.category ? [row.category] : [],
        visibility: row.importance >= 0.8 ? "org" as const : "private" as const,
        importance: row.importance,
        access_count: row.access_count,
        last_accessed: row.last_accessed_at || "",
        source: row.source_town || "",
        topics,
        created_at: row.created_at,
      };
    });

    // Health stats from indexed aggregates (fast)
    const healthRows = await query<HealthRow>(
      `SELECT
        COUNT(*) as total,
        COALESCE(SUM(access_count), 0) as total_reads,
        SUM(CASE WHEN access_count = 0 THEN 1 ELSE 0 END) as never_recalled
      FROM curated_memories WHERE archived = 0`
    );
    const h = healthRows[0] || { total: 0, total_reads: 0, never_recalled: 0 };

    return NextResponse.json({
      memories,
      health: {
        total: h.total,
        reads_today: h.total_reads,
        ratio: h.total > 0 ? Math.round((h.total_reads / h.total) * 10) / 10 : 0,
        never_recalled: h.never_recalled,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Memory query failed:", message);
    return NextResponse.json(
      { error: "Failed to fetch memories", detail: message, memories: [], health: { total: 0, reads_today: 0, ratio: 0, never_recalled: 0 } },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { content, kind = "pattern", confidence = 0.8, decay_days = 0, source_town = "deepwork" } = body;

  if (!content) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }

  const validKinds = ["pattern", "decision", "incident", "skill", "context", "anti-pattern", "debug-recipe", "environment"];
  if (!validKinds.includes(kind)) {
    return NextResponse.json({ error: `Invalid kind. Must be: ${validKinds.join(", ")}` }, { status: 400 });
  }

  const crypto = await import("crypto");
  const id = `mem-${crypto.randomBytes(4).toString("hex")}`;
  const now = new Date().toISOString().replace("T", " ").slice(0, 19);

  try {
    await query(
      `INSERT INTO curated_memories (id, content, category, topics, importance, importance_at, decay_lambda, access_count, source_town, created_at, archived)
       VALUES (?, ?, ?, '[]', ?, ?, ?, 0, ?, ?, 0)`,
      [id, content, kind, confidence, now, decay_days > 0 ? 0.05 : 0, source_town, now]
    );

    return NextResponse.json({ id, content, kind, importance: confidence });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error";
    console.error("Memory create failed:", message);
    return NextResponse.json({ error: "Failed to create memory" }, { status: 500 });
  }
}
