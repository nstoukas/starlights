# Content

The content side: the content manager app (a blank placeholder today, in `src/frontend/apps/content-manager`), the editors for each kind of content, and the SRD 5.2 content itself, entered in waves once the builder has proven each rules path. Content saved from here goes to files in git through feature 12. Back to [index.md](index.md).

## Slice 3: Content manager

### 19. Content manager shell and browser · needs a decision
Turn the placeholder app into a working tool: browse all content by type, search by name, and open an element to see its details, rules, and choices. Uses the existing content editing API (feature 8), so it's mostly frontend work and a good first taste of the React side.
**Done when:** you can list, filter, and search elements of every type and open one to see its components and rules; errors from the API show in the page.
- [ ] Design it (spec): `/architect content manager shell and browser`
code in `src/frontend/apps/content-manager/`

### 20. Class, subclass and feature editor · needs a decision
Forms to create and edit classes (hit die, proficiencies, skill choices, per level table), subclasses, and class features (level, parent class, description, the rules they grant). The API endpoints exist for all three.
**Done when:** you can enter a class with its level 1 to 20 features and one subclass entirely in the content manager, and the builder picks them up without code changes.
- [ ] Design it (spec): `/architect class, subclass and feature editor`

### 21. Species, background and feat editor · needs a decision
Forms for species (size, speed, traits), backgrounds (ability options, skills, tool, origin feat, starting equipment), and feats (category, prerequisites, what they grant). Species and backgrounds need new typed endpoints; feats already have them.
**Done when:** you can enter a full species, background, and feat in the content manager, and the builder offers them.
- [ ] Design it (spec): `/architect species, background and feat editor`

## Slice 4: Proving a martial class

### 22. Proving martial: Barbarian 1 to 20
Enter the full SRD Barbarian (all 20 levels, Rage, Weapon Mastery, the Path of the Berserker subclass) through the content manager and export it to files. It's the test content for the level up features in slice 4, so enter it alongside them. (basis: prove the engine on one class before filling in the rest)
**Done when:** a Barbarian built from 1 to 20 matches the SRD at every level, and its content is committed as files.
- [ ] Build it: `/develop proving martial: Barbarian 1 to 20`
- [ ] Verify it: `/check verify proving martial: Barbarian 1 to 20`
- [ ] Test it: `/test proving martial: Barbarian 1 to 20`

## Slice 5: Item content

### 28. Item content and editor · needs a decision
Add items to the content model and the content manager: armor (base AC, type, Strength requirement, stealth), weapons (damage, properties, mastery), shields, gear, and equipment packs. Nothing for items exists yet, so this includes new endpoints.
**Done when:** you can enter the SRD armor and weapon tables and the equipment packs, and export them to files.
- [ ] Design it (spec): `/architect item content and editor`

## Slice 6: Spell content

### 32. Spell content and editor · needs a decision
A content manager form for spells (level, school, casting time, range, components, duration, description, which class lists include them). Spell endpoints exist; this adds the editor and whatever the model still lacks.
**Done when:** you can enter a spell with all its SRD fields and attach it to class spell lists, and the builder's spell step offers it.
- [ ] Design it (spec): `/architect spell content and editor`

### 35. Proving caster: Wizard 1 to 20
Enter the full SRD Wizard (all 20 levels, the spellbook, Arcane Recovery, the Evoker subclass) and the Wizard spell list, then export to files. It proves the spell features end to end.
**Done when:** a Wizard built from 1 to 20 shows the SRD's slots, spell counts, and features at every level, and its content is committed as files.
- [ ] Build it: `/develop proving caster: Wizard 1 to 20`
- [ ] Verify it: `/check verify proving caster: Wizard 1 to 20`
- [ ] Test it: `/test proving caster: Wizard 1 to 20`

## Slice 7: Content waves

### 36. Origins content: all SRD species, backgrounds and origin feats
Enter the 9 SRD species (Dragonborn, Dwarf, Elf, Gnome, Goliath, Halfling, Human, Orc, Tiefling), the 4 SRD backgrounds (Acolyte, Criminal, Sage, Soldier), and the origin feats (Alert, Magic Initiate, Savage Attacker, Skilled), replacing the placeholder origins in the seed.
**Done when:** every SRD species, background, and origin feat is selectable in the builder, matches the SRD, and is committed as files.
- [ ] Build it: `/develop origins content`
- [ ] Verify it: `/check verify origins content`
- [ ] Test it: `/test origins content`

### 37. Class wave 1: Fighter, Rogue, Cleric
Enter three classes whose mechanics the proving classes already cover: Fighter (martial), Rogue (finish the seeded one, with Sneak Attack and Expertise), and Cleric (prepares spells from the whole list), each with its SRD subclass and spells.
**Done when:** each class builds correctly from 1 to 20 against the SRD, and its content is committed as files.
- [ ] Build it: `/develop class wave 1`
- [ ] Verify it: `/check verify class wave 1`
- [ ] Test it: `/test class wave 1`

### 38. Class wave 2: Bard, Druid, Paladin, Ranger
Enter the remaining full casters (Bard, Druid) and the half casters (Paladin, Ranger), each with its SRD subclass and spell list.
**Done when:** each class builds correctly from 1 to 20 against the SRD, half caster slots are right, and content is committed as files.
- [ ] Build it: `/develop class wave 2`
- [ ] Verify it: `/check verify class wave 2`
- [ ] Test it: `/test class wave 2`

### 39. Class wave 3: Monk, Sorcerer, Warlock · needs a decision
The classes with mechanics nothing earlier covers: the Monk's Martial Arts and Unarmored Movement, the Sorcerer's Sorcery Points and Metamagic, and the Warlock's Pact Magic (few slots, all at one level, back on a short rest) and Eldritch Invocations. Needs a design for those mechanics before content entry.
**Done when:** each class builds correctly from 1 to 20 against the SRD, including Pact Magic slots and invocation choices, and content is committed as files.
- [ ] Design it (spec): `/architect class wave 3: Monk, Sorcerer, Warlock`
