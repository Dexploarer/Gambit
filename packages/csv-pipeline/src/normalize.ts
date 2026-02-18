import { validateCardDefinition } from "@gambit/template-schema";
import type { CardDefinition } from "@gambit/template-schema";
import type { CardCsvRow, CsvValidationIssue } from "./types";

function toNumber(value?: string): number | undefined {
  if (value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function normalizeCardRows(rows: CardCsvRow[]): {
  cards: CardDefinition[];
  issues: CsvValidationIssue[];
} {
  const cards: CardDefinition[] = [];
  const issues: CsvValidationIssue[] = [];

  rows.forEach((row, index) => {
    const card: CardDefinition = {
      cardId: row.card_id,
      baseCardId: row.base_card_id || undefined,
      locale: row.locale,
      name: row.name,
      type: row.type,
      subtype: row.subtype || undefined,
      rarity: row.rarity,
      variant: row.variant,
      templateId: row.template_id,
      artAssetId: row.art_asset_id,
      flavorText: row.flavor_text,
      rulesText: row.rules_text,
      effectId: row.effect_id || undefined,
      baseStats: {
        cost: toNumber(row.cost),
        attack: toNumber(row.attack),
        health: toNumber(row.health)
      }
    };

    const result = validateCardDefinition(card);
    if (!result.ok) {
      for (const issue of result.issues) {
        issues.push({
          row: index + 2,
          severity: "error",
          column: issue.path,
          message: issue.message
        });
      }
      return;
    }

    cards.push(card);
  });

  return { cards, issues };
}
