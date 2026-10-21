import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

import { walk } from "../tools/validate-skills.mjs";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));
const CLAUDE_DIR = /(?:\.claude|CLAUDE_CONFIG_DIR)\}?\/(?:projects|shell-snapshots)\b/;
const SPELLING = "${CLAUDE_CONFIG_DIR:-$HOME/.claude}/";
const HISTORY = new Set(["CHANGES.md"]);

test("Claude Code's projects and shell-snapshots paths read ${CLAUDE_CONFIG_DIR:-$HOME/.claude}/", () => {
  const files = walk(repoRoot).filter((file) => {
    const rel = relative(repoRoot, file);
    return !HISTORY.has(rel) && rel.split(sep)[0] !== "tests";
  });
  const hits = files.flatMap((file) =>
    readFileSync(file, "utf8")
      .split("\n")
      .flatMap((line, i) => (CLAUDE_DIR.test(line.replaceAll(SPELLING, "")) ? [`${relative(repoRoot, file)}:${i + 1}`] : [])),
  );
  expect(hits).toEqual([]);
});
