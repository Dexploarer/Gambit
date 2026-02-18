import type { DiffPreview } from "@gambit/csv-pipeline";
import type { CardRuntimeState, EffectSpec, GameEvent } from "@gambit/effect-engine";
import type { CardDefinition, CardTemplateManifest } from "@gambit/template-schema";

export interface Versioned<T> {
  value: T;
  version: number;
  updatedAt: number;
}

export interface ImportHistoryRecord {
  importId: string;
  fileHash: string;
  rowCount: number;
  issues: Array<{ row: number; column?: string; message: string; severity: "error" | "warning" }>;
  createdAt: number;
}

export interface RenderJob {
  jobId: string;
  status: "queued" | "running" | "succeeded" | "failed";
  cardIds: string[];
  createdAt: number;
  completedAt?: number;
  error?: string;
  outputs: Array<{ cardId: string; pngPath: string; manifestPath: string }>;
}

export interface ExportManifest {
  generatedAt: number;
  entries: Array<{
    cardId: string;
    templateVersion: number;
    cardVersion: number;
    artVersion: number;
    pngPath: string;
  }>;
}

export interface RuntimeProjection {
  state: CardRuntimeState;
  appliedEffects: string[];
}

export interface ConvexLikeApi {
  templates: {
    create: (manifest: CardTemplateManifest) => Versioned<CardTemplateManifest>;
    update: (templateId: string, manifest: CardTemplateManifest) => Versioned<CardTemplateManifest>;
    get: (templateId: string) => Versioned<CardTemplateManifest> | null;
    list: () => Array<Versioned<CardTemplateManifest>>;
  };
  cards: {
    upsertBatch: (cards: CardDefinition[]) => Array<Versioned<CardDefinition>>;
    get: (cardId: string) => Versioned<CardDefinition> | null;
    list: () => Array<Versioned<CardDefinition>>;
    diffPreview: (cards: CardDefinition[]) => DiffPreview;
  };
  imports: {
    validateCsv: (csv: string) => {
      ok: boolean;
      fileHash: string;
      rows: number;
      issues: ImportHistoryRecord["issues"];
      normalizedCards: CardDefinition[];
    };
    applyCsv: (csv: string) => {
      importRecord: ImportHistoryRecord;
      upserted: Array<Versioned<CardDefinition>>;
    };
    history: () => ImportHistoryRecord[];
  };
  effects: {
    validate: (effect: EffectSpec) => { ok: boolean; issues: string[] };
    upsert: (effect: EffectSpec) => Versioned<EffectSpec>;
    simulate: (cardId: string, events: GameEvent[]) => RuntimeProjection;
  };
  runtime: {
    applyEvent: (cardId: string, event: GameEvent) => RuntimeProjection;
    getProjectedCard: (cardId: string) => RuntimeProjection | null;
  };
  render: {
    enqueueCard: (cardId: string) => RenderJob;
    enqueueBatch: (cardIds: string[]) => RenderJob;
    getJob: (jobId: string) => RenderJob | null;
  };
  exports: {
    getManifest: () => ExportManifest;
    downloadPng: (cardId: string) => { cardId: string; path: string } | null;
  };
}
