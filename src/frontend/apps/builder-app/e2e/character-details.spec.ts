import { expect, test, type Page, type Route } from "@playwright/test";

const base = "/api/characters/char-1";

type Stub = { status?: number; body?: unknown };

/** A character with data in every section, keyed by "METHOD path?query". */
function fullCharacterRoutes(): Record<string, Stub> {
  const abilityScore = (id: string, name: string, baseScore: number, modifier: number) => ({
    id: `row-${id}`,
    abilityScoreId: id,
    name,
    abbreviation: name.slice(0, 3).toUpperCase(),
    baseScore,
    additionalScore: 0,
    calculatedScore: baseScore,
    calculatedModifier: modifier,
  });
  const bonus = (key: string, id: string, name: string, value: number, abbreviation = "X") => ({
    id: `row-${id}`,
    [key]: id,
    name,
    abilityScoreId: "x",
    abilityScoreAbbreviation: abbreviation,
    abilityScoreModifier: 0,
    calculatedBonus: value,
    additionalBonus: 0,
  });
  const abilities = ["Strength", "Dexterity", "Constitution", "Intelligence", "Wisdom", "Charisma"];
  const skills = [
    "Acrobatics", "Animal Handling", "Arcana", "Athletics", "Deception", "History", "Insight", "Intimidation", "Investigation",
    "Medicine", "Nature", "Perception", "Performance", "Persuasion", "Religion", "Sleight of Hand", "Stealth", "Survival",
  ];

  return {
    [`GET ${base}`]: {
      body: { character: { characterId: "char-1", name: "Thorga the Unbreakable", level: 3, build: "Barbarian", isFavorite: false } },
    },
    [`GET ${base}/ability-scores`]: { body: { abilityScores: abilities.map((name, i) => abilityScore(`a${i}`, name, 10 + i, i - 1)) } },
    [`GET ${base}/saving-throws`]: {
      body: { savingThrows: abilities.map((name, i) => bonus("savingThrowId", `s${i}`, `${name} Saving Throw`, i - 1)) },
    },
    [`GET ${base}/skills`]: { body: { skills: skills.map((name, i) => bonus("skillId", `k${i}`, name, (i % 5) - 1, "DEX")) } },
    [`GET ${base}/registrations`]: {
      body: {
        registrations: [
          {
            registrationId: "r1",
            name: "Barbarian",
            type: "Class",
            associatedElementId: "e1",
            characterId: "char-1",
            children: [{ registrationId: "r2", name: "Rage", type: "ClassFeature", associatedElementId: "e2", characterId: "char-1", children: [] }],
          },
        ],
      },
    },
    [`GET ${base}/statistics`]: {
      body: {
        statistics: [
          {
            groupName: "a-very-long-statistic-group-name-that-could-push-the-table-wider-than-the-paper",
            totalValue: 31,
            isFinalized: true,
            values: [{ source: "barbarian-hit-die-with-a-long-source-identifier", value: 12, displayName: "Hit Die" }],
          },
          { groupName: "speed", totalValue: 30, isFinalized: false, values: [] },
        ],
      },
    },
    [`GET ${base}/classes`]: {
      body: { classes: [{ characterClassId: "cc1", registrationId: "r1", name: "Barbarian", level: 3, isPrimary: true }] },
    },
    [`GET ${base}/builder/selection-rules?type=Class`]: { body: { rules: [] } },
    [`GET ${base}/builder/selection-rules?type=SubClass`]: { body: { rules: [] } },
  };
}

async function stubApi(page: Page, routes: Record<string, Stub>) {
  // Match on the path start: Vite also serves source modules like /src/lib/api/... from this origin.
  await page.route((url) => url.pathname.startsWith("/api/"), async (route: Route) => {
    const url = new URL(route.request().url());
    const stub = routes[`${route.request().method()} ${url.pathname}${url.search}`];
    if (!stub) {
      await route.fulfill({ status: 404, body: "no stub" });
      return;
    }
    await route.fulfill({ status: stub.status ?? 200, json: stub.body });
  });
}

/** True when nothing on the page is wider than the viewport, so there is no sideways scroll. */
async function hasNoHorizontalOverflow(page: Page) {
  return page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth);
}

async function openCharacter(page: Page) {
  await page.goto("/characters/char-1");
  await expect(page.getByText("Thorga the Unbreakable")).toBeVisible();
  // Wait for the last table to fill so layout checks see the real content.
  await expect(page.getByRole("region", { name: "Statistics" }).getByText("speed")).toBeVisible();
}

