import Ajv from "ajv";
import type { ErrorObject, ValidateFunction } from "ajv";
import {
  CARD_DEFINITION_SCHEMA,
  CARD_TEMPLATE_MANIFEST_SCHEMA
} from "./schemas";
import type {
  CardDefinition,
  CardTemplateManifest,
  ValidationIssue,
  ValidationResult
} from "./types";

const ajv = new Ajv({ allErrors: true, strict: false });

const templateValidator = ajv.compile(CARD_TEMPLATE_MANIFEST_SCHEMA);
const cardValidator = ajv.compile(CARD_DEFINITION_SCHEMA);

function toIssues(errors: ErrorObject[] | null | undefined): ValidationIssue[] {
  if (!errors) return [];
  return errors.map((error) => ({
    path: error.instancePath || "/",
    message: error.message || "validation error"
  }));
}

function runValidator<T>(validator: ValidateFunction, input: unknown): ValidationResult<T> {
  const ok = validator(input) as boolean;
  return {
    ok,
    value: ok ? (input as T) : undefined,
    issues: toIssues(validator.errors)
  };
}

export function validateTemplateManifest(input: unknown): ValidationResult<CardTemplateManifest> {
  const result = runValidator<CardTemplateManifest>(templateValidator, input);
  if (!result.ok) return result;

  const seen = new Set<string>();
  for (const region of result.value!.dynamicRegions) {
    if (seen.has(region.regionId)) {
      return {
        ok: false,
        issues: [{ path: `/dynamicRegions/${region.regionId}`, message: "duplicate regionId" }]
      };
    }
    seen.add(region.regionId);
  }

  return result;
}

export function validateCardDefinition(input: unknown): ValidationResult<CardDefinition> {
  const result = runValidator<CardDefinition>(cardValidator, input);
  if (!result.ok) return result;

  const type = result.value!.type;
  const stats = result.value!.baseStats;

  if (type === "unit" && (stats.attack === undefined || stats.health === undefined)) {
    return {
      ok: false,
      issues: [{ path: "/baseStats", message: "unit cards require attack and health" }]
    };
  }

  if (type === "spell" && (stats.attack !== undefined || stats.health !== undefined)) {
    return {
      ok: false,
      issues: [{ path: "/baseStats", message: "spell cards cannot define attack/health" }]
    };
  }

  return result;
}
