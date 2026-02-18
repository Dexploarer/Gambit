import { describe, expect, it } from "vitest";
import { applyEvent, createInitialRuntimeState } from "../src/engine";
import type { EffectSpec } from "../src/types";

describe("effect engine", () => {
  it("applies turn-based modifiers and expires on TURN_END", () => {
    const effects: EffectSpec[] = [
      {
        effectId: "class-monitor-aura",
        triggers: [
          {
            on: "TURN_START",
            do: [{ type: "ADD_MODIFIER", stat: "attack", value: 2, duration: "turn" }]
          }
        ]
      }
    ];

    const initial = createInitialRuntimeState({
      cardId: "unit-1",
      baseStats: { attack: 3, health: 4, cost: 2 }
    });

    const atStart = applyEvent(initial, effects, {
      event: "TURN_START",
      at: 1,
      payload: {}
    });

    expect(atStart.next.derivedStats.attack).toBe(5);

    const atEnd = applyEvent(atStart.next, effects, {
      event: "TURN_END",
      at: 2,
      payload: {}
    });

    expect(atEnd.next.derivedStats.attack).toBe(3);
  });

  it("evaluates trigger conditions against event payload", () => {
    const effects: EffectSpec[] = [
      {
        effectId: "damage-threshold",
        triggers: [
          {
            on: "DAMAGE_TAKEN",
            when: [{ path: "damage", op: "gte", value: 3 }],
            do: [{ type: "ADD_BADGE", badge: "enraged" }]
          }
        ]
      }
    ];

    const initial = createInitialRuntimeState({
      cardId: "unit-2",
      baseStats: { attack: 2, health: 2, cost: 1 }
    });

    const lowDamage = applyEvent(initial, effects, {
      event: "DAMAGE_TAKEN",
      at: 1,
      payload: { damage: 2 }
    });

    expect(lowDamage.next.badges).toEqual([]);

    const highDamage = applyEvent(lowDamage.next, effects, {
      event: "DAMAGE_TAKEN",
      at: 2,
      payload: { damage: 3 }
    });

    expect(highDamage.next.badges).toContain("enraged");
  });
});
