import type { CardDefinition } from "@gambit/template-schema";
import type { DiffPreview } from "./types";

export function createDiffPreview(
  incoming: CardDefinition[],
  existingByCardId: Map<string, CardDefinition>
): DiffPreview {
  const inserts: CardDefinition[] = [];
  const updates: Array<{ before: CardDefinition; after: CardDefinition }> = [];
  const unchanged: CardDefinition[] = [];

  for (const next of incoming) {
    const prev = existingByCardId.get(next.cardId);
    if (!prev) {
      inserts.push(next);
      continue;
    }

    const isSame = JSON.stringify(prev) === JSON.stringify(next);
    if (isSame) {
      unchanged.push(next);
      continue;
    }

    updates.push({ before: prev, after: next });
  }

  return { inserts, updates, unchanged };
}
