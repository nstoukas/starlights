# builder-app

## Overview

The main character builder. Aspire runs it as `app-character-builder` (and again behind the dev tunnel). Pages live in `src/pages/`, grouped by feature.

## Stack

- React 19, React Router 7, TanStack Query, React Hook Form + Zod, Tailwind 4, Vite 8, TypeScript 7
- Tests: Vitest 5 with jsdom and Testing Library; Playwright for browser tests
- Uses `@starlights/api-client`, `@starlights/ui-framework`, and the legacy `@starlights/ui` (through Vite aliases)

## Commands

```bash
# from src/frontend
npm run dev -w apps/builder-app
npm run build -w apps/builder-app
npm run lint -w apps/builder-app
npm test -w apps/builder-app           # Vitest + Testing Library in jsdom
npm run test:e2e -w apps/builder-app   # Playwright; starts its own Vite server, no backend needed
```

## Testing

- Unit and component tests sit beside the source as `*.test.ts(x)`. They fake the network with `stubApi` from `src/test/api-stub.ts` (routes keyed by `"METHOD /api/path"`), so the real hooks and `@starlights/api-client` run untouched.
- `tsc -b` type checks the tests too, because `tsconfig.app.json` includes all of `src`.
- Browser tests live in `e2e/`. They stub the API with `page.route`, matching on paths that start with `/api/`, since Vite also serves source modules under `/src/lib/api/...`.
- Playwright uses the installed Google Chrome (`channel: "chrome"`) instead of a downloaded browser. On a machine without Chrome, run `npx playwright install chrome`.
- Playwright writes `test-results/`, which is not in `.gitignore` yet.

## Printing

- Print layout uses Tailwind `print:` variants. Mark screen only UI (navigation, edit buttons, command panels) with `print:hidden`.
- `src/index.css` switches the dark theme tokens to light ones under `@media print`, so dark mode still prints on white paper.

Shared frontend conventions live in [src/frontend/AGENTS.md](../../AGENTS.md). Run `/audit src/frontend/apps/builder-app` for a deeper scan of this workspace.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
