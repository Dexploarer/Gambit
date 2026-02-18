export type TriggerEvent =
  | "TURN_START"
  | "TURN_END"
  | "CARD_PLAYED"
  | "DAMAGE_TAKEN"
  | "AURA_APPLIED"
  | "AURA_REMOVED";

export type StatKey = "attack" | "health" | "cost";

export interface Modifier {
  id: string;
  sourceEffectId: string;
  stat: StatKey;
  value: number;
  duration: "turn" | "permanent";
}

export interface Condition {
  path: string;
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte";
  value: string | number | boolean;
}

export type EffectAction =
  | { type: "ADD_MODIFIER"; stat: StatKey; value: number; duration: "turn" | "permanent" }
  | { type: "SET_STAT"; stat: StatKey; value: number }
  | { type: "ADD_BADGE"; badge: string }
  | { type: "REMOVE_BADGE"; badge: string };

export interface EffectTrigger {
  on: TriggerEvent;
  when?: Condition[];
  do: EffectAction[];
}

export interface EffectSpec {
  effectId: string;
  triggers: EffectTrigger[];
}

export interface GameEvent {
  event: TriggerEvent;
  at: number;
  payload: Record<string, unknown>;
}

export interface CardRuntimeState {
  cardId: string;
  baseStats: Record<string, number>;
  modifiers: Modifier[];
  derivedStats: Record<string, number>;
  badges: string[];
}

export interface SimulationResult {
  next: CardRuntimeState;
  appliedEffects: string[];
}
