import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { jobId, nowTs } from "./_helpers";

async function createRenderJob(ctx: any, cardIds: string[]) {
  const id = jobId("job");
  const createdAt = nowTs();

  const outputs: Array<{ cardId: string; pngPath: string; manifestPath: string }> = [];

  for (const cardId of cardIds) {
    const card = await ctx.db
      .query("cards")
      .withIndex("by_card_id", (q: any) => q.eq("cardId", cardId))
      .unique();
    if (!card) {
      throw new Error(`Card not found: ${cardId}`);
    }

    const template = await ctx.db
      .query("templates")
      .withIndex("by_template_id", (q: any) => q.eq("templateId", card.data.templateId))
      .unique();
    if (!template) {
      throw new Error(`Template not found: ${card.data.templateId}`);
    }

    const pngPath = `/exports/${cardId}.png`;
    const manifestPath = `/exports/${cardId}.json`;

    const existingExport = await ctx.db
      .query("exports")
      .withIndex("by_card_id", (q: any) => q.eq("cardId", cardId))
      .unique();

    const exportPayload = {
      cardId,
      templateVersion: template.version,
      cardVersion: card.version,
      artVersion: 1,
      pngPath,
      updatedAt: nowTs()
    };

    if (existingExport) {
      await ctx.db.patch(existingExport._id, exportPayload);
    } else {
      await ctx.db.insert("exports", exportPayload);
    }

    outputs.push({ cardId, pngPath, manifestPath });
  }

  await ctx.db.insert("renderJobs", {
    jobId: id,
    status: "succeeded",
    cardIds,
    outputs,
    createdAt,
    completedAt: nowTs()
  });

  return {
    jobId: id,
    status: "succeeded" as const,
    cardIds,
    outputs,
    createdAt,
    completedAt: nowTs()
  };
}

export const enqueueCard = mutation({
  args: { cardId: v.string() },
  handler: async (ctx, args) => createRenderJob(ctx, [args.cardId])
});

export const enqueueBatch = mutation({
  args: { cardIds: v.array(v.string()) },
  handler: async (ctx, args) => createRenderJob(ctx, args.cardIds)
});

export const getJob = query({
  args: { jobId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("renderJobs")
      .withIndex("by_job_id", (q) => q.eq("jobId", args.jobId))
      .unique();
  }
});
