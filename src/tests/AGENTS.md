# Tests

## Overview

Cross module tests that boot the real API in memory. `integration/` holds a reusable harness, a set of drivers that wrap endpoint calls, and MSTest suites. `acceptance/` runs Gherkin scenarios through Reqnroll on the same harness and drivers. Unit tests sit next to their code instead (`Modules.<M>.Tests`, `Starlights.Platform.Tests`, the source generator tests).

## Key files

| File | Owns |
|---|---|
| `integration/Starlights.Integration.Harness/IntegrationHostBuilder.cs` | Builds a `WebApplicationFactory<Program>` in the `Integration` environment, registers drivers and event observers |
| `integration/Starlights.Integration.Harness/IntegrationTestBase.cs` | Base class for MSTest suites |
| `integration/Starlights.Integration.Harness/Eventing/` | Event observers reached through `host.Events`, used to await outbox events; `IntegrationEventHandler.cs` lists which events can be observed |
| `integration/Starlights.Integration.Harness.Drivers*/` | Shared drivers and driver contexts per module |
| `integration/Starlights.Integration.Tests/Drivers/` | Drivers used only by the MSTest suites |
| `acceptance/.../Features/` | `.feature` files, grouped as `CharacterBuilder/` and `ContentManagement/` |
| `acceptance/.../Hooks/IntegrationHostBuilderHooks.cs` | Builds one host per scenario and puts it in the Reqnroll container |

## Commands

```bash
dotnet test --project src/tests/integration/Starlights.Integration.Tests
dotnet test --project src/tests/acceptance/Starlights.Integration.Acceptance.Tests
```

## Conventions

- Tests never call `HttpClient` directly. Add or extend a driver (a class implementing the `IDriver` marker); drivers are registered automatically from the driver assemblies.
- A suite builds its host in `[TestInitialize]` with `IntegrationHost.CreateDefaultBuilder(this).Build()`, gets drivers with `GetDriver<T>()`, then seeds with `InitializeElements()` before acting.
- Mark each async test with `[Timeout(TestConstants.Timeout, CooperativeCancellation = true)]`.
- Step definitions stay thin and call drivers; generated step skeletons use the async regex attribute style (`reqnroll.json`).

## Gotchas

- Each host gets its own EF InMemory database, named from a unique integration id, so tests are isolated but never touch SQL Server. Nothing here needs Docker.
- Domain event handlers run from a background poller. Assert on their effects only after waiting on the event, never right after the request.
- You can only wait on an event that has a `HandleAsync` overload in `IntegrationEventHandler.cs`. When you add a new domain event you want to observe, add it there too.
- `appsettings.Integration.json` in the application project controls log levels while tests run.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
