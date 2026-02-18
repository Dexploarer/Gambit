import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { createInitialRuntimeState } from "@gambit/effect-engine";
import { createDiffPreview } from "@gambit/csv-pipeline/src/diff";
import { nextVersion, nowTs } from "./_helpers";
import { validateCardDefinitionLite } from "./_validators";

export const upsertBatch = mutation({
  args: { cards: v.array(v.any()) },
  handler: async (ctx, args) => {
    const results: Array<{ value: unknown; version: number; updatedAt: number }> = [];

    for (const rawCard of args.cards) {
      const validation = validateCardDefinitionLite(rawCard);
      if (!validation.ok || !validation.value) {
        throw new Error(`Card validation failed: ${validation.issues.map((i) => i.message).join(", ")}`);
      }

      const card = validation.value;
      const existing = await ctx.db
        .query("cards")
        .withIndex("by_card_id", (q) => q.eq("cardId", card.cardId))
        .unique();

      const version = nextVersion(existing?.version);
      const updatedAt = nowTs();

      if (existing) {
        await ctx.db.patch(existing._id, { data: card, version, updatedAt });
      } else {
        await ctx.db.insert("cards", { cardId: card.cardId, data: card, version, updatedAt });
      }

      const runtime = await ctx.db
        .query("runtime")
        .withIndex("by_card_id", (q) => q.eq("cardId", card.cardId))
        .unique();

      if (!runtime) {
        await ctx.db.insert("runtime", {
          cardId: card.cardId,
          state: createInitialRuntimeState({ cardId: card.cardId, baseStats: card.baseStats }),
          appliedEffects: [],
          updatedAt
        });
      }

      results.push({ value: card, version, updatedAt });
    }

    return results;
  }
});

export const get = query({
  args: { cardId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("cards")
      .withIndex("by_card_id", (q) => q.eq("cardId", args.cardId))
      .unique();

    if (!record) return null;
    return { value: record.data, version: record.version, updatedAt: record.updatedAt };
  }
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("cards").collect();
    return records
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((record) => ({ value: record.data, version: record.version, updatedAt: record.updatedAt }));
  }
});

export const diffPreview = query({
  args: { cards: v.array(v.any()) },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("cards").collect();
    const existingMap = new Map(existing.map((record) => [record.cardId, record.data]));
    return createDiffPreview(args.cards as any[], existingMap as Map<string, any>);
  }
});
