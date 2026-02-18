import { renderCardToPng } from "./renderer";

declare const Bun: {
  serve: (options: {
    port: number;
    fetch: (request: Request) => Promise<Response> | Response;
  }) => { port: number };
};

const port = Number(process.env.PORT ?? 8788);

const server = Bun.serve({
  port,
  async fetch(request) {
    if (request.method === "GET" && new URL(request.url).pathname === "/health") {
      return Response.json({ ok: true, service: "render-worker" });
    }

    if (request.method === "POST" && new URL(request.url).pathname === "/render") {
      try {
        const payload = await request.json();
        const result = await renderCardToPng(payload);
        return Response.json({ ok: true, result });
      } catch (error) {
        return Response.json(
          { ok: false, error: error instanceof Error ? error.message : String(error) },
          { status: 400 }
        );
      }
    }

    return new Response("Not Found", { status: 404 });
  }
});

console.log(`render-worker listening on http://localhost:${server.port}`);
