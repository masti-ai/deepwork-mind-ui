"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { href: "/memories", label: "Memories" },
  { href: "/skills", label: "Skills" },
  { href: "/workflows", label: "Workflows" },
] as const;

export default function Shell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main className="min-h-screen bg-warm-50">
      <div className="max-w-4xl mx-auto px-8 pt-14 pb-24">
        <header className="mb-10">
          <div className="flex items-baseline justify-between">
            <div>
              <h1 className="text-2xl tracking-tight text-warm-800" style={{ fontFamily: "'Bitter', Georgia, serif", fontWeight: 400 }}>
                Deepwork Mind
              </h1>
              <p className="text-sm text-warm-400 mt-1">
                Your agents are learning. Here&apos;s what they know.
              </p>
            </div>
            <button
              className="text-warm-400 hover:text-warm-600 transition-colors p-2 -mr-2"
              aria-label="Settings"
              title="Settings"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>
          </div>

          <nav className="flex gap-0.5 mt-8 border-b border-warm-200">
            {tabs.map((tab) => {
              const active = pathname === tab.href || (tab.href === "/memories" && pathname === "/");
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`px-4 py-2.5 text-sm transition-colors border-b-2 -mb-px ${
                    active
                      ? "text-warm-800 border-accent"
                      : "text-warm-400 border-transparent hover:text-warm-600 hover:border-warm-300"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
        </header>

        {children}
      </div>
    </main>
  );
}
