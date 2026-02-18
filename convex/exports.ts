import { query } from "./_generated/server";
import { v } from "convex/values";

export const getManifest = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("exports").collect();
    const sorted = records.sort((a, b) => b.updatedAt - a.updatedAt);

    return {
      generatedAt: sorted[0]?.updatedAt ?? Date.now(),
      entries: sorted.map((record) => ({
        cardId: record.cardId,
        templateVersion: record.templateVersion,
        cardVersion: record.cardVersion,
        artVersion: record.artVersion,
        pngPath: record.pngPath
      }))
    };
  }
});

export const downloadPng = query({
  args: { cardId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("exports")
      .withIndex("by_card_id", (q) => q.eq("cardId", args.cardId))
      .unique();

    if (!record) return null;
    return {
      cardId: record.cardId,
      path: record.pngPath
    };
  }
});
