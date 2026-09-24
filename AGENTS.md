# Starlights

An online toolset for tabletop role playing games, starting with a D&D character builder (the web successor to Aurora). A .NET modular monolith with a React frontend, run locally through .NET Aspire.

## Stack

- **Language / Runtime**: C# on .NET 10 (`global.json` pins SDK 10.0.100); TypeScript 7 on Node 20.19+ (CI uses 22.19)
- **Framework**: ASP.NET Core with FastEndpoints, EF Core 10 on SQL Server, .NET Aspire 13 for local orchestration; React 19 with Vite 8 and Tailwind 4
- **Key dependencies**: Serilog + OpenTelemetry, Scalar (API docs), MSTest 4 on Microsoft.Testing.Platform, AwesomeAssertions, Moq, Reqnroll; TanStack Query, React Hook Form + Zod
- **Package manager**: NuGet with central versions in `Directory.Packages.props`; npm workspaces in `src/frontend`

## Build approach

Tracer Bullet: each feature is a thin but real slice through every layer (database, domain, API endpoint, and screen). Source: `docs/scope/index.md`.

## Commands

```bash
dotnet restore && (cd src/frontend && npm ci)       # install
aspire run            # dev: SQL Server container, migrations, API, four frontend apps (needs Docker)
dotnet build --configuration Release && (cd src/frontend && npm run build)   # build, as CI does
dotnet test           # test; no Docker needed, integration tests use EF InMemory
(cd src/frontend && npm test -w apps/builder-app)   # frontend tests (Vitest); npm run test:e2e -w apps/builder-app for Playwright
```

After the first `aspire run`, you can seed sample data with the **Initialize Database** command on the `backend` resource in the Aspire dashboard.

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`.

## Rules

- Keep each business capability inside its module under `src/modules/<name>`. Modules talk to each other only through another module's `Integration.Abstractions` project, never through its Domain or Data projects.
- Add NuGet versions only in `Directory.Packages.props`; `.csproj` files carry `PackageReference` without a version.
- `.editorconfig` fails the build on block namespaces (use file scoped) and on private fields without a `_` prefix. Nullable and implicit usings are on everywhere.
- Prefer explicit constructors with `private readonly` fields over primary constructors, and block bodied methods over expression bodied ones.
- Put `/// <summary>` XML docs on public types and members; domain code follows this closely.
- Aggregates expose `IReadOnlyCollection<T>` over a private list and are created through static `Create` factories or builders, never public constructors.
- Tests: MSTest `[TestClass]` / `[TestMethod]`, names like `Method_Condition_Result`, `// Arrange // Act // Assert` blocks, AwesomeAssertions `.Should()` with a reason string.
- Commit messages use a conventional prefix, mostly `feat:`, `refactor:`, `chore:`, `build:`, `fix:`, `ci:`, `docs:`.

## Agent skills

- [aspire](.claude/skills/aspire/): `microsoft/aspire-skills`, AppHost, Aspire CLI, resources, logs and traces
- [configuring-opentelemetry-dotnet](.claude/skills/configuring-opentelemetry-dotnet/): `dotnet/skills`, tracing, metrics, OTLP setup

MCP servers: aspire (connected), microsoft-learn (connected), shadcn (connected); all local scope, so each developer adds their own.

## Context files

- [src/modules/AGENTS.md](src/modules/AGENTS.md): module layout, endpoints, persistence, domain events, migrations
- [src/platform/AGENTS.md](src/platform/AGENTS.md): platform components, hosting pipeline, base domain types, the `[Entity]` ID generator
- [src/tests/AGENTS.md](src/tests/AGENTS.md): integration harness with drivers, and Reqnroll acceptance tests
- [src/frontend/AGENTS.md](src/frontend/AGENTS.md): npm workspace, shared packages, build order, API wiring

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
