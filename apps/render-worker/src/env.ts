import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function parseDotEnv(contents: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line.length === 0 || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    const value = line.slice(eq + 1).trim();
    if (key.length === 0) continue;
    const unquoted = value.replace(/^"(.*)"$/, "$1").replace(/^'(.*)'$/, "$1");
    // Treat empty assignments (`KEY=`) as "unset" to avoid accidentally overriding
    // a value defined earlier in the same env file.
    if (unquoted.length === 0) continue;
    values[key] = unquoted;
  }
  return values;
}

export function loadDotEnvLocal(): void {
  const candidates = [
    resolve(process.cwd(), ".env.local"),
    resolve(process.cwd(), "../.env.local"),
    resolve(process.cwd(), "../../.env.local")
  ];

  for (const filepath of candidates) {
    if (!existsSync(filepath)) continue;
    const contents = readFileSync(filepath, "utf8");
    const parsed = parseDotEnv(contents);
    for (const [key, value] of Object.entries(parsed)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
    break;
  }
}
