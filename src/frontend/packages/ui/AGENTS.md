# @starlights/ui (legacy)

## Overview

The older Radix based component library, pending removal (see commit c3ef616). Only builder-app still imports it, from source through Vite aliases, so it is not part of `build:packages`. Please don't add new components here; use `ui-framework`.

## Stack

- React 19, Radix UI, shadcn (style `new-york`), Tailwind 4

## Commands

```bash
# from src/frontend
npm run lint -w packages/ui
```

Shared frontend conventions live in [src/frontend/AGENTS.md](../../AGENTS.md). Run `/audit src/frontend/packages/ui` for a deeper scan of this workspace.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
