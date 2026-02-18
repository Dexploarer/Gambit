import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { validateTemplateManifestLite } from "./_validators";
import { nextVersion, nowTs } from "./_helpers";

export const create = mutation({
  args: { manifest: v.any() },
  handler: async (ctx, args) => {
    const validation = validateTemplateManifestLite(args.manifest);
    if (!validation.ok || !validation.value) {
      throw new Error(`Template validation failed: ${validation.issues.map((i) => i.message).join(", ")}`);
    }

    const existing = await ctx.db
      .query("templates")
      .withIndex("by_template_id", (q) => q.eq("templateId", validation.value.templateId))
      .unique();

    if (existing) {
      throw new Error(`Template already exists: ${validation.value.templateId}`);
    }

    const version = nextVersion(undefined);
    const updatedAt = nowTs();

    await ctx.db.insert("templates", {
      templateId: validation.value.templateId,
      manifest: validation.value,
      version,
      updatedAt
    });

    return {
      value: validation.value,
      version,
      updatedAt
    };
  }
});

export const update = mutation({
  args: {
    templateId: v.string(),
    manifest: v.any()
  },
  handler: async (ctx, args) => {
    const validation = validateTemplateManifestLite(args.manifest);
    if (!validation.ok || !validation.value) {
      throw new Error(`Template validation failed: ${validation.issues.map((i) => i.message).join(", ")}`);
    }

    const existing = await ctx.db
      .query("templates")
      .withIndex("by_template_id", (q) => q.eq("templateId", args.templateId))
      .unique();

    if (!existing) {
      throw new Error(`Template not found: ${args.templateId}`);
    }

    const version = nextVersion(existing.version);
    const updatedAt = nowTs();

    await ctx.db.patch(existing._id, {
      manifest: validation.value,
      version,
      updatedAt
    });

    return {
      value: validation.value,
      version,
      updatedAt
    };
  }
});

export const get = query({
  args: { templateId: v.string() },
  handler: async (ctx, args) => {
    const record = await ctx.db
      .query("templates")
      .withIndex("by_template_id", (q) => q.eq("templateId", args.templateId))
      .unique();

    if (!record) return null;
    return {
      value: record.manifest,
      version: record.version,
      updatedAt: record.updatedAt
    };
  }
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const records = await ctx.db.query("templates").collect();
    return records
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map((record) => ({
        value: record.manifest,
        version: record.version,
        updatedAt: record.updatedAt
      }));
  }
});
