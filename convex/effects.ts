import { mutation, action } from "./_generated/server";
import { v } from "convex/values";
import { applyEvent as applyEngineEvent, validateEffectSpec } from "@gambit/effect-engine";
import { createInitialRuntimeState } from "@gambit/effect-engine";
import { nextVersion, nowTs } from "./_helpers";

export const validate = action({
  args: { effect: v.any() },
  handler: async (_ctx, args) => validateEffectSpec(args.effect)
});

export const upsert = mutation({
  args: { effect: v.any() },
  handler: async (ctx, args) => {
    const check = validateEffectSpec(args.effect);
    if (!check.ok) {
      throw new Error(`Effect validation failed: ${check.issues.join(", ")}`);
    }

    const existing = await ctx.db
      .query("effects")
      .withIndex("by_effect_id", (q) => q.eq("effectId", args.effect.effectId))
      .unique();

    const version = nextVersion(existing?.version);
    const updatedAt = nowTs();

    if (existing) {
      await ctx.db.patch(existing._id, { spec: args.effect, version, updatedAt });
    } else {
      await ctx.db.insert("effects", {
        effectId: args.effect.effectId,
        spec: args.effect,
        version,
        updatedAt
      });
    }

    return {
      value: args.effect,
      version,
      updatedAt
    };
  }
});

export const simulate = mutation({
  args: {
    cardId: v.string(),
    events: v.array(v.any())
  },
  handler: async (ctx, args) => {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_card_id", (q) => q.eq("cardId", args.cardId))
      .unique();

    if (!card) {
      throw new Error(`Card not found: ${args.cardId}`);
    }

    const runtime = await ctx.db
      .query("runtime")
      .withIndex("by_card_id", (q) => q.eq("cardId", args.cardId))
      .unique();

    let current = runtime?.state ?? createInitialRuntimeState({
      cardId: args.cardId,
      baseStats: card.data.baseStats ?? {}
    });

    const effects = await ctx.db.query("effects").collect();
    const activeEffects = effects
      .map((record) => record.spec)
      .filter((spec) => !card.data.effectId || spec.effectId === card.data.effectId);

    let appliedEffects: string[] = [];
    for (const event of args.events) {
      const applied = applyEngineEvent(current, activeEffects, event);
      current = applied.next;
      appliedEffects = [...appliedEffects, ...applied.appliedEffects];
    }

    return {
      state: current,
      appliedEffects
    };
  }
});
