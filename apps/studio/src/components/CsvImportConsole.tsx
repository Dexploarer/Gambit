import { useState } from "react";
import { convexLikeApi } from "@gambit/convex-api";

const DEFAULT_CSV = [
  "card_id,name,type,template_id,variant,rarity,art_asset_id,rules_text,flavor_text,locale,cost,attack,health,effect_id",
  "hall-monitor,Hall Monitor,unit,unit-base-v1,base,common,art-hall,When this unit enters, gain +1 attack this turn.,No running in the corridor.,en-US,1,1,2,boost-on-start"
].join("\n");

export function CsvImportConsole() {
  const [csv, setCsv] = useState(DEFAULT_CSV);
  const [result, setResult] = useState<ReturnType<typeof convexLikeApi.imports.validateCsv> | null>(null);

  const validate = () => setResult(convexLikeApi.imports.validateCsv(csv));
  const apply = () => {
    const applied = convexLikeApi.imports.applyCsv(csv);
    setResult({
      ok: !applied.importRecord.issues.some((issue) => issue.severity === "error"),
      fileHash: applied.importRecord.fileHash,
      rows: applied.importRecord.rowCount,
      issues: applied.importRecord.issues,
      normalizedCards: applied.upserted.map((record) => record.value)
    });
  };

  return (
    <section className="panel">
      <h2>CSV Import Console</h2>
      <p>Validate, diff, and apply card updates using the v1 CSV contract.</p>
      <textarea rows={10} value={csv} onChange={(event) => setCsv(event.target.value)} />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={validate}>Validate CSV</button>
        <button className="primary" onClick={apply}>
          Apply CSV
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 12 }}>
          <div>
            <span className="badge">OK: {String(result.ok)}</span>
            <span className="badge">Rows: {result.rows}</span>
            <span className="badge">Hash: {result.fileHash.slice(0, 12)}...</span>
          </div>
          <table className="table" style={{ marginTop: 8 }}>
            <thead>
              <tr>
                <th>Severity</th>
                <th>Row</th>
                <th>Column</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {result.issues.map((issue, index) => (
                <tr key={`${issue.row}-${index}`}>
                  <td>{issue.severity}</td>
                  <td>{issue.row}</td>
                  <td>{issue.column ?? "-"}</td>
                  <td>{issue.message}</td>
                </tr>
              ))}
              {result.issues.length === 0 && (
                <tr>
                  <td colSpan={4}>No validation issues.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
