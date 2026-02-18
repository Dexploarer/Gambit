import { useMemo, useState } from "react";
import { convexLikeApi } from "@gambit/convex-api";

export function CardCatalog() {
  const allCards = convexLikeApi.cards.list();
  const [cardId, setCardId] = useState(allCards[0]?.value.cardId ?? "");

  const selected = useMemo(
    () => allCards.find((record) => record.value.cardId === cardId)?.value ?? allCards[0]?.value,
    [allCards, cardId]
  );

  const [localName, setLocalName] = useState(selected?.name ?? "");
  const [localFlavor, setLocalFlavor] = useState(selected?.flavorText ?? "");

  if (!selected) return <section className="panel">No cards yet.</section>;

  const save = () => {
    convexLikeApi.cards.upsertBatch([
      {
        ...selected,
        name: localName,
        flavorText: localFlavor
      }
    ]);
  };

  return (
    <section className="panel">
      <h2>Card Catalog</h2>
      <div className="grid-2">
        <div>
          <table className="table">
            <thead>
              <tr>
                <th>Card</th>
                <th>Type</th>
                <th>Variant</th>
                <th>Rarity</th>
              </tr>
            </thead>
            <tbody>
              {allCards.map((record) => (
                <tr key={record.value.cardId} onClick={() => setCardId(record.value.cardId)} style={{ cursor: "pointer" }}>
                  <td>{record.value.name}</td>
                  <td>{record.value.type}</td>
                  <td>{record.value.variant}</td>
                  <td>{record.value.rarity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <label>
            Name
            <input value={localName} onChange={(event) => setLocalName(event.target.value)} />
          </label>
          <label>
            Flavor Text
            <textarea rows={5} value={localFlavor} onChange={(event) => setLocalFlavor(event.target.value)} />
          </label>
          <div style={{ marginTop: 8 }}>
            <button className="primary" onClick={save}>
              Save Card
            </button>
          </div>
          <div style={{ marginTop: 8 }}>
            <span className="badge">Stats</span>
            <span className="badge">Cost: {selected.baseStats.cost ?? 0}</span>
            <span className="badge">ATK: {selected.baseStats.attack ?? 0}</span>
            <span className="badge">HP: {selected.baseStats.health ?? 0}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
