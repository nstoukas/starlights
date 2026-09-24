# Platform

## Overview

Shared infrastructure every module builds on: base domain types, the persistence and eventing abstractions, and a small hosting pipeline that discovers modules and components and wires them in order. Pluggable pieces (EF Core, FastEndpoints, Serilog, the event publisher) live under `components/`. The `[Entity]` ID generator in `src/source-generators` belongs to this layer too.

## Key files

| File | Owns |
|---|---|
| `Starlights.Platform/Domain/` | `AggregateRoot<TId>`, `EntityBase<TId>`, `DomainException` |
| `Starlights.Platform/Eventing/` | `IDomainEvent`, `EventBase`, `IDomainEventHandler<T>`, `IDomainEventPublisher` |
| `Starlights.Platform.Data/` | `IPersistence`, `IRepository`, persistence context abstractions |
| `Starlights.Platform.Hosting.Abstractions/` | `IPlatformModule`, `IPlatformServiceComponent`, `IPlatformApplicationComponent`, builder options |
| `Starlights.Platform.Hosting/` | `AddStarlightsPlatform()` / `UseStarlightsPlatform()`, module discovery |
| `components/*` | EF Core base component, FastEndpoints + OpenAPI, Serilog, domain event publisher |
| `src/source-generators/Starlights.Platform.SourceGenerators/EntityIdSourceGenerator.cs` | Emits `<Class>Id` record structs for classes marked `[Entity]` |

## Conventions

- Three extension points: `IPlatformModule` (parameterless constructor, services only), `IPlatformServiceComponent` (services, with a `RegistrationOrder`), and `IPlatformApplicationComponent` (runs `UseComponent(IHost)` after build, also ordered).
- Keep `RegistrationOrder` bands: Serilog 100, platform EF and event publisher 500, module components 1000 to 1099, FastEndpoints 9000 (last, so every endpoint assembly is known).
- The platform must not reference any module. Modules reference platform, never the other way.
- Generated IDs are `readonly record struct <Class>Id(Guid Value)` with `New()` using `Guid.CreateVersion7()` and an implicit conversion to `Guid`.

## Gotchas

- Discovery scans assemblies already loaded in the app domain plus `AdditionalAssemblies`. An assembly nothing has loaded yet is invisible, so a component there is silently skipped unless `Program.cs` lists it.
- The generator projects target `netstandard2.0` (a Roslyn requirement), and modules reference the generator with `OutputItemType="Analyzer" ReferenceOutputAssembly="false"`. Keep both, or the IDs stop generating.
- Generated `*Id.g.cs` files live only in `obj/`; don't hand write a type with the same name next to an `[Entity]` class.
- `Directory.Build.props` sets `net10.0` for everything, so the generator `.csproj` files must keep their explicit `netstandard2.0` override.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
