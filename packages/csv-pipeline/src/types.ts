import type { CardDefinition } from "@gambit/template-schema";

export type ImportFileKind = "cards" | "effects" | "art";

export interface CsvValidationIssue {
  row: number;
  column?: string;
  message: string;
  severity: "error" | "warning";
}

export interface CsvValidationResult<T> {
  ok: boolean;
  rows: T[];
  issues: CsvValidationIssue[];
  fileHash: string;
}

export interface CardCsvRow {
  card_id: string;
  base_card_id?: string;
  locale: string;
  name: string;
  type: "unit" | "spell" | "artifact";
  subtype?: string;
  rarity: "common" | "uncommon" | "rare" | "epic" | "legendary";
  variant: "base" | "foil" | "alt_art" | "promo";
  template_id: string;
  art_asset_id: string;
  flavor_text: string;
  rules_text: string;
  cost?: string;
  attack?: string;
  health?: string;
  effect_id?: string;
  tags?: string;
  status?: string;
}

export interface DiffPreview {
  inserts: CardDefinition[];
  updates: Array<{ before: CardDefinition; after: CardDefinition }>;
  unchanged: CardDefinition[];
}
