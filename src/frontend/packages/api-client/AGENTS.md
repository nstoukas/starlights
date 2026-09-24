# @starlights/api-client

## Overview

Typed HTTP client for the Starlights API. Each backend domain has `endpoints.ts`, `query-keys.ts`, `query-options.ts`, and `types.ts` under `src/domains/<domain>/`, all exported from `src/index.ts`.

## Stack

- TypeScript 7, Vite 8 library build, TanStack Query options
- Consumers import the built `dist/` output

## Commands

```bash
# from src/frontend
npm run build -w packages/api-client
```

Shared frontend conventions live in [src/frontend/AGENTS.md](../../AGENTS.md). Run `/audit src/frontend/packages/api-client` for a deeper scan of this workspace.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
