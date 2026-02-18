export type CardType = "unit" | "spell" | "artifact";
export type Rarity = "common" | "uncommon" | "rare" | "epic" | "legendary";
export type VariantTag = "base" | "foil" | "alt_art" | "promo";

export interface TextStyleToken {
  fontFamily: string;
  fontSize: number;
  fontWeight: number;
  color: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
}

export interface OverlayRule {
  id: string;
  src: string;
  blendMode?: "normal" | "screen" | "multiply" | "overlay";
  opacity?: number;
}

export interface TemplateLayer {
  layerId: string;
  kind: "image" | "shape" | "text";
  src?: string;
  zIndex: number;
  opacity?: number;
  blendMode?: "normal" | "screen" | "multiply" | "overlay";
}

export interface DynamicRegion {
  regionId: string;
  kind: "stat" | "text" | "icon" | "art_slot";
  bindKey: string;
  rect: { x: number; y: number; w: number; h: number };
  autoFit: boolean;
  zIndex: number;
}

export interface CardTemplateManifest {
  templateId: string;
  cardType: CardType;
  baseResolution: { width: number; height: number };
  layers: TemplateLayer[];
  dynamicRegions: DynamicRegion[];
  variantOverlays: Record<VariantTag, OverlayRule[]>;
  textStyles: Record<string, TextStyleToken>;
  version: number;
}

export interface CardDefinition {
  cardId: string;
  baseCardId?: string;
  locale: string;
  name: string;
  type: CardType;
  subtype?: string;
  rarity: Rarity;
  variant: VariantTag;
  templateId: string;
  artAssetId: string;
  flavorText: string;
  rulesText: string;
  baseStats: { cost?: number; attack?: number; health?: number };
  effectId?: string;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult<T> {
  ok: boolean;
  value?: T;
  issues: ValidationIssue[];
}
