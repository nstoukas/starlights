# Frontend

## Overview

An npm workspace with four Vite + React 19 apps and three shared packages. The builder app is the main product (the character builder). The landing page and content manager are placeholders for now, and the showcase is a gallery for the component library. Aspire starts all four apps as dev servers and passes each one the backend URL.

## Key files

| File | Owns |
|---|---|
| `package.json` | Workspace list and the cross workspace scripts |
| `package-lock.json` | The one tracked lockfile for every workspace |
| `packages/ui-framework/` | The current shared component library (shadcn on Base UI, Tailwind 4) |
| `packages/api-client/` | Typed fetch client plus TanStack Query keys and options per backend domain |
| `packages/ui/` | Legacy Radix component library, pending removal; only builder-app still uses it |

## Commands

```bash
npm ci                     # install every workspace
npm run dev                # builder-app; also: content, landing, showcase
npm run build:packages     # api-client and ui-framework, needed before app builds
npm run build              # packages, then every app (what CI runs)
npm run lint               # lints builder-app only
npm run <script> -w <workspace path>   # run any script in one workspace
```

## Conventions

- Build new UI from `ui-framework`, not `packages/ui`. Add shadcn components into `packages/ui-framework` so every app can share them.
- Every backend call goes through `@starlights/api-client`: add the fetch function, query keys, and query options under `src/domains/<domain>/`, then export them from `src/index.ts`.
- Within an app, import local code through the `@/` alias.
- Tailwind 4 is configured through the Vite plugin; there is no `tailwind.config.js`.

## Gotchas

- `api-client` and `ui-framework` resolve to their `dist/` output. After you change a package, run `npm run build:packages` or the apps won't see the change (and CI's `tsc -b` fails on missing types).
- builder-app reads `packages/ui` straight from source through aliases in its `vite.config.ts`, which is why `packages/ui` is never built.
- API URLs come from Aspire's `services__backend__https__0` environment variable, or from `VITE_API_BASE` when you run an app outside Aspire.
- Prettier is set up in `ui-framework`, `content-manager`, `landing-page`, and `showcase`, but not in builder-app.

## Agent skills

- [shadcn](../../.claude/skills/shadcn/): `shadcn-ui/ui`, adding and composing shadcn components in `ui-framework`
- [tanstack-query](../../.claude/skills/tanstack-query/): `tanstack-skills/tanstack-skills`, query keys, options, and caching as used by `api-client`
- [tailwind-4-docs](../../.claude/skills/tailwind-4-docs/): `lombiq/tailwind-agent-skills`, Tailwind v4 utilities and config (v4 differs a lot from v3)
- [vercel-react-best-practices](../../.claude/skills/vercel-react-best-practices/): `vercel-labs/agent-skills`, React component and performance guidance
- [vitest](../../.agents/skills/vitest/): `antfu/skills`, Vitest APIs, mocking, fixtures, filtering and coverage (builder-app unit and component tests)
- [webapp-testing](../../.agents/skills/webapp-testing/): `anthropics/skills`, testing the running app with Playwright: screenshots, logs, UI debugging
- Declined: Playwright MCP server (Claude in Chrome covers live browser work)

## Workspaces

- [apps/builder-app/AGENTS.md](apps/builder-app/AGENTS.md)
- [apps/content-manager/AGENTS.md](apps/content-manager/AGENTS.md)
- [apps/landing-page/AGENTS.md](apps/landing-page/AGENTS.md)
- [apps/showcase/AGENTS.md](apps/showcase/AGENTS.md)
- [packages/api-client/AGENTS.md](packages/api-client/AGENTS.md)
- [packages/ui-framework/AGENTS.md](packages/ui-framework/AGENTS.md)
- [packages/ui/AGENTS.md](packages/ui/AGENTS.md)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
