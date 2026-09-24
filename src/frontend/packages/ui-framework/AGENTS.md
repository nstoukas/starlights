# ui-framework

## Overview

The current shared component library for every app: shadcn components (style `base-rhea`, on Base UI) plus a theme provider. Apps depend on it as `ui-framework` (builder-app as `@starlights/ui-framework`).

## Stack

- React 19 (peer), Base UI, shadcn, Tailwind 4, Recharts, cmdk, Prettier
- Exports `.`, `./theme-provider`, `./utils`, `./<component>`, and `./styles.css` from `dist/`

## Commands

```bash
# from src/frontend
npm run build -w packages/ui-framework
npm run typecheck -w packages/ui-framework
npm run format -w packages/ui-framework
```

Shared frontend conventions live in [src/frontend/AGENTS.md](../../AGENTS.md). Run `/audit src/frontend/packages/ui-framework` for a deeper scan of this workspace.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
