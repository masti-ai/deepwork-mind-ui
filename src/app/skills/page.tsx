"use client";

import { useEffect, useState } from "react";

interface Skill {
  name: string;
  description: string;
  version: string;
  path: string;
  source: "local" | "org" | "community";
  category: string;
  hasReferences: boolean;
  size: number;
}

const sourceColors = {
  local: "bg-warm-100 text-warm-600",
  org: "bg-accent/10 text-accent",
  community: "bg-blue-50 text-blue-600",
};

export default function SkillsPage() {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/skills").then((r) => r.json()).then((d) => {
      setSkills(d.skills || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-warm-100/50 rounded-lg h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  const categories = [...new Set(skills.map((s) => s.category))];
  const grouped: Record<string, Skill[]> = {};
  for (const s of skills) {
    (grouped[s.category] ??= []).push(s);
  }

  return (
    <div className="space-y-10">
      <div className="flex items-baseline justify-between">
        <p className="text-xs text-warm-400">
          <strong className="text-warm-600 font-medium">{skills.length}</strong> skills installed
        </p>
        <a
          href="https://versus.sh"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-accent hover:text-accent/80 transition-colors"
        >
          Browse community skills &rarr;
        </a>
      </div>

      {categories.map((cat) => (
        <section key={cat}>
          <h3 className="text-lg text-warm-800 mb-4" style={{ fontFamily: "'Bitter', Georgia, serif" }}>
            {cat}
          </h3>
          <div className="space-y-1">
            {grouped[cat].map((skill) => (
              <div
                key={skill.path || skill.name}
                onClick={() => setExpanded(expanded === skill.name ? null : skill.name)}
                className="bg-white rounded-lg px-4 py-3 border border-warm-100 hover:border-warm-200 cursor-pointer transition-all animate-fade-in"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-warm-800 font-medium">{skill.name}</span>
                    {skill.version && (
                      <span className="text-[10px] text-warm-300">v{skill.version}</span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${sourceColors[skill.source]}`}>
                      {skill.source}
                    </span>
                    {skill.hasReferences && (
                      <span className="text-[10px] text-warm-300">+ references</span>
                    )}
                  </div>
                </div>
                {skill.description && (
                  <p className="text-xs text-warm-500 mt-1 leading-relaxed line-clamp-2">
                    {skill.description}
                  </p>
                )}
                {expanded === skill.name && (
                  <div className="mt-3 pt-3 border-t border-warm-100 animate-fade-in text-xs text-warm-500">
                    <div className="grid grid-cols-2 gap-3">
                      <div>Source: <span className="text-warm-700">{skill.source}</span></div>
                      <div>Size: <span className="text-warm-700">{(skill.size / 1024).toFixed(1)}KB</span></div>
                    </div>
                    <p className="text-[10px] text-warm-300 mt-2 font-mono break-all">{skill.path}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      {skills.length === 0 && (
        <div className="py-16 text-center">
          <p className="text-sm text-warm-400">No skills installed.</p>
          <p className="text-xs text-warm-300 mt-1">
            Skills are instruction files that teach your agents how to work. Browse <a href="https://versus.sh" className="text-accent">versus.sh</a> to find skills.
          </p>
        </div>
      )}
    </div>
  );
}
