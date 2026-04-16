"use client";

import { useState, useEffect } from "react";

interface AnalyticsData {
  total_calls: number;
  error_count: number;
  by_tool: { tool_name: string; call_count: number; avg_latency_ms: number; error_count: number }[];
  by_caller: { caller: string; call_count: number }[];
}

export default function SettingsPage() {
  const [provider, setProvider] = useState("minimax");
  const [model, setModel] = useState("MiniMax-M2.5");
  const [apiKey, setApiKey] = useState("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/analytics").then(r => r.json()).then(setAnalytics).catch(() => {});
  }, []);

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-12">
      {/* AI Provider */}
      <section>
        <h3 className="text-lg text-warm-800 mb-4" style={{ fontFamily: "'Bitter', Georgia, serif" }}>
          AI Provider
        </h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs text-warm-500 mb-1.5">Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full bg-white border border-warm-200 rounded-lg px-3 py-2.5 text-sm text-warm-800 focus:outline-none focus:border-accent/40 transition-colors"
            >
              <option value="minimax">MiniMax (local GPU)</option>
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="google">Google Gemini</option>
              <option value="ollama">Ollama (local)</option>
              <option value="vllm">vLLM (local)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-warm-500 mb-1.5">Model</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-white border border-warm-200 rounded-lg px-3 py-2.5 text-sm text-warm-800 placeholder:text-warm-300 focus:outline-none focus:border-accent/40 transition-colors"
              placeholder="e.g., gpt-4o, claude-sonnet-4-6, gemini-2.5-flash"
            />
          </div>
          <div>
            <label className="block text-xs text-warm-500 mb-1.5">API Key</label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-white border border-warm-200 rounded-lg px-3 py-2.5 text-sm text-warm-800 placeholder:text-warm-300 focus:outline-none focus:border-accent/40 transition-colors"
              placeholder="sk-..."
            />
          </div>
          <button
            onClick={handleSave}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              saved
                ? "bg-emerald-50 text-emerald-700"
                : "bg-accent text-white hover:opacity-90"
            }`}
          >
            {saved ? "Saved" : "Save provider settings"}
          </button>
        </div>
      </section>

      {/* Tool Analytics */}
      {analytics && (
        <section>
          <h3 className="text-lg text-warm-800 mb-4" style={{ fontFamily: "'Bitter', Georgia, serif" }}>
            Tool Usage
          </h3>
          <div className="flex items-center gap-6 text-xs text-warm-400 mb-6">
            <span><strong className="text-warm-600">{analytics.total_calls}</strong> total calls</span>
            <span><strong className="text-warm-600">{analytics.error_count}</strong> errors</span>
            <span>
              error rate: <strong className="text-warm-600">
                {analytics.total_calls > 0 ? ((analytics.error_count / analytics.total_calls) * 100).toFixed(1) : 0}%
              </strong>
            </span>
          </div>

          <div className="space-y-1">
            {analytics.by_tool.map((tool) => {
              const maxCalls = analytics.by_tool[0]?.call_count || 1;
              const width = Math.max((tool.call_count / maxCalls) * 100, 4);
              return (
                <div key={tool.tool_name} className="flex items-center gap-3 py-1.5">
                  <span className="text-xs text-warm-600 w-44 shrink-0 font-mono truncate">{tool.tool_name}</span>
                  <div className="flex-1 h-5 bg-warm-100 rounded overflow-hidden">
                    <div
                      className="h-full bg-accent/20 rounded flex items-center px-2"
                      style={{ width: `${width}%` }}
                    >
                      <span className="text-[10px] text-warm-600">{tool.call_count}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-warm-400 w-16 text-right">
                    {Math.round(tool.avg_latency_ms)}ms
                  </span>
                </div>
              );
            })}
          </div>

          {analytics.by_caller.length > 0 && (
            <div className="mt-8">
              <h4 className="text-sm text-warm-600 mb-3">By caller</h4>
              <div className="flex flex-wrap gap-2">
                {analytics.by_caller.map((c) => (
                  <span key={c.caller} className="text-xs bg-warm-100 text-warm-600 px-2 py-1 rounded">
                    {c.caller.replace("deepwork_intelligence/polecats/", "")} <strong>{c.call_count}</strong>
                  </span>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
