"use client";

import { useState } from "react";
import type { MemoryKind, MemoryScope } from "@/lib/types";

const kinds: MemoryKind[] = ["pattern", "decision", "incident", "skill", "context", "anti-pattern"];
const scopes: MemoryScope[] = ["agent", "rig", "town", "global"];

interface Props {
  onCreated: () => void;
}

export default function CreateMemory({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [kind, setKind] = useState<MemoryKind>("pattern");
  const [scope, setScope] = useState<MemoryScope>("rig");
  const [confidence, setConfidence] = useState(0.8);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || saving) return;

    setSaving(true);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: content.trim(), kind, scope, confidence }),
      });
      if (res.ok) {
        setContent("");
        setOpen(false);
        onCreated();
      }
    } finally {
      setSaving(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-warm-400 hover:text-accent transition-colors"
      >
        + Add memory
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white border border-warm-200 rounded-lg p-5 animate-fade-in">
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What should be remembered..."
        rows={2}
        autoFocus
        className="w-full text-sm text-warm-800 placeholder:text-warm-300 bg-transparent border-none focus:outline-none resize-none leading-relaxed"
      />

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-warm-100">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value as MemoryKind)}
          className="text-xs bg-warm-50 border border-warm-200 rounded px-2 py-1.5 text-warm-600 focus:outline-none"
        >
          {kinds.map((k) => (
            <option key={k} value={k}>{k}</option>
          ))}
        </select>

        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as MemoryScope)}
          className="text-xs bg-warm-50 border border-warm-200 rounded px-2 py-1.5 text-warm-600 focus:outline-none"
        >
          {scopes.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-xs text-warm-400">
          <span>conf</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={confidence}
            onChange={(e) => setConfidence(parseFloat(e.target.value))}
            className="w-16 accent-accent"
          />
          <span className="text-warm-600 w-6 text-right">{confidence}</span>
        </label>

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-warm-400 hover:text-warm-600 transition-colors px-2 py-1"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!content.trim() || saving}
          className="text-xs bg-accent text-white rounded px-3 py-1.5 hover:bg-accent/90 disabled:opacity-40 transition-colors"
        >
          {saving ? "Saving..." : "Remember"}
        </button>
      </div>
    </form>
  );
}
