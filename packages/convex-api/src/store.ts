import { createDiffPreview, normalizeCardRows, parseCardsCsv } from "@gambit/csv-pipeline";
import { applyEvent, createInitialRuntimeState, validateEffectSpec } from "@gambit/effect-engine";
import { toDrawCardPayload } from "@gambit/card-renderer";
import { validateCardDefinition, validateTemplateManifest } from "@gambit/template-schema";
import type {
  CardRuntimeState,
  EffectSpec,
  GameEvent
} from "@gambit/effect-engine";
import type { CardDefinition, CardTemplateManifest } from "@gambit/template-schema";
import type {
  ConvexLikeApi,
  ExportManifest,
  ImportHistoryRecord,
  RenderJob,
  RuntimeProjection,
  Versioned
} from "./types";

class InMemoryStore {
  private templates = new Map<string, Versioned<CardTemplateManifest>>();
  private cards = new Map<string, Versioned<CardDefinition>>();
  private effects = new Map<string, Versioned<EffectSpec>>();
  private runtime = new Map<string, RuntimeProjection>();
  private imports: ImportHistoryRecord[] = [];
  private jobs = new Map<string, RenderJob>();
  private manifest: ExportManifest = { generatedAt: Date.now(), entries: [] };
  private imagePaths = new Map<string, string>();

  private now(): number {
    return Date.now();
  }

  private versioned<T>(existing: Versioned<T> | undefined, value: T): Versioned<T> {
    const version = (existing?.version ?? 0) + 1;
    return { value, version, updatedAt: this.now() };
  }

