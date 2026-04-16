"use client";

import { useState } from "react";
import type { MemoryVisibility } from "@/lib/types";

interface Props {
  onCreated: () => void;
}

export default function CreateMemory({ onCreated }: Props) {
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<MemoryVisibility>("private");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || saving) return;

    setSaving(true);
    try {
      const res = await fetch("/api/memories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          visibility,
          // AI will auto-tag — no manual tag selection needed
        }),
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
        placeholder="What should be remembered? AI will categorize it automatically..."
        rows={3}
        autoFocus
        className="w-full text-sm text-warm-800 placeholder:text-warm-300 bg-transparent border-none focus:outline-none resize-none leading-relaxed"
      />

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-warm-100">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setVisibility("private")}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              visibility === "private"
                ? "bg-warm-200 text-warm-700"
                : "bg-warm-50 text-warm-400 hover:bg-warm-100"
            }`}
          >
            Private
          </button>
          <button
            type="button"
            onClick={() => setVisibility("org")}
            className={`text-xs px-3 py-1.5 rounded-full transition-colors ${
              visibility === "org"
                ? "bg-accent/10 text-accent"
                : "bg-warm-50 text-warm-400 hover:bg-warm-100"
            }`}
          >
            Share with org
          </button>
        </div>

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
          className="text-xs bg-accent text-white rounded-lg px-4 py-1.5 hover:bg-accent/90 disabled:opacity-40 transition-colors"
        >
          {saving ? "Saving..." : "Remember"}
        </button>
      </div>
    </form>
  );
}
