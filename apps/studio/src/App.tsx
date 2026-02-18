import { useMemo, useState } from "react";
import { ensureSeedData } from "./lib/seed";
import { TemplateEditor } from "./components/TemplateEditor";
import { CardCatalog } from "./components/CardCatalog";
import { CsvImportConsole } from "./components/CsvImportConsole";
import { EffectSimulator } from "./components/EffectSimulator";
import { ExportCenter } from "./components/ExportCenter";
import { CardPreview } from "./components/CardPreview";

ensureSeedData();

type View = "template" | "catalog" | "csv" | "effects" | "export";

export function App() {
  const [view, setView] = useState<View>("template");

  const content = useMemo(() => {
    switch (view) {
      case "template":
        return <TemplateEditor />;
      case "catalog":
        return <CardCatalog />;
      case "csv":
        return <CsvImportConsole />;
      case "effects":
        return <EffectSimulator />;
      case "export":
        return <ExportCenter />;
      default:
        return null;
    }
  }, [view]);

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <img src="/brand/logo.png" alt="LunchTable logo" className="logo" />
        <h1 style={{ fontSize: "1.4rem", marginBottom: 6 }}>Gambit Studio</h1>
        <p style={{ marginTop: 0, color: "#4a4138" }}>Premier TCG generator vertical slice</p>
        <div className="nav-list">
          <button className={`nav-btn ${view === "template" ? "active" : ""}`} onClick={() => setView("template")}>Template Editor</button>
          <button className={`nav-btn ${view === "catalog" ? "active" : ""}`} onClick={() => setView("catalog")}>Card Catalog</button>
          <button className={`nav-btn ${view === "csv" ? "active" : ""}`} onClick={() => setView("csv")}>CSV Import</button>
          <button className={`nav-btn ${view === "effects" ? "active" : ""}`} onClick={() => setView("effects")}>Effect Simulator</button>
          <button className={`nav-btn ${view === "export" ? "active" : ""}`} onClick={() => setView("export")}>Export Center</button>
        </div>
      </aside>

      <main className="content">
        <CardPreview />
        {content}
      </main>
    </div>
  );
}
