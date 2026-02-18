import type {
  CardRuntimeState,
  Condition,
  EffectAction,
  EffectSpec,
  GameEvent,
  Modifier,
  SimulationResult
} from "./types";

function getPathValue(payload: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, payload);
}

function evaluateCondition(payload: Record<string, unknown>, condition: Condition): boolean {
  const actual = getPathValue(payload, condition.path);
  switch (condition.op) {
    case "eq":
      return actual === condition.value;
    case "neq":
      return actual !== condition.value;
    case "gt":
      return Number(actual) > Number(condition.value);
    case "gte":
      return Number(actual) >= Number(condition.value);
    case "lt":
      return Number(actual) < Number(condition.value);
    case "lte":
      return Number(actual) <= Number(condition.value);
    default:
      return false;
  }
}

function shouldRun(
  event: GameEvent,
  when: Condition[] | undefined
): boolean {
  if (!when || when.length === 0) return true;
  return when.every((condition) => evaluateCondition(event.payload, condition));
}

function applyAction(
  state: CardRuntimeState,
  effectId: string,
  action: EffectAction,
  sequence: number
): CardRuntimeState {
  switch (action.type) {
    case "ADD_MODIFIER": {
      const modifier: Modifier = {
        id: `${effectId}:${sequence}:${action.stat}:${action.value}`,
        sourceEffectId: effectId,
        stat: action.stat,
        value: action.value,
        duration: action.duration
      };
      return {
        ...state,
        modifiers: [...state.modifiers, modifier]
      };
    }

    case "SET_STAT": {
      return {
        ...state,
        derivedStats: {
          ...state.derivedStats,
          [action.stat]: action.value
        }
      };
    }

    case "ADD_BADGE": {
      if (state.badges.includes(action.badge)) return state;
      return {
        ...state,
        badges: [...state.badges, action.badge]
      };
    }

    case "REMOVE_BADGE": {
      return {
        ...state,
        badges: state.badges.filter((badge) => badge !== action.badge)
      };
    }

    default:
      return state;
  }
}

export function recomputeDerivedStats(state: CardRuntimeState): CardRuntimeState {
  const baseAttack = state.baseStats.attack ?? 0;
  const baseHealth = state.baseStats.health ?? 0;
  const baseCost = state.baseStats.cost ?? 0;

  const attackMod = state.modifiers.filter((m) => m.stat === "attack").reduce((sum, m) => sum + m.value, 0);
  const healthMod = state.modifiers.filter((m) => m.stat === "health").reduce((sum, m) => sum + m.value, 0);
  const costMod = state.modifiers.filter((m) => m.stat === "cost").reduce((sum, m) => sum + m.value, 0);

  return {
    ...state,
    derivedStats: {
      ...state.derivedStats,
      attack: Math.max(0, baseAttack + attackMod),
      health: Math.max(0, baseHealth + healthMod),
      cost: Math.max(0, baseCost + costMod)
    }
  };
}

function expireTurnModifiers(state: CardRuntimeState): CardRuntimeState {
  return {
    ...state,
    modifiers: state.modifiers.filter((m) => m.duration !== "turn")
  };
}

export function applyEvent(
  current: CardRuntimeState,
  effects: EffectSpec[],
  event: GameEvent
): SimulationResult {
  const ordered = [...effects].sort((a, b) => a.effectId.localeCompare(b.effectId));
  let next = current;
  const appliedEffects: string[] = [];
  let sequence = 0;

  if (event.event === "TURN_END") {
    next = expireTurnModifiers(next);
  }

  for (const effect of ordered) {
    const matching = effect.triggers.filter((trigger) => trigger.on === event.event);
    if (matching.length === 0) continue;

    for (const trigger of matching) {
      if (!shouldRun(event, trigger.when)) continue;

      for (const action of trigger.do) {
        sequence += 1;
        next = applyAction(next, effect.effectId, action, sequence);
      }
      appliedEffects.push(effect.effectId);
    }
  }

  next = recomputeDerivedStats(next);

  return {
    next,
    appliedEffects
  };
}

export function createInitialRuntimeState(input: {
  cardId: string;
  baseStats: { cost?: number; attack?: number; health?: number };
}): CardRuntimeState {
  const base = {
    cost: input.baseStats.cost ?? 0,
    attack: input.baseStats.attack ?? 0,
    health: input.baseStats.health ?? 0
  };

  return {
    cardId: input.cardId,
    baseStats: base,
    modifiers: [],
    derivedStats: { ...base },
    badges: []
  };
}
