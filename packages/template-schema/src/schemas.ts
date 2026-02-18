export const CARD_TEMPLATE_MANIFEST_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "templateId",
    "cardType",
    "baseResolution",
    "layers",
    "dynamicRegions",
    "variantOverlays",
    "textStyles",
    "version"
  ],
  properties: {
    templateId: { type: "string", minLength: 1 },
    cardType: { enum: ["unit", "spell", "artifact"] },
    baseResolution: {
      type: "object",
      additionalProperties: false,
      required: ["width", "height"],
      properties: {
        width: { type: "number", minimum: 64 },
        height: { type: "number", minimum: 64 }
      }
    },
    layers: {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["layerId", "kind", "zIndex"],
        properties: {
          layerId: { type: "string", minLength: 1 },
          kind: { enum: ["image", "shape", "text"] },
          src: { type: "string" },
          zIndex: { type: "integer" },
          opacity: { type: "number", minimum: 0, maximum: 1 },
          blendMode: { enum: ["normal", "screen", "multiply", "overlay"] }
        }
      }
    },
    dynamicRegions: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["regionId", "kind", "bindKey", "rect", "autoFit", "zIndex"],
        properties: {
          regionId: { type: "string", minLength: 1 },
          kind: { enum: ["stat", "text", "icon", "art_slot"] },
          bindKey: { type: "string", minLength: 1 },
          rect: {
            type: "object",
            additionalProperties: false,
            required: ["x", "y", "w", "h"],
            properties: {
              x: { type: "number", minimum: 0, maximum: 1 },
              y: { type: "number", minimum: 0, maximum: 1 },
              w: { type: "number", exclusiveMinimum: 0, maximum: 1 },
              h: { type: "number", exclusiveMinimum: 0, maximum: 1 }
            }
          },
          autoFit: { type: "boolean" },
          zIndex: { type: "integer" }
        }
      }
    },
    variantOverlays: {
      type: "object",
      additionalProperties: false,
      required: ["base", "foil", "alt_art", "promo"],
      properties: {
        base: { $ref: "#/$defs/overlayArray" },
        foil: { $ref: "#/$defs/overlayArray" },
        alt_art: { $ref: "#/$defs/overlayArray" },
        promo: { $ref: "#/$defs/overlayArray" }
      }
    },
    textStyles: {
      type: "object",
      minProperties: 1,
      additionalProperties: {
        type: "object",
        additionalProperties: false,
        required: ["fontFamily", "fontSize", "fontWeight", "color"],
        properties: {
          fontFamily: { type: "string" },
          fontSize: { type: "number", minimum: 1 },
          fontWeight: { type: "number", minimum: 100, maximum: 900 },
          color: { type: "string" },
          align: { enum: ["left", "center", "right"] },
          lineHeight: { type: "number", minimum: 0.5 }
        }
      }
    },
    version: { type: "integer", minimum: 1 }
  },
  $defs: {
    overlayArray: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "src"],
        properties: {
          id: { type: "string", minLength: 1 },
          src: { type: "string", minLength: 1 },
          blendMode: { enum: ["normal", "screen", "multiply", "overlay"] },
          opacity: { type: "number", minimum: 0, maximum: 1 }
        }
      }
    }
  }
} as const;

export const CARD_DEFINITION_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "cardId",
    "locale",
    "name",
    "type",
    "rarity",
    "variant",
    "templateId",
    "artAssetId",
    "flavorText",
    "rulesText",
    "baseStats"
  ],
  properties: {
    cardId: { type: "string", minLength: 1 },
    baseCardId: { type: "string" },
    locale: { type: "string", minLength: 2 },
    name: { type: "string", minLength: 1 },
    type: { enum: ["unit", "spell", "artifact"] },
    subtype: { type: "string" },
    rarity: { enum: ["common", "uncommon", "rare", "epic", "legendary"] },
    variant: { enum: ["base", "foil", "alt_art", "promo"] },
    templateId: { type: "string", minLength: 1 },
    artAssetId: { type: "string", minLength: 1 },
    flavorText: { type: "string" },
    rulesText: { type: "string" },
    baseStats: {
      type: "object",
      additionalProperties: false,
      properties: {
        cost: { type: "number", minimum: 0 },
        attack: { type: "number", minimum: 0 },
        health: { type: "number", minimum: 0 }
      }
    },
    effectId: { type: "string" }
  }
} as const;
