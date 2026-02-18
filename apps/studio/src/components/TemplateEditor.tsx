import { useMemo, useState } from "react";
import { convexLikeApi } from "@gambit/convex-api";

export function TemplateEditor() {
  const templates = convexLikeApi.templates.list();
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.value.templateId ?? "");
  const [snapGrid, setSnapGrid] = useState(true);
  const [boundsLock, setBoundsLock] = useState(true);

  const selected = useMemo(
    () => templates.find((record) => record.value.templateId === selectedId) ?? templates[0],
    [templates, selectedId]
  );

  if (!selected) return <section className="panel">No templates yet.</section>;

  const addRegion = () => {
    const next = {
      ...selected.value,
      dynamicRegions: [
        ...selected.value.dynamicRegions,
        {
          regionId: `region-${selected.value.dynamicRegions.length + 1}`,
          kind: "text" as const,
          bindKey: "card.rulesText",
          rect: { x: 0.2, y: 0.65, w: 0.6, h: 0.2 },
          autoFit: true,
          zIndex: 20
        }
      ]
    };
    convexLikeApi.templates.update(selected.value.templateId, next);
    setSelectedId(next.templateId);
  };

  return (
    <section className="panel">
      <h2>Template Editor</h2>
      <p>Drag/resize scaffolding is represented by editable normalized region coordinates in this vertical slice.</p>

      <div className="grid-3">
        <label>
          Template
          <select value={selected.value.templateId} onChange={(event) => setSelectedId(event.target.value)}>
            {templates.map((record) => (
              <option key={record.value.templateId} value={record.value.templateId}>
                {record.value.templateId}
              </option>
            ))}
          </select>
        </label>

        <label>
          Snap Grid
          <select value={String(snapGrid)} onChange={(event) => setSnapGrid(event.target.value === "true")}>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </label>

        <label>
          Bounds Lock
          <select value={String(boundsLock)} onChange={(event) => setBoundsLock(event.target.value === "true")}>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>
        </label>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={addRegion}>Add Dynamic Region</button>
      </div>

      <table className="table" style={{ marginTop: 12 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Kind</th>
            <th>Bind Key</th>
            <th>Rect (x/y/w/h)</th>
            <th>Z</th>
          </tr>
        </thead>
        <tbody>
          {selected.value.dynamicRegions.map((region) => (
            <tr key={region.regionId}>
              <td>{region.regionId}</td>
              <td>{region.kind}</td>
              <td>{region.bindKey}</td>
              <td>
                {region.rect.x.toFixed(2)} / {region.rect.y.toFixed(2)} / {region.rect.w.toFixed(2)} / {region.rect.h.toFixed(2)}
              </td>
              <td>{region.zIndex}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
