import type { CardRuntimeState } from "@gambit/effect-engine";
import type { CardDefinition } from "@gambit/template-schema";

export function getBindValue(
  bindKey: string,
  card: CardDefinition,
  runtime: CardRuntimeState
): string | number | undefined {
  const source = {
    card,
    stats: {
      base: runtime.baseStats,
      derived: runtime.derivedStats
    },
    badges: runtime.badges
  } as Record<string, unknown>;

  return bindKey.split(".").reduce<unknown>((acc, token) => {
    if (acc && typeof acc === "object" && token in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[token];
    }
    return undefined;
  }, source) as string | number | undefined;
}

export function resolveNumericStat(
  bindKey: string,
  card: CardDefinition,
  runtime: CardRuntimeState
): number {
  const value = getBindValue(bindKey, card, runtime);
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (!Number.isNaN(parsed)) return parsed;
  }
  return 0;
}
