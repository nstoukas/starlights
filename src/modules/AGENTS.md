# Modules

## Overview

Each business capability is a self contained module split into layered projects. Today there are two: `elements` (game content such as classes, abilities, features, and the rules that tie them together) and `characters` (character creation, registrations, and calculated statistics). Characters reads Elements data; Elements knows nothing about Characters.

## Key files

| File | Owns |
|---|---|
| `<m>/Modules.<M>.Domain/` | Aggregates, entities, components, domain events, builders |
| `<m>/Modules.<M>.Data/` | Repository interfaces (`I<M>Repository`) |
| `<m>/Modules.<M>.Data.EntityFramework/` | `DbContext`, `TypeConfiguration/`, `Migrations/`, repository classes, the EF platform component |
| `<m>/Modules.<M>.Data.EntityFramework.EventProcessing/` | Background service that dispatches stored domain events |
| `<m>/Modules.<M>.Data.EntityFramework.MigrationService/` | Worker that Aspire runs to apply migrations before the API starts |
| `<m>/Modules.<M>.Endpoints/` | FastEndpoints, one folder per operation |
| `<m>/Modules.<M>/` | Module registration (`*Module.cs`) and application services |
| `elements/Modules.Elements.Integration.Abstractions/` | The only public surface other modules may use: `IElementsModuleQueries`, `IElementsModuleInitializer` |
| `src/apps/Starlights.Application/Program.cs` | Lists each module assembly in `AdditionalAssemblies` |

## Commands

```bash
# Add a migration (you need the dotnet-ef tool; the design time factory builds the context)
dotnet ef migrations add <Name> --project src/modules/<m>/Modules.<M>.Data.EntityFramework

# Run only one module's tests
dotnet test --project src/modules/<m>/Modules.<M>.Tests
```

## Conventions

- An endpoint lives in its own folder, for example `Endpoints/Characters/CreateCharacter/`, holding `<Op>Endpoint.cs`, `<Op>Request.cs`, `<Op>Response.cs`, and `<Op>RequestValidator.cs` when the input needs checks.
- Endpoints derive from `Endpoint<TRequest, TResponse>` or `EndpointWithoutRequest<TResponse>`, set the route in `Configure()` with `Group<CharactersGroup>()` or `Group<ElementsGroup>()`, and take dependencies through a constructor into `_fields`.
- Data access goes through `IPersistence`: call `GetRepository<IXRepository>()`, make changes, then `SaveChangesAsync()`. You don't inject a `DbContext` into endpoints or services.
- Report request errors with `AddError(...)` then `await Send.ErrorsAsync(cancellation: ct)`; throw `DomainException` for broken domain invariants.
- Start an activity per endpoint with `<M>Instrumentation.StartActivity(nameof(...))` so it shows in Aspire traces.
- Aggregates derive from `AggregateRoot<TId>`. In Characters, mark the class `[Entity]` and the `<Class>Id` struct is generated for you. Elements still writes `ElementId` and `ElementComponentId` by hand; keep them that way unless you migrate both.
- Raise domain events inside the aggregate. Handlers implement `IDomainEventHandler<TEvent>` and are picked up by `AddDomainEventHandlersFrom(assembly)` in the module class.
- Both modules model optional data as components (`ElementComponentBase`, `CharacterComponentBase`) attached to the aggregate, rather than adding columns to the root.

## Gotchas

- A new module, or a new project inside one, will not load until you add its assembly to `AdditionalAssemblies` in `Program.cs`, and, for its migrations, a `WithMigrationWorker<...>()` line in `src/aspire/Starlights.AppHost/AppHost.cs`.
- Domain events are an outbox. Saving writes `EventMessage` rows, and a polling `DomainEventProcessingService` dispatches them later. Handlers run after the request returns, so don't expect their side effects in the same response.
- `RegistrationOrder` on platform components decides setup order. The Elements EF component (1010) must come before Characters (1020), and event processing (1030) after both.
- Characters migrations wait for Elements migrations in `AppHost.cs`. Keep that order if you add cross module seed data.
- `EntityFrameworkComponent` swaps to EF InMemory in the `Integration` environment, so SQL Server specific mapping (raw SQL, computed columns) is not covered by tests.
- Sample data comes from `ElementsModuleInitializer`, triggered by the `Initialization` endpoint (the **Initialize Database** command in the Aspire dashboard). If you change element shapes, update the seeder too.

## Agent skills

- [ef-core](../../.claude/skills/ef-core/): `github/awesome-copilot`, EF Core modeling, configuration, and migration practices
- [optimizing-ef-core-queries](../../.claude/skills/optimizing-ef-core-queries/): `dotnet/skills`, making slow queries lean (fewer round trips, less SQL)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
