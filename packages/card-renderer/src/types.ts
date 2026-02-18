import type { CardRuntimeState } from "@gambit/effect-engine";
import type { CardDefinition, CardTemplateManifest, DynamicRegion, OverlayRule } from "@gambit/template-schema";

export interface RegionRenderBinding {
  regionId: string;
  bindKey: string;
  value: string | number | undefined;
  rectPx: { x: number; y: number; w: number; h: number };
}

export interface CardRenderModel {
  cardId: string;
  templateId: string;
  resolution: { width: number; height: number };
  layers: Array<{ id: string; kind: string; src?: string; zIndex: number }>;
  overlays: OverlayRule[];
  regions: RegionRenderBinding[];
  text: {
    name: string;
    rulesText: string;
    flavorText: string;
  };
}

export interface BuildRenderModelInput {
  template: CardTemplateManifest;
  card: CardDefinition;
  runtime: CardRuntimeState;
}

export interface DrawCardPayload {
  background: string;
  title: string;
  body: string;
  stats: Array<{ key: string; value: number }>;
  overlays: OverlayRule[];
}
