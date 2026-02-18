import { useMemo } from "react";
import { convexLikeApi } from "@gambit/convex-api";

export function CardPreview() {
  const cards = convexLikeApi.cards.list();
  const templates = convexLikeApi.templates.list();

  const firstCard = cards[0]?.value;
  const projection = firstCard ? convexLikeApi.runtime.getProjectedCard(firstCard.cardId) : null;
  const template = templates.find((record) => record.value.templateId === firstCard?.templateId)?.value;

  const overlayNames = useMemo(() => {
    if (!template || !firstCard) return [];
    return [...template.variantOverlays.base, ...template.variantOverlays[firstCard.variant]].map((overlay) => overlay.id);
  }, [template, firstCard]);

  if (!firstCard || !template || !projection) return null;

  return (
    <section className="panel">
      <h2>Live Preview</h2>
      <div className="preview-card">
        <h3>{firstCard.name}</h3>
        <p>{firstCard.rulesText}</p>
        <p style={{ fontStyle: "italic" }}>{firstCard.flavorText}</p>
        <p>
          COST {projection.state.derivedStats.cost ?? 0} | ATK {projection.state.derivedStats.attack ?? 0} | HP{" "}
          {projection.state.derivedStats.health ?? 0}
        </p>
        <p>Template: {template.templateId}</p>
        <div>
          {overlayNames.map((name) => (
            <span className="badge" key={name}>
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
