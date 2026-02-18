import { convexLikeApi } from "@gambit/convex-api";

let seeded = false;

export function ensureSeedData(): void {
  if (seeded) return;

  convexLikeApi.templates.create({
    templateId: "unit-base-v1",
    cardType: "unit",
    baseResolution: { width: 744, height: 1039 },
    layers: [
      { layerId: "bg", kind: "image", src: "/brand/logo.png", zIndex: 1 },
      { layerId: "frame", kind: "shape", zIndex: 2 }
    ],
    dynamicRegions: [
      {
        regionId: "cost",
        kind: "stat",
        bindKey: "stats.derived.cost",
        rect: { x: 0.07, y: 0.05, w: 0.11, h: 0.08 },
        autoFit: true,
        zIndex: 12
      },
      {
        regionId: "attack",
        kind: "stat",
        bindKey: "stats.derived.attack",
        rect: { x: 0.78, y: 0.84, w: 0.13, h: 0.11 },
        autoFit: true,
        zIndex: 12
      },
      {
        regionId: "health",
        kind: "stat",
        bindKey: "stats.derived.health",
        rect: { x: 0.07, y: 0.84, w: 0.13, h: 0.11 },
        autoFit: true,
        zIndex: 12
      }
    ],
    variantOverlays: {
      base: [],
      foil: [{ id: "foil-shimmer", src: "overlay://foil" }],
      alt_art: [{ id: "alt-border", src: "overlay://alt" }],
      promo: [{ id: "promo-stamp", src: "overlay://promo" }]
    },
    textStyles: {
      title: {
        fontFamily: "Space Grotesk",
        fontSize: 44,
        fontWeight: 700,
        color: "#141414"
      },
      body: {
        fontFamily: "IBM Plex Sans",
        fontSize: 20,
        fontWeight: 400,
        color: "#1a1a1a",
        lineHeight: 1.2
      }
    },
    version: 1
  });

  const csv = [
    "card_id,name,type,template_id,variant,rarity,art_asset_id,rules_text,flavor_text,locale,cost,attack,health,effect_id",
    "hall-monitor,Hall Monitor,unit,unit-base-v1,base,common,art-hall,When this unit enters, gain +1 attack this turn.,No running in the corridor.,en-US,1,1,2,boost-on-start",
    "detention-slip,Detention Slip,spell,unit-base-v1,promo,rare,art-slip,Target unit gets -2 attack this turn.,Paperwork is pain.,en-US,2,,,",
    "locker-shield,Locker Shield,artifact,unit-base-v1,foil,uncommon,art-locker,Your units get +1 health.,Steel beats fists.,en-US,2,,3,"
  ].join("\n");

  convexLikeApi.imports.applyCsv(csv);

  convexLikeApi.effects.upsert({
    effectId: "boost-on-start",
    triggers: [
      {
        on: "TURN_START",
        do: [{ type: "ADD_MODIFIER", stat: "attack", value: 1, duration: "turn" }]
      }
    ]
  });

  seeded = true;
}
