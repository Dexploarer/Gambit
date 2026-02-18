#!/usr/bin/env bash
set -euo pipefail

bun run --cwd packages/template-schema typecheck
bun run --cwd packages/effect-engine typecheck
bun run --cwd packages/csv-pipeline typecheck
bun run --cwd packages/card-renderer typecheck
bun run --cwd packages/convex-api typecheck
bun run --cwd apps/studio typecheck
bun run --cwd apps/render-worker typecheck
