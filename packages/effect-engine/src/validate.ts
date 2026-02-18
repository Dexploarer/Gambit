import type { EffectSpec } from "./types";

export function validateEffectSpec(spec: EffectSpec): { ok: boolean; issues: string[] } {
  const issues: string[] = [];

  if (!spec.effectId.trim()) {
    issues.push("effectId is required");
  }

  if (!Array.isArray(spec.triggers) || spec.triggers.length === 0) {
    issues.push("triggers are required");
  }

  for (const trigger of spec.triggers) {
    if (!trigger.do || trigger.do.length === 0) {
      issues.push(`trigger ${trigger.on} has no actions`);
    }
  }

  return {
    ok: issues.length === 0,
    issues
  };
}
