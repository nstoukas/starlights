# Builder

The player side: the step by step builder at `/characters/:id/builder` and the character sheet, from a first choice to a printable level 20 character. Back to [index.md](index.md).

## Slice 1: Thinnest real thread

### 13. Builder shell and choice picker · needs a decision
Replace the placeholder builder page with the real frame: a list of steps (class, species, background, abilities, equipment, spells) and one reusable picker that shows any choice from the choice engine (feature 4) and saves the pick. Every later step reuses this picker. Moves the builder off the legacy `packages/ui` library onto `ui-framework`.
**Done when:** a player opens the builder for a character, sees the steps and which ones still need a pick, makes a choice through the picker, and the pick survives a reload; works at phone width; a failed save shows a message instead of a blank screen.
- [ ] Design it (spec): `/architect builder shell and choice picker`
code in `src/frontend/apps/builder-app/src/pages/characters/builder/`

### 14. Choose a class at level 1 · needs a decision
The first real step: pick a class and get everything level 1 grants, which means hit die, saving throw proficiencies, armor and weapon training, skill choices from the class list, and level 1 features. Proves the whole thread from content to screen, using the seeded Barbarian and Rogue.
**Done when:** picking a class applies its saving throws and proficiencies, asks for its skill choices, and shows its level 1 features; changing the class cleanly removes what the old one granted.
- [ ] Design it (spec): `/architect choose a class at level 1`

### 15. Character sheet · needs a decision
A read only page with everything a player needs at the table: abilities and modifiers, saves, skills, proficiency bonus, class and level, features, and (as later slices land) hit points, AC, attacks, and spells. Built to print cleanly from the browser and to read well on a phone. (basis: vertical slices ship real value early; the sheet closes the first thread)
**Done when:** a character built in the builder shows correct numbers on the sheet, printing produces a clean page with no navigation or cut off sections, and the layout works at phone and tablet widths.
- [ ] Design it (spec): `/architect character sheet`

## Slice 2: Origins

### 16. Choose a species · needs a decision
Pick a species (in the 2024 rules, species give traits like size, speed, and darkvision, but no ability bonuses) and apply its traits and any trait choices.
**Done when:** the chosen species' size, speed, senses, and traits appear on the sheet, and trait choices work through the picker.
- [ ] Design it (spec): `/architect choose a species`

### 17. Background, origin feat and languages · needs a decision
Pick a background, which in the 2024 rules grants the ability score increases (+2 and +1, or +1 to three scores, from its list), two skill proficiencies, a tool proficiency, and an origin feat. Also choose languages (Common plus two more).
**Done when:** choosing a background applies its ability increases, skills, tool, and origin feat; the feat's own choices work; chosen languages appear on the sheet.
- [ ] Design it (spec): `/architect background, origin feat and languages`

### 18. Ability score generation · needs a decision
Set the six base scores by standard array, point buy, or manual entry (for rolled dice), before background increases are added. Builds on the existing base score endpoints.
**Done when:** each method enforces its rules (point buy spends exactly 27 points within 8 to 15), and the final scores and modifiers on the sheet include background increases.
- [ ] Design it (spec): `/architect ability score generation`

## Slice 4: Levels 1 to 20

### 23. Hit points · needs a decision
Calculate maximum hit points: full hit die plus Constitution modifier at level 1, then the fixed average (or a rolled value) per level after, and update when Constitution changes. The hit die is already stored on each class.
**Done when:** max HP on the sheet is correct at every level for a d8 and a d12 class, and changes to Constitution recalculate it.
- [ ] Design it (spec): `/architect hit points`

### 24. Level up flow · needs a decision
Take a character from level 2 to 20 in the builder: each new level adds hit points, raises the proficiency bonus when due, grants the class's features for that level, and asks any new choices. The backend level up endpoint exists; this is the player flow around it.
**Done when:** a player can level a character to 20 and back down, each level shows what it granted, and pending choices are flagged until made.
- [ ] Design it (spec): `/architect level up flow`

### 25. Choose a subclass · needs a decision
At level 3, pick a subclass and receive its features at the levels it grants them.
**Done when:** the subclass choice appears at level 3, its features appear at the right levels, and changing it swaps them cleanly.
- [ ] Design it (spec): `/architect choose a subclass`

### 26. Ability score improvements, feats and epic boons · needs a decision
At the levels a class grants it (4, 8, 12, 16 for most), choose the Ability Score Improvement feat or another general feat, and an epic boon at 19. Scores cap at 20 except where a boon allows more.
**Done when:** eligible levels offer the feat choice, feat prerequisites are enforced, increases apply to the sheet within their caps.
- [ ] Design it (spec): `/architect ability score improvements, feats and epic boons`

### 27. Class resources and limited uses · needs a decision
Show features with limited uses and how many you get at your level: Rage, Second Wind, Channel Divinity, Focus Points, Sorcery Points, and so on. Tracking spent uses during play is deferred.
**Done when:** each limited use feature shows its maximum uses and when it recharges (short or long rest), scaling correctly with level.
- [ ] Design it (spec): `/architect class resources and limited uses`

## Slice 5: Equipment

### 29. Starting equipment · needs a decision
Take the class's and background's starting equipment, choosing between their option A (a gear bundle) or option B (gold) as the 2024 rules offer.
**Done when:** the equipment step offers each option, the chosen gear lands on the character, and the sheet lists it.
- [ ] Design it (spec): `/architect starting equipment`

### 30. Armor and Armor Class · needs a decision
Equip armor and a shield, and calculate Armor Class from armor type, Dexterity (capped for medium armor), shield, and class features like Unarmored Defense.
**Done when:** AC on the sheet is correct for no armor, light, medium, and heavy armor, with and without a shield, and for Unarmored Defense; wearing armor you lack training in is flagged.
- [ ] Design it (spec): `/architect armor and armor class`

### 31. Weapons and attacks · needs a decision
Show an attack for each equipped weapon: attack bonus (ability modifier plus proficiency if trained), damage dice and type, properties, and the weapon mastery property for classes that have it.
**Done when:** each weapon's attack bonus and damage on the sheet match the rules, including finesse and ranged weapons and mastery for eligible classes.
- [ ] Design it (spec): `/architect weapons and attacks`

## Slice 6: Spellcasting

### 33. Spell slots, save DC and attack bonus · needs a decision
Calculate spell slots per level from the class's table, the spellcasting ability, spell save DC (8 + proficiency + modifier), and spell attack bonus. Warlock's Pact Magic slots work differently and are designed with wave 3 (feature 39).
**Done when:** slots, save DC, and attack bonus on the sheet are correct at every level for a full caster and a half caster.
- [ ] Design it (spec): `/architect spell slots, save DC and attack bonus`

### 34. Choosing cantrips and spells · needs a decision
Pick cantrips and spells from the class's list, following how each class learns them: a Wizard's spellbook, a Cleric preparing from the whole list, others with a fixed number known. Chosen spells appear on the sheet with their key details, printable.
**Done when:** the spell step enforces each class's counts per level, only offers spells of levels the character can cast, and the sheet lists chosen spells.
- [ ] Design it (spec): `/architect choosing cantrips and spells`
