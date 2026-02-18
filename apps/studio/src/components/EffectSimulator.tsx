import { useMemo, useState } from "react";
import { convexLikeApi } from "@gambit/convex-api";
import type { TriggerEvent } from "@gambit/effect-engine";

const PRESET_EVENTS: TriggerEvent[] = [
  "TURN_START",
  "TURN_END",
  "CARD_PLAYED",
  "DAMAGE_TAKEN",
  "AURA_APPLIED",
  "AURA_REMOVED"
];

export function EffectSimulator() {
  const cards = convexLikeApi.cards.list();
  const [cardId, setCardId] = useState(cards[0]?.value.cardId ?? "");
  const [event, setEvent] = useState<TriggerEvent>("TURN_START");
  const [timeline, setTimeline] = useState<Array<{ event: TriggerEvent; attack: number; health: number; cost: number }>>([]);

  const projection = useMemo(() => convexLikeApi.runtime.getProjectedCard(cardId), [cardId, timeline.length]);

  const fireEvent = () => {
    const next = convexLikeApi.runtime.applyEvent(cardId, {
      event,
      at: Date.now(),
      payload: { damage: 3 }
    });

    setTimeline((prev) => [
      {
        event,
        attack: next.state.derivedStats.attack ?? 0,
        health: next.state.derivedStats.health ?? 0,
        cost: next.state.derivedStats.cost ?? 0
      },
      ...prev
    ]);
  };

  return (
    <section className="panel">
      <h2>Effect Simulator</h2>
      <div className="grid-3">
        <label>
          Card
          <select value={cardId} onChange={(event) => setCardId(event.target.value)}>
            {cards.map((record) => (
              <option key={record.value.cardId} value={record.value.cardId}>
                {record.value.name}
              </option>
            ))}
          </select>
        </label>

        <label>
          Event
          <select value={event} onChange={(event) => setEvent(event.target.value as TriggerEvent)}>
            {PRESET_EVENTS.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "flex", alignItems: "end" }}>
          <button className="primary" onClick={fireEvent}>
            Apply Event
          </button>
        </div>
      </div>

      <div style={{ marginTop: 8 }}>
        <span className="badge">ATK: {projection?.state.derivedStats.attack ?? 0}</span>
        <span className="badge">HP: {projection?.state.derivedStats.health ?? 0}</span>
        <span className="badge">COST: {projection?.state.derivedStats.cost ?? 0}</span>
        {(projection?.state.badges ?? []).map((badge) => (
          <span className="badge" key={badge}>
            {badge}
          </span>
        ))}
      </div>

      <table className="table" style={{ marginTop: 8 }}>
        <thead>
          <tr>
            <th>Event</th>
            <th>ATK</th>
            <th>HP</th>
            <th>COST</th>
          </tr>
        </thead>
        <tbody>
          {timeline.map((entry, index) => (
            <tr key={`${entry.event}-${index}`}>
              <td>{entry.event}</td>
              <td>{entry.attack}</td>
              <td>{entry.health}</td>
              <td>{entry.cost}</td>
            </tr>
          ))}
          {timeline.length === 0 && (
            <tr>
              <td colSpan={4}>No events fired yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
