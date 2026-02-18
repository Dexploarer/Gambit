import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { applyEvent as applyEngineEvent, createInitialRuntimeState } from "@gambit/effect-engine";
import { nowTs } from "./_helpers";

export const applyEvent = mutation({
  args: {
    cardId: v.string(),
    event: v.any()
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

    const effects = await ctx.db.query("effects").collect();
    const activeEffects = effects
      .map((record) => record.spec)
      .filter((spec) => !card.data.effectId || spec.effectId === card.data.effectId);

    const currentState = runtime?.state ?? createInitialRuntimeState({
      cardId: args.cardId,
      baseStats: card.data.baseStats ?? {}
    });

    const projected = applyEngineEvent(currentState, activeEffects, args.event);

    if (runtime) {
      await ctx.db.patch(runtime._id, {
        state: projected.next,
        appliedEffects: projected.appliedEffects,
        updatedAt: nowTs()
      });
    } else {
      await ctx.db.insert("runtime", {
        cardId: args.cardId,
        state: projected.next,
        appliedEffects: projected.appliedEffects,
        updatedAt: nowTs()
      });
    }

    return {
      state: projected.next,
      appliedEffects: projected.appliedEffects
    };
  }
});

export const getProjectedCard = query({
  args: { cardId: v.string() },
  handler: async (ctx, args) => {
    const runtime = await ctx.db
      .query("runtime")
      .withIndex("by_card_id", (q) => q.eq("cardId", args.cardId))
      .unique();

    if (!runtime) return null;

    return {
      state: runtime.state,
      appliedEffects: runtime.appliedEffects
    };
  }
});
