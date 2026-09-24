# Scope: Starlights character builder MVP

A web character builder for D&D using the 2024 rules (SRD 5.2). A player can build a single class character from level 1 to 20 in any of the 12 SRD classes, with species, background, equipment and spells, then view and print a complete sheet. Content is entered through the content manager and saved as files in git. This is your own roadmap for a fork of `swdriessen/starlights`, built solo and dogfooded (used by you, for real, to find what's missing). Each feature notes what the original author already built, so you can offer finished pieces back upstream as pull requests.

**Build approach:** Tracer Bullet (each feature is a thin but real slice through every layer: database, domain, API endpoint, and screen).
**Workflow:** Beta (after `/develop`, run `/check verify` then `/test`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision, but you can skip it when you already know the build. Any feature can carry its own tag (e.g. `· GA`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

**On every screen:** it works at phone and tablet width, and when something fails you see a friendly message in the page while the details land in the logs (visible in the Aspire dashboard). These are part of every UI feature's `Done when`, even where the line does not repeat it.

## Epics

- [foundations.md](foundations.md): what already exists (1 to 8) and the ground work before new features (9 to 12). 1 done, 6 existing, 1 in progress, 4 planned.
- [builder.md](builder.md): the player side, from the first choice to a printable level 20 sheet (13 to 18, 23 to 27, 29 to 31, 33 to 34). 16 planned.
- [content.md](content.md): the content manager, content editors, and the SRD content itself (19 to 22, 28, 32, 35 to 39). 11 planned.

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Platform, modules and local run setup | Foundation | existing |
| 2 | Coding standards and AI context | Foundation | done |
| 3 | Create, list and delete characters | Foundation | existing |
| 4 | Choice engine (selection rules) | Foundation | existing |
| 5 | Core character math | Foundation | existing |
| 6 | Developer character page | Foundation | done |
| 7 | Content model and starter seed | Foundation | existing |
| 8 | Content editing API | Foundation | existing |
| 9 | Stabilize the fork | Foundation | done |
| 10 | SRD attribution and content licensing | Foundation | planned |
| 11 | Rules content model for SRD 5.2 | Foundation | planned |
| 12 | Content files: export and import | Foundation | planned |
| 13 | Builder shell and choice picker | Slice 1 | planned |
| 14 | Choose a class at level 1 | Slice 1 | planned |
| 15 | Character sheet | Slice 1 | planned |
| 16 | Choose a species | Slice 2 | planned |
| 17 | Background, origin feat and languages | Slice 2 | planned |
| 18 | Ability score generation | Slice 2 | planned |
| 19 | Content manager shell and browser | Slice 3 | planned |
| 20 | Class, subclass and feature editor | Slice 3 | planned |
| 21 | Species, background and feat editor | Slice 3 | planned |
| 22 | Proving martial: Barbarian 1 to 20 | Slice 4 | planned |
| 23 | Hit points | Slice 4 | planned |
| 24 | Level up flow | Slice 4 | planned |
| 25 | Choose a subclass | Slice 4 | planned |
| 26 | Ability score improvements, feats and epic boons | Slice 4 | planned |
| 27 | Class resources and limited uses | Slice 4 | planned |
| 28 | Item content and editor | Slice 5 | planned |
| 29 | Starting equipment | Slice 5 | planned |
| 30 | Armor and Armor Class | Slice 5 | planned |
| 31 | Weapons and attacks | Slice 5 | planned |
| 32 | Spell content and editor | Slice 6 | planned |
| 33 | Spell slots, save DC and attack bonus | Slice 6 | planned |
| 34 | Choosing cantrips and spells | Slice 6 | planned |
| 35 | Proving caster: Wizard 1 to 20 | Slice 6 | planned |
| 36 | Origins content: all SRD species, backgrounds and origin feats | Slice 7 | planned |
| 37 | Class wave 1: Fighter, Rogue, Cleric | Slice 7 | planned |
| 38 | Class wave 2: Bard, Druid, Paladin, Ranger | Slice 7 | planned |
| 39 | Class wave 3: Monk, Sorcerer, Warlock | Slice 7 | planned |

Phases in plain words: **Foundation** is ground work. **Slice 1** is the thinnest real thread: pick a class, see it on a sheet. **Slice 2** adds origins. **Slice 3** builds the content manager so you can enter content. **Slice 4** takes one martial class all the way to level 20. **Slices 5 and 6** add equipment and spells and prove a caster. **Slice 7** fills in the rest of the SRD content, wave by wave.

## Deferred

Out of scope for this MVP, kept so the plan stays honest.
- **Multiclassing**: levels in more than one class (the backend already tracks levels per class) · needs a decision
- **PDF export**: a downloadable sheet that looks like the official one; the browser's print covers the MVP · needs a decision
- **Accounts and character ownership**: sign in, and only you see your characters; the domain has an unused `PlayerId` · needs a decision · GA
- **Play tracking**: current HP, spent slots and uses, short and long rests during a session · needs a decision
- **Full inventory**: gold, buying, carrying weight, magic items · needs a decision
- **Campaigns, compendium, homebrew**: the pages the nav already links to · needs a decision
- **Content beyond the SRD**: anything not under the SRD's open license (it can't be shared publicly)
- **Landing page**: the placeholder app in `apps/landing-page`

## Words used in this plan

- **SRD 5.2**: the part of the 2024 D&D rules that Wizards of the Coast released under an open license, so software may use it with credit.
- **Element**: any piece of game content in the database (a class, a feature, a spell, a species). The Elements module stores them.
- **Selection rule (choice)**: a point where the player must pick something, such as "choose 2 skills from this list". The choice engine records each pick as a **registration**.
- **Endpoint**: one URL the API answers, like `POST /api/characters`. The frontend calls endpoints to read and change data.
- **Migration**: a versioned script that changes the database structure. EF Core (the database library) generates them.
- **Seed**: code that fills an empty database with starter content at startup.
- **Spec**: a design document `/architect` writes in `docs/specs/` before a feature with a real decision gets built.

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop`. The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (built before this workflow, by the original author) and `dropped` (taken out of scope, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· GA`, `· Alpha`) sets that one feature's rigor above or below the project default; no tag inherits the default.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing; **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.

## References

**Project sources**
- Root `AGENTS.md` and the nested `src/*/AGENTS.md` files: the stack, commands, and conventions.
- The code itself, read on 2026-09-24: what is built (features 1 to 8), the 69 content editing endpoints, the placeholder builder page, and the seed content.
- Known defects found on 2026-08-10: the six list endpoints returning 500, the initialize endpoint running on `GET`, 7 dead navigation links (feature 9).

**Practices and standards**
- Tracer bullets: build a thin, real path through every layer first, then thicken it (from _The Pragmatic Programmer_).
- Walking skeleton: the smallest end to end version that runs, built before any single part is complete (Alistair Cockburn).
- Foundations before features, and the data model is the costliest thing to redo.
- Prove an engine on one or two representative cases before bulk content.

**SRD attribution** (required wherever SRD content is used, feature 10), quoted from the SRD 5.2.1 legal page:
> This work includes material from the System Reference Document 5.2.1 ("SRD 5.2.1") by Wizards of the Coast LLC, available at https://www.dndbeyond.com/srd. The SRD 5.2.1 is licensed under the Creative Commons Attribution 4.0 International License, available at https://creativecommons.org/licenses/by/4.0/legalcode.

**Links** (verified 2026-09-24)
- [System Reference Document 5.2 (D&D Beyond)](https://www.dndbeyond.com/srd)
- [SRD 5.2.1, the full document (PDF)](https://media.dndbeyond.com/compendium-images/srd/5.2/SRD_CC_v5.2.1.pdf): the source for the backgrounds, species, origin feats, subclasses, and point buy rules this plan names
- [Creative Commons Attribution 4.0 license](https://creativecommons.org/licenses/by/4.0/deed.en)
- [Tracer Bullets and Prototypes (interview with the Pragmatic Programmer authors)](https://www.artima.com/articles/tracer-bullets-and-prototypes)
- [.NET Aspire documentation](https://learn.microsoft.com/en-us/dotnet/aspire/)
- [EF Core migrations overview](https://learn.microsoft.com/en-us/ef/core/managing-schemas/migrations/)
- [FastEndpoints: get started](https://fast-endpoints.com/docs/get-started)
