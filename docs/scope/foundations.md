# Foundations

What the original author already built, and the ground work to lay before new features. Back to [index.md](index.md).

## Already built

### 1. Platform, modules and local run setup · existing
The modular monolith (one backend app split into self contained modules), the shared platform layer, and the Aspire setup that starts SQL Server, runs migrations, and launches the API plus four frontend apps with one `aspire run`. code in `src/platform/`, `src/aspire/`, `src/apps/Starlights.Application/`

### 2. Coding standards and AI context · done
Conventions captured from the real code into `AGENTS.md` files, plus project Agent Skills and MCP servers.
- [x] Capture conventions and tooling: `/audit`
code in `AGENTS.md`, `src/*/AGENTS.md`

### 3. Create, list and delete characters · existing
A player creates a character (name, starting option, portrait), sees all characters in a grid, and deletes one. Works end to end: API, api client, and builder app pages. code in `src/modules/characters/Modules.Characters.Endpoints/Characters/`, `src/frontend/apps/builder-app/src/pages/characters/`

### 4. Choice engine (selection rules) · existing
The backend system behind every choice a player makes: an element declares "pick N from this list", the API lists the options, and a pick is saved as a registration that grants its own abilities, skills, and further choices. No player facing UI uses it yet (feature 13 adds one). code in `src/modules/characters/Modules.Characters/Services/Processing/`, `Modules.Characters.Endpoints/Generation/`

### 5. Core character math · existing
Ability scores and modifiers, saving throws, all 18 skills, proficiency bonus, and class levels, calculated on the server by the statistics calculator. code in `src/modules/characters/Modules.Characters/Services/Statistics/`

## In progress

### 6. Developer character page · done
The existing `/characters/:id` page is a working developer tool: it edits base and bonus ability scores, lists skills, and levels up classes through the real API. Keep it as your debugging view, and make it print cleanly.
**Done when:** the page also shows saving throws, features, and calculated statistics, prints on paper without cut off tables or navigation, and works at phone width.
- [x] Build it: `/develop developer character page`
- [x] Verify it: `/check verify developer character page`
- [x] Test it: `/test developer character page`
code in `src/frontend/apps/builder-app/src/pages/characters/details/Index.tsx`

## Already built (content side)

### 7. Content model and starter seed · existing
How game content is stored: an element with typed components attached (abbreviation, class aspects like hit die, parent links), plus a seeder that fills an empty database with abilities, skills, 2 classes, 3 subclasses, 2 species, and 2 backgrounds. The seed is placeholder content, not SRD accurate (it includes "Charlatan", which is not in the SRD, and a test subclass named "Path of the Strong Dude"). code in `src/modules/elements/Modules.Elements.Domain/`, `Modules.Elements/Services/ElementsModuleInitializer.cs`

### 8. Content editing API · existing
69 endpoints to create, read, update, and delete content: elements, labels, rules (includes, selections, statistics), and typed content for classes, class features, subclasses, feats, feat categories, spells, languages, proficiencies, skills, saving throws, and ability scores. Species, backgrounds, and items have no typed endpoints yet. code in `src/modules/elements/Modules.Elements.Endpoints/ContentManagement/`

## Ground work

### 9. Stabilize the fork · done
Fix the known defects before building on top, so new work doesn't inherit them. Each fix is small and could go upstream as its own pull request.
**Done when:** the uncommitted seeder fix is committed with a test that calls the class, class feature, and subclass list endpoints (they returned 500 before); the database initialize endpoint no longer runs on a `GET` and does nothing on a second call; the 7 dead navigation links are removed or point at real pages; the missing showcase image is fixed; all tests pass.
- [x] Build it: `/develop stabilize the fork`
- [x] Verify it: `/check verify stabilize the fork`
- [x] Test it: `/test stabilize the fork`
code in `src/modules/elements/`, `src/frontend/apps/builder-app/src/`

### 10. SRD attribution and content licensing
SRD 5.2 is free to use only if you credit Wizards of the Coast as its license asks, and only SRD content may be shared. Add the credit and keep non SRD content out of shipped data.
**Done when:** the attribution text the SRD 5.2.1 asks for (see References in [index.md](index.md)) appears in the builder app (footer or about page) and in the repo README; placeholder content that is not in the SRD is replaced or clearly marked as test only.
- [ ] Build it: `/develop SRD attribution and content licensing`
- [ ] Verify it: `/check verify SRD attribution and content licensing`

### 11. Rules content model for SRD 5.2 · needs a decision
Decide how the content model represents everything the 2024 rules need that it lacks today: per level class tables, spell slot progressions, species traits (size, speed, senses), backgrounds with ability increases and an origin feat, items, and spells. It's the costliest thing to redo later, so it comes before the features that fill it. (basis: data model is the costliest thing to redo; foundations before features)
**Done when:** every later feature's content fits the model without a breaking migration, and existing seeded content still loads.
- [ ] Design it (spec): `/architect rules content model for SRD 5.2`

### 12. Content files: export and import · needs a decision
Content typed into the content manager lives only in your local database, which git doesn't track. Save all content to files in the repo and load them into any empty database, so content is versioned, reviewable in a pull request, and never lost with a Docker volume. This may also replace the hand written seeder.
**Done when:** you can export all content to files, wipe the database, import the files, and get identical content back; a fresh `aspire run` loads content from the files.
- [ ] Design it (spec): `/architect content files export and import`

