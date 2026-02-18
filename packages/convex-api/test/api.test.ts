import { describe, expect, it } from "vitest";
import { convexLikeApi } from "../src";

describe("convex-like api", () => {
  it("supports template/card/import/effect/runtime/render/export flow", () => {
    const template = convexLikeApi.templates.create({
      templateId: "unit-base-v1",
      cardType: "unit",
      baseResolution: { width: 744, height: 1039 },
      layers: [{ layerId: "bg", kind: "image", src: "bg.png", zIndex: 1 }],
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
      variantOverlays: { base: [], foil: [], alt_art: [], promo: [] },
      textStyles: {
        body: { fontFamily: "IBM Plex Sans", fontSize: 20, fontWeight: 400, color: "#111" }
      },
      version: 1
    });

    expect(template.version).toBe(1);

    const csv = [
      "card_id,name,type,template_id,variant,rarity,art_asset_id,rules_text,flavor_text,locale,cost,attack,health,effect_id",
      "hall-monitor,Hall Monitor,unit,unit-base-v1,base,common,art-1,Gain +1 attack this turn.,No running.,en-US,1,1,2,boost-effect"
    ].join("\n");

    const importResult = convexLikeApi.imports.applyCsv(csv);
    expect(importResult.upserted).toHaveLength(1);

    convexLikeApi.effects.upsert({
      effectId: "boost-effect",
      triggers: [
        {
          on: "TURN_START",
          do: [{ type: "ADD_MODIFIER", stat: "attack", value: 1, duration: "turn" }]
        }
      ]
    });

    const projected = convexLikeApi.runtime.applyEvent("hall-monitor", {
      event: "TURN_START",
      at: Date.now(),
      payload: {}
    });

    expect(projected.state.derivedStats.attack).toBe(2);

    const job = convexLikeApi.render.enqueueCard("hall-monitor");
    expect(job.status).toBe("succeeded");

    const manifest = convexLikeApi.exports.getManifest();
    expect(manifest.entries).toHaveLength(1);

    const png = convexLikeApi.exports.downloadPng("hall-monitor");
    expect(png?.path).toContain("hall-monitor");
  });
});
