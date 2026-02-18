#!/usr/bin/env bash
set -euo pipefail

bun run --cwd packages/template-schema test
bun run --cwd packages/effect-engine test
bun run --cwd packages/csv-pipeline test
bun run --cwd packages/card-renderer test
bun run --cwd packages/convex-api test