  public api(): ConvexLikeApi {
    return {
      templates: {
        create: (manifest) => {
          const valid = validateTemplateManifest(manifest);
          if (!valid.ok) throw new Error(`template validation failed: ${valid.issues.map((i) => i.message).join(", ")}`);

          const existing = this.templates.get(manifest.templateId);
          if (existing) throw new Error(`template already exists: ${manifest.templateId}`);
          const saved = this.versioned(undefined, manifest);
          this.templates.set(manifest.templateId, saved);
          return saved;
        },

        update: (templateId, manifest) => {
          const valid = validateTemplateManifest(manifest);
          if (!valid.ok) throw new Error(`template validation failed: ${valid.issues.map((i) => i.message).join(", ")}`);

          const current = this.templates.get(templateId);
          if (!current) throw new Error(`template not found: ${templateId}`);
          const saved = this.versioned(current, manifest);
          this.templates.set(templateId, saved);
          return saved;
        },

        get: (templateId) => this.templates.get(templateId) ?? null,

        list: () => [...this.templates.values()].sort((a, b) => b.updatedAt - a.updatedAt)
      },

      cards: {
        upsertBatch: (cards) => {
          const saved: Array<Versioned<CardDefinition>> = [];
          for (const card of cards) {
            const valid = validateCardDefinition(card);
            if (!valid.ok) throw new Error(`card validation failed: ${card.cardId}`);
            const current = this.cards.get(card.cardId);
            const next = this.versioned(current, card);
            this.cards.set(card.cardId, next);

            if (!this.runtime.has(card.cardId)) {
              this.runtime.set(card.cardId, {
                state: createInitialRuntimeState({
                  cardId: card.cardId,
                  baseStats: card.baseStats
                }),
                appliedEffects: []
              });
            }
            saved.push(next);
          }
          return saved;
        },

        get: (cardId) => this.cards.get(cardId) ?? null,

        list: () => [...this.cards.values()].sort((a, b) => b.updatedAt - a.updatedAt),

        diffPreview: (incoming) => {
          const existing = new Map<string, CardDefinition>();
          for (const [cardId, record] of this.cards.entries()) {
            existing.set(cardId, record.value);
          }
          return createDiffPreview(incoming, existing);
        }
      },

      imports: {
        validateCsv: (csv) => {
          const parsed = parseCardsCsv(csv);
          const normalized = normalizeCardRows(parsed.rows);
          const issues = [...parsed.issues, ...normalized.issues];

          return {
            ok: !issues.some((issue) => issue.severity === "error"),
            fileHash: parsed.fileHash,
            rows: parsed.rows.length,
            issues,
            normalizedCards: normalized.cards
          };
        },

        applyCsv: (csv) => {
          const validated = this.api().imports.validateCsv(csv);
          const importRecord: ImportHistoryRecord = {
            importId: `import_${this.imports.length + 1}`,
            fileHash: validated.fileHash,
            rowCount: validated.rows,
            issues: validated.issues,
            createdAt: this.now()
          };

          if (!validated.ok) {
            this.imports.unshift(importRecord);
            return {
              importRecord,
              upserted: []
            };
          }

          const upserted = this.api().cards.upsertBatch(validated.normalizedCards);
          this.imports.unshift(importRecord);
          return { importRecord, upserted };
        },

        history: () => this.imports
      },

      effects: {
        validate: (effect) => validateEffectSpec(effect),

        upsert: (effect) => {
          const result = validateEffectSpec(effect);
          if (!result.ok) throw new Error(`effect validation failed: ${result.issues.join(", ")}`);

          const current = this.effects.get(effect.effectId);
          const saved = this.versioned(current, effect);
          this.effects.set(effect.effectId, saved);
          return saved;
        },

        simulate: (cardId, events) => {
          const existing = this.runtime.get(cardId);
          if (!existing) throw new Error(`runtime not found: ${cardId}`);

          let current = existing;
          for (const event of events) {
            current = this.api().runtime.applyEvent(cardId, event);
          }
          return current;
        }
      },

      runtime: {
        applyEvent: (cardId, event) => {
          const runtime = this.runtime.get(cardId);
          const card = this.cards.get(cardId);
          if (!runtime || !card) throw new Error(`runtime or card not found: ${cardId}`);

          const activeEffects = [...this.effects.values()]
            .map((record) => record.value)
            .filter((effect) => effect.effectId === card.value.effectId || !card.value.effectId);

          const applied = applyEvent(runtime.state, activeEffects, event);
          const projection: RuntimeProjection = {
            state: applied.next,
            appliedEffects: applied.appliedEffects
          };
          this.runtime.set(cardId, projection);
          return projection;
        },

        getProjectedCard: (cardId) => this.runtime.get(cardId) ?? null
      },

      render: {
        enqueueCard: (cardId) => this.api().render.enqueueBatch([cardId]),

        enqueueBatch: (cardIds) => {
          const jobId = `job_${this.jobs.size + 1}`;
          const job: RenderJob = {
            jobId,
            status: "running",
            cardIds,
            createdAt: this.now(),
            outputs: []
          };
          this.jobs.set(jobId, job);

          try {
            for (const cardId of cardIds) {
              const card = this.cards.get(cardId);
              if (!card) throw new Error(`Card not found: ${cardId}`);
              const template = this.templates.get(card.value.templateId);
              if (!template) throw new Error(`Template not found: ${card.value.templateId}`);
              const runtime = this.runtime.get(cardId)?.state;
              if (!runtime) throw new Error(`Runtime missing for card: ${cardId}`);

              const payload = toDrawCardPayload(template.value, card.value, runtime);
              const pngPath = `/exports/${cardId}.png`;
              const manifestPath = `/exports/${cardId}.json`;
              this.imagePaths.set(cardId, pngPath);

              this.manifest.entries = [
                ...this.manifest.entries.filter((entry) => entry.cardId !== cardId),
                {
                  cardId,
                  templateVersion: template.version,
                  cardVersion: card.version,
                  artVersion: 1,
                  pngPath
                }
              ];
              this.manifest.generatedAt = this.now();

              job.outputs.push({
                cardId,
                pngPath,
                manifestPath
              });

              void payload;
            }

            job.status = "succeeded";
            job.completedAt = this.now();
            this.jobs.set(jobId, job);
            return job;
          } catch (error) {
            job.status = "failed";
            job.error = error instanceof Error ? error.message : String(error);
            job.completedAt = this.now();
            this.jobs.set(jobId, job);
            return job;
          }
        },

        getJob: (jobId) => this.jobs.get(jobId) ?? null
      },

      exports: {
        getManifest: () => this.manifest,
        downloadPng: (cardId) => {
          const path = this.imagePaths.get(cardId);
          if (!path) return null;
          return { cardId, path };
        }
      }
    };
  }
}

const store = new InMemoryStore();
export const convexLikeApi = store.api();
