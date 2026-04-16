import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface MemRow {
  id: string;
  content: string;
  category: string;
  topics: string;
  importance: number;
  access_count: number;
}

export async function POST() {
  try {
    const memories = await query<MemRow>(
      `SELECT id, content, category, topics, importance, access_count
       FROM curated_memories WHERE archived = 0
       ORDER BY importance DESC LIMIT 50`
    );

    if (memories.length === 0) {
      return NextResponse.json({ analysis: "No memories to analyze yet." });
    }

    // Build analysis from the data
    const totalCount = memories.length;
    const neverUsed = memories.filter((m) => m.access_count === 0).length;
    const categories: Record<string, number> = {};
    const allTopics: Record<string, number> = {};

    for (const m of memories) {
      categories[m.category] = (categories[m.category] || 0) + 1;
      try {
        const topics: string[] = typeof m.topics === "string" ? JSON.parse(m.topics) : m.topics || [];
        for (const t of topics) {
          allTopics[t] = (allTopics[t] || 0) + 1;
        }
      } catch { /* skip */ }
    }

    const topCategories = Object.entries(categories).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const topTopics = Object.entries(allTopics).sort((a, b) => b[1] - a[1]).slice(0, 8);
    const highImportance = memories.filter((m) => m.importance >= 0.8);
    const lowImportance = memories.filter((m) => m.importance < 0.3);

    let analysis = `Analyzed ${totalCount} memories.\n\n`;

    if (neverUsed > 0) {
      const pct = Math.round((neverUsed / totalCount) * 100);
      analysis += `${neverUsed} memories (${pct}%) have never been recalled — they're accumulating but not being used.\n\n`;
    }

    if (topCategories.length > 0) {
      analysis += `Top categories: ${topCategories.map(([c, n]) => `${c} (${n})`).join(", ")}.\n\n`;
    }

    if (topTopics.length > 0) {
      analysis += `Knowledge clusters: ${topTopics.map(([t, n]) => `#${t} (${n})`).join(", ")}.\n\n`;
    }

    if (highImportance.length > 0) {
      analysis += `${highImportance.length} high-importance memories — these are your core knowledge.\n`;
    }

    if (lowImportance.length > 0) {
      analysis += `${lowImportance.length} low-importance memories may be ready for archival.\n`;
    }

    return NextResponse.json({ analysis: analysis.trim() });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ analysis: `Analysis failed: ${msg}` }, { status: 500 });
  }
}
