const CARD_TYPES = ["unit", "spell", "artifact"] as const;
const RARITIES = ["common", "uncommon", "rare", "epic", "legendary"] as const;
const VARIANTS = ["base", "foil", "alt_art", "promo"] as const;

type AnyRecord = Record<string, unknown>;

export function validateTemplateManifestLite(input: unknown): { ok: boolean; value?: AnyRecord; issues: string[] } {
  const issues: string[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: ["manifest must be an object"] };
  }

  const manifest = input as AnyRecord;
  if (typeof manifest.templateId !== "string" || !manifest.templateId.trim()) issues.push("templateId is required");
  if (!CARD_TYPES.includes(manifest.cardType as any)) issues.push("cardType is invalid");
  if (!manifest.baseResolution || typeof manifest.baseResolution !== "object") issues.push("baseResolution is required");
  if (!Array.isArray(manifest.layers) || manifest.layers.length === 0) issues.push("layers are required");
  if (!Array.isArray(manifest.dynamicRegions)) issues.push("dynamicRegions must be an array");

  return {
    ok: issues.length === 0,
    value: manifest,
    issues
  };
}

export function validateCardDefinitionLite(input: unknown): {
  ok: boolean;
  value?: AnyRecord;
  issues: string[];
} {
  const issues: string[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, issues: ["card must be an object"] };
  }

  const card = input as AnyRecord;
  const requiredString = ["cardId", "locale", "name", "templateId", "artAssetId", "flavorText", "rulesText"];
  for (const key of requiredString) {
    if (typeof card[key] !== "string" || !(card[key] as string).trim()) {
      issues.push(`${key} is required`);
    }
  }

  if (!CARD_TYPES.includes(card.type as any)) issues.push("type is invalid");
  if (!RARITIES.includes(card.rarity as any)) issues.push("rarity is invalid");
  if (!VARIANTS.includes(card.variant as any)) issues.push("variant is invalid");

  const stats = (card.baseStats as AnyRecord | undefined) ?? {};
  if (card.type === "unit") {
    if (typeof stats.attack !== "number" || typeof stats.health !== "number") {
      issues.push("unit cards require numeric attack and health");
    }
  }

  if (card.type === "spell") {
    if (stats.attack !== undefined || stats.health !== undefined) {
      issues.push("spell cards cannot define attack/health");
    }
  }

  return {
    ok: issues.length === 0,
    value: card,
    issues
  };
}

export function normalizeCardRowsLite(rows: Array<Record<string, string>>): {
  cards: AnyRecord[];
  issues: Array<{ row: number; column?: string; message: string; severity: "error" | "warning" }>;
} {
  const cards: AnyRecord[] = [];
  const issues: Array<{ row: number; column?: string; message: string; severity: "error" | "warning" }> = [];

  const toNumber = (value?: string) => {
    if (value === undefined || value === "") return undefined;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? undefined : parsed;
  };

  rows.forEach((row, index) => {
    const card = {
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

    const check = validateCardDefinitionLite(card);
    if (!check.ok) {
      for (const issue of check.issues) {
        issues.push({
          row: index + 2,
          severity: "error",
          message: issue
        });
      }
      return;
    }

    cards.push(card);
  });

  return { cards, issues };
}
