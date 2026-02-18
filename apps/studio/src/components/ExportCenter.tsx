import { useState } from "react";
import { convexLikeApi } from "@gambit/convex-api";

export function ExportCenter() {
  const [lastJobId, setLastJobId] = useState<string | null>(null);

  const cards = convexLikeApi.cards.list();
  const manifest = convexLikeApi.exports.getManifest();
  const lastJob = lastJobId ? convexLikeApi.render.getJob(lastJobId) : null;

  const runBatchExport = () => {
    const job = convexLikeApi.render.enqueueBatch(cards.map((record) => record.value.cardId));
    setLastJobId(job.jobId);
  };

  return (
    <section className="panel">
      <h2>Export Center</h2>
      <p>Generate deterministic PNG + JSON manifest entries from current card/template versions.</p>
      <button className="primary" onClick={runBatchExport}>
        Export All Cards
      </button>

      {lastJob && (
        <div style={{ marginTop: 8 }}>
          <span className="badge">Job: {lastJob.jobId}</span>
          <span className="badge">Status: {lastJob.status}</span>
          <span className="badge">Outputs: {lastJob.outputs.length}</span>
        </div>
      )}

      <table className="table" style={{ marginTop: 8 }}>
        <thead>
          <tr>
            <th>Card</th>
            <th>Template Version</th>
            <th>Card Version</th>
            <th>Art Version</th>
            <th>PNG Path</th>
          </tr>
        </thead>
        <tbody>
          {manifest.entries.map((entry) => (
            <tr key={entry.cardId}>
              <td>{entry.cardId}</td>
              <td>{entry.templateVersion}</td>
              <td>{entry.cardVersion}</td>
              <td>{entry.artVersion}</td>
              <td>{entry.pngPath}</td>
            </tr>
          ))}
          {manifest.entries.length === 0 && (
            <tr>
              <td colSpan={5}>No exports yet.</td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  );
}
