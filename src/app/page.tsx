import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-8 py-16">
        <h1 className="text-3xl font-light text-stone-800 mb-2">
          Deepwork Mind
        </h1>
        <p className="text-stone-500 mb-12">
          Your agents are learning. Here&apos;s what they know.
        </p>

        <nav className="flex gap-1 border-b border-stone-200 mb-8">
          <Link
            href="/memories"
            className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 border-b-2 border-transparent hover:border-stone-400 transition-colors"
          >
            Memories
          </Link>
          <Link
            href="/skills"
            className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 border-b-2 border-transparent hover:border-stone-400 transition-colors"
          >
            Skills
          </Link>
          <Link
            href="/workflows"
            className="px-4 py-2 text-sm text-stone-600 hover:text-stone-900 border-b-2 border-transparent hover:border-stone-400 transition-colors"
          >
            Workflows
          </Link>
        </nav>

        <div className="text-stone-400 text-sm">
          Select a tab to begin. Deepwork Mind accumulates knowledge as your agents work.
        </div>
      </div>
    </main>
  );
}
