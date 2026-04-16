# Deepwork Mind UI

> Intelligence hub for coding agents. Three tabs: **Memories**, **Skills**, **Workflows**.

Deepwork Mind makes your coding agents (Claude Code, OpenCode, Cursor) accumulate knowledge instead of starting from scratch every session. This is the standalone dashboard — install with one command, see your agents get smarter.

## Quick Start

```bash
docker compose up
# Dashboard at http://localhost:3000
# DI MCP server at stdio (add .mcp.json to your project)
```

## Design

Wispr Flow-inspired. Light, warm, editorial. See [.impeccable.md](.impeccable.md) for full design context.

**Principles:**
1. **Three things, beautifully** — Memories, Skills, Workflows. That's it.
2. **Intelligence, not configuration** — shows value on first open.
3. **Concise yet informed** — depth on interaction, not first glance.
4. **Cumulative** — every visit shows more than last time.
5. **No slop** — every pixel earns its place.

## Architecture

- **Frontend**: Next.js 14+ with App Router, Tailwind CSS, custom components
- **Backend**: Deepwork Intelligence MCP server (Python)
- **Data**: Dolt SQL (gt_collab database)
- **LLM**: Pluggable — any provider (OpenAI, Anthropic, Gemini, Ollama, local vLLM)

## Tabs

### Memories
Browse, search, create memories. See read/write health. Org vs agent scope. Never-recalled highlights.

### Skills
Curated org knowledge auto-generated from accumulated memories. Beautiful markdown rendering. Export as config pack.

### Workflows
Create, trigger, monitor ADK workflows. Epic-close pipeline, custom sequences. Step-by-step execution logs.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for design guidelines and development setup.

## License

Apache 2.0

Built with [Deepwork](https://deepwork.art)
