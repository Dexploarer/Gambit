import type { CardRuntimeState } from "@gambit/effect-engine";
import type { CardDefinition, CardTemplateManifest, DynamicRegion, OverlayRule } from "@gambit/template-schema";
import type { BuildRenderModelInput, CardRenderModel, DrawCardPayload, RegionRenderBinding } from "./types";
import { getBindValue, resolveNumericStat } from "./bindings";

function rectToPixels(
  region: DynamicRegion,
  width: number,
  height: number
): RegionRenderBinding["rectPx"] {
  return {
    x: Math.round(region.rect.x * width),
    y: Math.round(region.rect.y * height),
    w: Math.round(region.rect.w * width),
    h: Math.round(region.rect.h * height)
  };
}

export function resolveOverlays(template: CardTemplateManifest, variant: CardDefinition["variant"]): OverlayRule[] {
  const base = template.variantOverlays.base ?? [];
  const specific = template.variantOverlays[variant] ?? [];
  return [...base, ...specific];
}

export function buildRenderModel(input: BuildRenderModelInput): CardRenderModel {
  const { template, card, runtime } = input;
  const width = template.baseResolution.width;
  const height = template.baseResolution.height;

  const layers = [...template.layers].sort((a, b) => a.zIndex - b.zIndex);

  const regions: RegionRenderBinding[] = template.dynamicRegions
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((region) => ({
      regionId: region.regionId,
      bindKey: region.bindKey,
      value: getBindValue(region.bindKey, card, runtime),
      rectPx: rectToPixels(region, width, height)
    }));

  return {
    cardId: card.cardId,
    templateId: template.templateId,
    resolution: { width, height },
    layers: layers.map((layer) => ({ id: layer.layerId, kind: layer.kind, src: layer.src, zIndex: layer.zIndex })),
    overlays: resolveOverlays(template, card.variant),
    regions,
    text: {
      name: card.name,
      rulesText: card.rulesText,
      flavorText: card.flavorText
    }
  };
}

export function toDrawCardPayload(
  template: CardTemplateManifest,
  card: CardDefinition,
  runtime: CardRuntimeState
): DrawCardPayload {
  return {
    background: template.layers.find((layer) => layer.kind === "image")?.src ?? "",
    title: card.name,
    body: `${card.rulesText}\n\n${card.flavorText}`,
    stats: [
      { key: "cost", value: resolveNumericStat("stats.derived.cost", card, runtime) },
      { key: "attack", value: resolveNumericStat("stats.derived.attack", card, runtime) },
      { key: "health", value: resolveNumericStat("stats.derived.health", card, runtime) }
    ],
    overlays: resolveOverlays(template, card.variant)
  };
}
