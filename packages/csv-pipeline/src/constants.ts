export const REQUIRED_CARD_COLUMNS = [
  "card_id",
  "name",
  "type",
  "template_id",
  "variant",
  "rarity",
  "art_asset_id",
  "rules_text",
  "flavor_text",
  "locale"
] as const;

export const OPTIONAL_CARD_COLUMNS = [
  "base_card_id",
  "subtype",
  "cost",
  "attack",
  "health",
  "effect_id",
  "tags",
  "status"
] as const;
