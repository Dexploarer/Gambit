import { describe, expect, it } from "vitest";
import { createDiffPreview, normalizeCardRows, parseCardsCsv } from "../src";
import type { CardDefinition } from "@gambit/template-schema";

describe("csv pipeline", () => {
  it("parses and validates cards csv", () => {
    const csv = [
      "card_id,name,type,template_id,variant,rarity,art_asset_id,rules_text,flavor_text,locale,cost,attack,health",
      "hall-monitor,Hall Monitor,unit,unit-base-v1,base,common,art-1,Gain +1 attack this turn.,No running.,en-US,1,1,2"
    ].join("\n");

    const parsed = parseCardsCsv(csv);
    expect(parsed.ok).toBe(true);

    const normalized = normalizeCardRows(parsed.rows);
    expect(normalized.cards).toHaveLength(1);
    expect(normalized.issues).toHaveLength(0);
  });

  it("builds diff preview deterministically", () => {
    const csv = [
      "card_id,name,type,template_id,variant,rarity,art_asset_id,rules_text,flavor_text,locale,cost,attack,health",
      "hall-monitor,Hall Monitor,unit,unit-base-v1,base,common,art-1,Gain +1 attack this turn.,No running.,en-US,1,1,2"
    ].join("\n");

    const parsed = parseCardsCsv(csv);
    const normalized = normalizeCardRows(parsed.rows);
    const first = normalized.cards[0];
    expect(first).toBeDefined();
    if (!first) throw new Error("Expected normalized card");

    const existing = new Map<string, CardDefinition>([
      [
        "hall-monitor",
        {
          ...first,
          flavorText: "Old text"
        }
      ]
    ]);

    const diff = createDiffPreview(normalized.cards, existing);
    expect(diff.inserts).toHaveLength(0);
    expect(diff.updates).toHaveLength(1);
    expect(diff.unchanged).toHaveLength(0);
  });
});
