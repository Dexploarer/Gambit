import { describe, expect, it } from "vitest";
import { buildRenderModel, toDrawCardPayload } from "../src";
import type { CardDefinition, CardTemplateManifest } from "@gambit/template-schema";

describe("card render model", () => {
  it("maps dynamic regions and overlays", () => {
    const template: CardTemplateManifest = {
      templateId: "unit-base-v1",
      cardType: "unit",
      baseResolution: { width: 744, height: 1039 },
      layers: [
        { layerId: "bg", kind: "image", src: "bg.png", zIndex: 1 },
        { layerId: "frame", kind: "image", src: "frame.png", zIndex: 2 }
      ],
      dynamicRegions: [
        {
          regionId: "atk",
          kind: "stat",
          bindKey: "stats.derived.attack",
          rect: { x: 0.8, y: 0.8, w: 0.1, h: 0.1 },
          autoFit: true,
          zIndex: 10
        }
      ],
      variantOverlays: {
        base: [{ id: "base-tint", src: "base.png" }],
        foil: [{ id: "foil", src: "foil.png" }],
        alt_art: [],
        promo: []
      },
      textStyles: {
        body: { fontFamily: "IBM Plex Sans", fontSize: 20, fontWeight: 400, color: "#111" }
      },
      version: 1
    };

    const card: CardDefinition = {
      cardId: "hall-monitor",
      locale: "en-US",
      name: "Hall Monitor",
      type: "unit",
      rarity: "common",
      variant: "foil",
      templateId: "unit-base-v1",
      artAssetId: "art-1",
      flavorText: "No running.",
      rulesText: "Gain +1 attack.",
      baseStats: { cost: 1, attack: 1, health: 2 }
    };

    const runtime = {
      cardId: "hall-monitor",
      baseStats: { cost: 1, attack: 1, health: 2 },
      modifiers: [],
      derivedStats: { cost: 1, attack: 3, health: 2 },
      badges: []
    };

    const model = buildRenderModel({ template, card, runtime });

    expect(model.regions[0]?.value).toBe(3);
    expect(model.overlays.map((overlay) => overlay.id)).toEqual(["base-tint", "foil"]);

    const payload = toDrawCardPayload(template, card, runtime);
    expect(payload.stats.find((s) => s.key === "attack")?.value).toBe(3);
  });
});
