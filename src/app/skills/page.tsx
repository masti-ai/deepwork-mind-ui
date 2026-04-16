"use client";

import { useEffect, useState } from "react";

interface Skill {
  id: string;
  title: string;
  kind: string;
  scope: string;
  confidence: number;
  access_count: number;
  created_at: string;
}

const kindSections: { kind: string; label: string; desc: string }[] = [
  { kind: "pattern", label: "Patterns", desc: "Approaches that consistently work" },
  { kind: "anti-pattern", label: "Anti-patterns", desc: "Approaches to avoid" },
  { kind: "decision", label: "Decisions", desc: "Key choices and their rationale" },
  { kind: "skill", label: "Skills", desc: "Capabilities demonstrated by agents" },
];

export default function SkillsPage() {
  const [skills, setSkills] = useState<Record<string, Skill[]>>({});
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/memories?scope=town");
        const data = await res.json();
        const memories: Skill[] = data.memories || [];
        const grouped: Record<string, Skill[]> = {};
        for (const mem of memories) {
          (grouped[mem.kind || "context"] ??= []).push(mem);
        }
        setSkills(grouped);
        setTotal(memories.length);
      } catch {
        /* silent */
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return <div className="py-16 text-center text-sm text-warm-300">Loading org knowledge...</div>;
  }

  if (total === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-warm-400 mb-2">No org-level skills yet.</p>
        <p className="text-xs text-warm-300 max-w-sm mx-auto leading-relaxed">
          As agents work and the memory synthesizer runs, patterns and decisions
          accumulate here as shared org knowledge.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <p className="text-xs text-warm-400">
        <strong className="text-warm-600 font-medium">{total}</strong> org-level insights
      </p>

      {kindSections
        .filter(({ kind }) => skills[kind]?.length)
        .map(({ kind, label, desc }) => (
          <section key={kind}>
            <div className="mb-4">
              <h3 className="text-lg text-warm-800" style={{ fontFamily: "'Bitter', Georgia, serif" }}>
                {label}
              </h3>
              <p className="text-xs text-warm-400 mt-0.5">{desc}</p>
            </div>
            <div className="divide-y divide-warm-100">
              {skills[kind].map((s) => (
                <div key={s.id} className="py-4 animate-fade-in">
                  <p className="text-sm text-warm-800 leading-relaxed">{s.title}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-warm-400">
                    <span>Confidence: <span className="text-warm-600">{Math.round(s.confidence * 100)}%</span></span>
                    <span>Used: <span className="text-warm-600">{s.access_count}×</span></span>
                    {s.scope === "town" && (
                      <span className="px-1.5 py-0.5 rounded bg-accent/10 text-accent text-[11px]">org-wide</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
    </div>
  );
}
