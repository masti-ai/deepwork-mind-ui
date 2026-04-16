import { NextResponse } from "next/server";
import { readdir, readFile, stat } from "fs/promises";
import { join } from "path";

interface SkillInfo {
  name: string;
  description: string;
  version: string;
  path: string;
  source: "local" | "org" | "community";
  hasReferences: boolean;
  size: number;
}

async function scanSkillsDir(dir: string, source: "local" | "org" | "community"): Promise<SkillInfo[]> {
  const skills: SkillInfo[] = [];
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      const skillDir = join(dir, entry.name);
      const skillMd = join(skillDir, "SKILL.md");
      try {
        const content = await readFile(skillMd, "utf-8");
        // Parse frontmatter
        const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
        const fm: Record<string, string> = {};
        if (fmMatch) {
          for (const line of fmMatch[1].split("\n")) {
            const [key, ...vals] = line.split(":");
            if (key && vals.length) fm[key.trim()] = vals.join(":").trim();
          }
        }
        const refDir = join(skillDir, "reference");
        let hasRefs = false;
        try { hasRefs = (await stat(refDir)).isDirectory(); } catch { /* no refs */ }
        const fstat = await stat(skillMd);
        skills.push({
          name: fm.name || entry.name,
          description: fm.description || "",
          version: fm.version || "",
          path: skillDir,
          source,
          hasReferences: hasRefs,
          size: fstat.size,
        });
      } catch {
        // No SKILL.md — skip
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return skills;
}

async function scanCommands(dir: string): Promise<SkillInfo[]> {
  const skills: SkillInfo[] = [];
  try {
    const entries = await readdir(dir);
    for (const file of entries) {
      if (!file.endsWith(".md")) continue;
      const filePath = join(dir, file);
      const content = await readFile(filePath, "utf-8");
      const firstLine = content.split("\n").find((l) => l.trim().length > 0) || "";
      const fstat = await stat(filePath);
      skills.push({
        name: `/${file.replace(".md", "")}`,
        description: firstLine.replace(/^#\s*/, "").slice(0, 120),
        version: "",
        path: filePath,
        source: "local",
        hasReferences: false,
        size: fstat.size,
      });
    }
  } catch {
    // no commands dir
  }
  return skills;
}

export async function GET() {
  const gtRoot = process.env.GT_ROOT || "/home/pratham2/gt";

  try {
    const [agentSkills, packSkills, commands, claudeCommands] = await Promise.all([
      scanSkillsDir(join(gtRoot, ".agents/skills"), "local"),
      scanSkillsDir(join(gtRoot, "deepwork-org-config-pack/skills"), "org"),
      scanCommands(join(gtRoot, ".claude/commands")),
      scanCommands(join(gtRoot, "deepwork_intelligence/.claude/commands")),
    ]);

    const allSkills = [
      ...agentSkills.map((s) => ({ ...s, category: "Agent Skills" })),
      ...packSkills.map((s) => ({ ...s, category: "Organization Skills" })),
      ...commands.map((s) => ({ ...s, category: "Commands" })),
      ...claudeCommands.filter((c) => !commands.find((cc) => cc.name === c.name)).map((s) => ({ ...s, category: "Commands" })),
    ];

    return NextResponse.json({ skills: allSkills, total: allSkills.length });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg, skills: [] }, { status: 500 });
  }
}
