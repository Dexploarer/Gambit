import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { chromium } from "playwright";
import type { CardRuntimeState } from "@gambit/effect-engine";
import type { CardDefinition, CardTemplateManifest } from "@gambit/template-schema";
import { toDrawCardPayload } from "@gambit/card-renderer";

export interface RenderRequest {
  card: CardDefinition;
  template: CardTemplateManifest;
  runtime: CardRuntimeState;
  outputDir?: string;
}

export interface RenderResult {
  cardId: string;
  pngPath: string;
  manifestPath: string;
}

function escapeHtml(input: string): string {
  return input
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function buildHtml(payload: ReturnType<typeof toDrawCardPayload>): string {
  const stats = payload.stats.map((stat) => `<li><strong>${escapeHtml(stat.key)}</strong>: ${stat.value}</li>`).join("");
  return `<!doctype html>
<html>
  <body style="margin:0; width:744px; height:1039px; font-family: 'IBM Plex Sans', Arial, sans-serif; background: #f2eadf; position: relative; border: 12px solid #161616; box-sizing:border-box;">
    <div style="position:absolute; inset:0; background: radial-gradient(circle at top left, #fff8eb, #e8dfcf);"></div>
    <div style="position:absolute; top:24px; left:24px; right:24px; bottom:24px; border: 4px solid #1f1f1f; background: rgba(255,255,255,0.85);"></div>
    <h1 style="position:absolute; top:44px; left:48px; right:48px; margin:0; font-size:46px; line-height:1.1; letter-spacing:1px; color:#151515; text-transform:uppercase;">${escapeHtml(payload.title)}</h1>
    <div style="position:absolute; top:140px; left:52px; right:52px; height:420px; border:3px solid #2a2a2a; background: linear-gradient(135deg, #c8b59f, #f5ede3);"></div>
    <p style="position:absolute; left:52px; right:52px; top:590px; bottom:220px; margin:0; font-size:26px; color:#121212; white-space:pre-wrap;">${escapeHtml(payload.body)}</p>
    <ul style="position:absolute; left:52px; right:52px; bottom:52px; display:flex; justify-content:space-between; list-style:none; padding:0; margin:0; font-size:28px; color:#121212;">${stats}</ul>
  </body>
</html>`;
}

export async function renderCardToPng(request: RenderRequest): Promise<RenderResult> {
  const payload = toDrawCardPayload(request.template, request.card, request.runtime);
  const html = buildHtml(payload);

  const outputDir = request.outputDir ?? resolve(process.cwd(), ".generated/exports");
  await mkdir(outputDir, { recursive: true });

  const pngPath = resolve(outputDir, `${request.card.cardId}.png`);
  const manifestPath = resolve(outputDir, `${request.card.cardId}.json`);

  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 744, height: 1039 } });
    await page.setContent(html, { waitUntil: "domcontentloaded" });
    await page.screenshot({ path: pngPath, type: "png" });
  } finally {
    await browser.close();
  }

  const manifest = {
    cardId: request.card.cardId,
    generatedAt: new Date().toISOString(),
    templateId: request.template.templateId,
    variant: request.card.variant,
    overlays: payload.overlays.map((overlay) => overlay.id)
  };

  await mkdir(dirname(manifestPath), { recursive: true });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

  return {
    cardId: request.card.cardId,
    pngPath,
    manifestPath
  };
}
