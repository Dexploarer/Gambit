import { describe, expect, it } from "vitest";
import { validateCardDefinition, validateTemplateManifest } from "../src";

describe("validateTemplateManifest", () => {
  it("accepts a valid template manifest", () => {
    const result = validateTemplateManifest({
      templateId: "unit-base-v1",
      cardType: "unit",
      baseResolution: { width: 744, height: 1039 },
      layers: [{ layerId: "bg", kind: "image", src: "frame.png", zIndex: 1 }],
      dynamicRegions: [
        {
          regionId: "atk",
          kind: "stat",
          bindKey: "derivedStats.attack",
          rect: { x: 0.82, y: 0.82, w: 0.1, h: 0.1 },
          autoFit: true,
          zIndex: 10
        }
      ],
      variantOverlays: { base: [], foil: [], alt_art: [], promo: [] },
      textStyles: {
        rules: {
          fontFamily: "IBM Plex Sans",
          fontSize: 20,
          fontWeight: 500,
          color: "#111111"
        }
      },
      version: 1
    });

    expect(result.ok).toBe(true);
  });

  it("rejects duplicate region IDs", () => {
    const result = validateTemplateManifest({
      templateId: "unit-base-v1",
      cardType: "unit",
      baseResolution: { width: 744, height: 1039 },
      layers: [{ layerId: "bg", kind: "image", src: "frame.png", zIndex: 1 }],
      dynamicRegions: [
        {
          regionId: "atk",
          kind: "stat",
          bindKey: "derivedStats.attack",
          rect: { x: 0.82, y: 0.82, w: 0.1, h: 0.1 },
          autoFit: true,
          zIndex: 10
        },
        {
          regionId: "atk",
          kind: "stat",
          bindKey: "derivedStats.health",
          rect: { x: 0.12, y: 0.82, w: 0.1, h: 0.1 },
          autoFit: true,
          zIndex: 10
        }
      ],
      variantOverlays: { base: [], foil: [], alt_art: [], promo: [] },
      textStyles: {
        rules: {
          fontFamily: "IBM Plex Sans",
          fontSize: 20,
          fontWeight: 500,
          color: "#111111"
        }
      },
      version: 1
    });

    expect(result.ok).toBe(false);
    expect(result.issues[0]?.message).toContain("duplicate");
  });
});

describe("validateCardDefinition", () => {
  it("rejects spell with combat stats", () => {
    const result = validateCardDefinition({
      cardId: "fireball",
      locale: "en-US",
      name: "Fireball",
      type: "spell",
      rarity: "rare",
      variant: "base",
      templateId: "spell-base-v1",
      artAssetId: "art-fireball-v1",
      flavorText: "Burn bright.",
      rulesText: "Deal 3 damage.",
      baseStats: { cost: 2, attack: 9 }
    });

    expect(result.ok).toBe(false);
  });

  it("accepts valid unit card", () => {
    const result = validateCardDefinition({
      cardId: "hall-monitor",
      locale: "en-US",
      name: "Hall Monitor",
      type: "unit",
      rarity: "common",
      variant: "base",
      templateId: "unit-base-v1",
      artAssetId: "art-hall-monitor-v1",
      flavorText: "No running.",
      rulesText: "When summoned, gain +1 health this turn.",
      baseStats: { cost: 1, attack: 1, health: 2 }
    });

    expect(result.ok).toBe(true);
  });
});
