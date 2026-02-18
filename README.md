# Gambit Premier TCG Generator

A from-scratch vertical slice for a high-fidelity trading card generator:
- template-driven card rendering
- event-driven dynamic stat updates
- CSV import with validation and diff preview
- Convex-shaped API surface
- deterministic PNG + JSON manifest export

## Workspace Layout

- `apps/studio` - Browser editor and simulator UI
- `apps/render-worker` - Headless export worker API
- `packages/template-schema` - Shared template/card schema + validation
- `packages/effect-engine` - Declarative DSL and runtime projection
- `packages/csv-pipeline` - CSV parse/validate/diff pipeline
- `packages/card-renderer` - Render model binding + preview composition
- `convex` - Convex API contracts and in-memory implementation for dev/tests

## Quick Start

```bash
bun install
bun run test
bun run studio:dev
```

## Logo Asset

Brand logo is copied from:
- `apps/web/public/lunchtable/logo.png`

into:
- `apps/studio/public/brand/logo.png`
