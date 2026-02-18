import { applyEvent as applyEngineEvent } from "@gambit/effect-engine";

export function applyRuntimeEvent(input: {
  currentState: any;
  effects: any[];
  event: any;
}) {
  const applied = applyEngineEvent(input.currentState, input.effects, input.event);
  return {
    state: applied.next,
    appliedEffects: applied.appliedEffects
  };
}