test.describe("developer character page", () => {
  test("shows every sheet section for a character", async ({ page }) => {
    // Arrange
    await stubApi(page, fullCharacterRoutes());

    // Act
    await openCharacter(page);

    // Assert
    for (const name of ["Abilities", "Saving Throws", "Skills", "Features", "Statistics"]) {
      await expect(page.getByRole("region", { name })).toBeVisible();
    }
    await expect(page.getByRole("region", { name: "Skills" }).getByRole("row")).toHaveCount(19);
  });

  test("keeps the rest of the sheet when one section fails to load", async ({ page }) => {
    // Arrange
    await stubApi(page, { ...fullCharacterRoutes(), [`GET ${base}/statistics`]: { status: 500, body: "boom" } });

    // Act
    await page.goto("/characters/char-1");

    // Assert
    await expect(page.getByRole("region", { name: "Statistics" }).getByRole("alert")).toContainText("Could not load statistics.");
    await expect(page.getByRole("region", { name: "Skills" }).getByText("Athletics")).toBeVisible();
  });

  test.describe("printing", () => {
    // Roughly the printable width of A4 or Letter paper at the default print margins.
    test.use({ viewport: { width: 720, height: 1000 } });

    test("hides the site navigation, the Print button and the editing tools", async ({ page }) => {
      // Arrange
      await stubApi(page, fullCharacterRoutes());
      await openCharacter(page);
      const screenOnly = [
        page.getByRole("banner"),
        page.getByRole("button", { name: "Print" }),
        page.getByRole("button", { name: "Increase Strength base score" }),
        page.getByText("Actions | Commands"),
        page.getByText("Build | Selection Rules"),
      ];
      for (const element of screenOnly) {
        await expect(element, "shown on screen, so hiding it in print is a real change").toBeVisible();
      }

      // Act
      await page.emulateMedia({ media: "print" });

      // Assert
      for (const element of screenOnly) {
        await expect(element).toBeHidden();
      }
    });

    test("keeps every sheet section and table fully on the page", async ({ page }) => {
      // Arrange
      await stubApi(page, fullCharacterRoutes());
      await openCharacter(page);

      // Act
      await page.emulateMedia({ media: "print" });

      // Assert
      for (const name of ["Abilities", "Saving Throws", "Skills", "Features", "Statistics"]) {
        await expect(page.getByRole("region", { name })).toBeVisible();
      }
      const clippedTables = await page.evaluate(() =>
        [...document.querySelectorAll("table")]
          .filter((table) => table.scrollWidth > (table.parentElement?.clientWidth ?? 0) + 1)
          .map((table) => table.closest("section")?.querySelector("h3")?.textContent),
      );
      expect(clippedTables, "no table may be wider than its section, or print would cut it off").toEqual([]);
      expect(await hasNoHorizontalOverflow(page), "nothing may stick out past the paper edge").toBe(true);
    });

    test("prints on a white background even in dark mode", async ({ page }) => {
      // Arrange
      await page.addInitScript(() => localStorage.setItem("starlights-ui-theme", "dark"));
      await stubApi(page, fullCharacterRoutes());
      await openCharacter(page);
      await expect(page.locator("html")).toHaveClass(/dark/);
      const card = page.getByText("Character Details", { exact: true });
      const cardBackground = () => card.evaluate((title) => getComputedStyle(title.closest("[data-slot=card]")!).backgroundColor);
      const white = /^(rgb\(255, 255, 255\)|#fff(fff)?|oklch\(1 0 0\)|color\(srgb 1 1 1\))$/;
      expect(await cardBackground(), "the card is dark on screen").not.toMatch(white);

      // Act
      await page.emulateMedia({ media: "print" });

      // Assert
      expect(await cardBackground()).toMatch(white);
    });
  });

  test.describe("at phone width", () => {
    test.use({ viewport: { width: 375, height: 812 } });

    test("shows the whole sheet without sideways scrolling", async ({ page }) => {
      // Arrange
      await stubApi(page, fullCharacterRoutes());

      // Act
      await openCharacter(page);

      // Assert
      for (const name of ["Abilities", "Saving Throws", "Skills", "Features", "Statistics"]) {
        await expect(page.getByRole("region", { name })).toBeVisible();
      }
      expect(await hasNoHorizontalOverflow(page), "the page must not scroll sideways on a phone").toBe(true);
    });
  });
});
