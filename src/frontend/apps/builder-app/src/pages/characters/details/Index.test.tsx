import { Toaster } from "@/components/ui/sonner";
import { stubApi } from "@/test/api-stub";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import CharactersDetailsPage from "./Index";

const base = "/api/characters/char-1";

const character = {
  characterId: "char-1",
  name: "Thorga",
  level: 3,
  build: "Barbarian",
  portraitUrl: "https://img.test/thorga.png",
  isFavorite: false,
};

function abilityScore(id: string, name: string, baseScore: number, additionalScore: number, modifier: number) {
  return {
    id: `row-${id}`,
    abilityScoreId: id,
    name,
    abbreviation: name.slice(0, 3).toUpperCase(),
    baseScore,
    additionalScore,
    calculatedScore: baseScore + additionalScore,
    calculatedModifier: modifier,
  };
}

function savingThrow(id: string, name: string, calculatedBonus: number) {
  return { id: `row-${id}`, savingThrowId: id, name, abilityScoreId: "x", abilityScoreAbbreviation: "X", abilityScoreModifier: 0, calculatedBonus, additionalBonus: 0 };
}

function skill(id: string, name: string, abbreviation: string, calculatedBonus: number) {
  return { id: `row-${id}`, skillId: id, name, abilityScoreId: "x", abilityScoreAbbreviation: abbreviation, abilityScoreModifier: 0, calculatedBonus, additionalBonus: 0 };
}

function registration(registrationId: string, name: string, type: string, children: unknown[] = []) {
  return { registrationId, name, type, associatedElementId: `el-${registrationId}`, characterId: "char-1", children };
}

/** A character with data in every section. Tests override single routes on top of this. */
function fullCharacterRoutes() {
  return {
    [`GET ${base}`]: { body: { character } },
    [`GET ${base}/ability-scores`]: {
      body: {
        abilityScores: [abilityScore("str", "Strength", 15, 2, 3), abilityScore("dex", "Dexterity", 8, 0, -1), abilityScore("con", "Constitution", 10, 0, 0)],
      },
    },
    [`GET ${base}/saving-throws`]: {
      body: { savingThrows: [savingThrow("st-str", "Strength Saving Throw", 5), savingThrow("st-dex", "Dexterity Saving Throw", -1)] },
    },
    [`GET ${base}/skills`]: {
      body: { skills: [skill("athletics", "Athletics", "STR", 5), skill("stealth", "Stealth", "DEX", -1)] },
    },
    [`GET ${base}/registrations`]: {
      body: {
        registrations: [registration("r-barbarian", "Barbarian", "Class", [registration("r-rage", "Rage", "ClassFeature")]), registration("r-human", "Human", "Species")],
      },
    },
    [`GET ${base}/statistics`]: {
      body: {
        statistics: [
          {
            groupName: "hit points",
            totalValue: 31,
            isFinalized: true,
            values: [
              { source: "barbarian-hit-die", value: 12, displayName: "Hit Die" },
              { source: "constitution-modifier", value: 3 },
            ],
          },
          { groupName: "speed", totalValue: 30, isFinalized: false, values: [] },
        ],
      },
    },
    [`GET ${base}/classes`]: {
      body: {
        classes: [
          { characterClassId: "cc-barbarian", registrationId: "r-barbarian", name: "Barbarian", level: 3, isPrimary: true },
          { characterClassId: "cc-rogue", registrationId: "r-rogue", name: "Rogue", level: 1, isPrimary: false },
          { characterClassId: "cc-fighter", registrationId: "r-fighter", name: "Fighter", level: 20, isPrimary: false },
        ],
      },
    },
    [`GET ${base}/builder/selection-rules?type=Class`]: {
      body: { rules: [{ registrationId: "r-root", registrationSelectionRuleId: "rule-class", name: "Class", type: "Class", activeRegistration: true }] },
    },
    [`GET ${base}/builder/selection-rules?type=SubClass`]: { body: { rules: [] } },
    [`GET ${base}/builder/selection-rules/rule-class/options`]: { body: { options: [{ elementId: "el-barbarian", name: "Barbarian" }] } },
  };
}

function renderPage(path = "/characters/char-1") {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const user = userEvent.setup();

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/characters" element={<CharactersDetailsPage />} />
          <Route path="/characters/:id" element={<CharactersDetailsPage />} />
        </Routes>
      </MemoryRouter>
      <Toaster />
    </QueryClientProvider>,
  );

  return { user };
}

/** The text of each cell in the table row whose first cell is `label`. */
function rowCells(region: HTMLElement, label: string): string[] {
  const row = within(region)
    .getAllByRole("row")
    .find((r) => within(r).queryAllByRole("cell")[0]?.textContent?.startsWith(label));
  if (!row) throw new Error(`No row starting with "${label}"`);
  return within(row)
    .getAllByRole("cell")
    .map((cell) => cell.textContent ?? "");
}

async function section(name: string) {
  return screen.findByRole("region", { name });
}

beforeEach(() => {
  // The page logs every score change and every failure; keep the test output readable.
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("CharactersDetailsPage", () => {
  describe("character summary", () => {
    it("shows the character's name, level, build and portrait", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();

      // Assert
      expect(await screen.findByText("Thorga")).toBeInTheDocument();
      expect(screen.getByText("char-1")).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Portrait of Thorga" })).toHaveAttribute("src", "https://img.test/thorga.png");
    });

    it("shows None and no image when the character has no portrait", async () => {
      // Arrange
      stubApi({ ...fullCharacterRoutes(), [`GET ${base}`]: { body: { character: { ...character, portraitUrl: undefined } } } });

      // Act
      renderPage();

      // Assert
      expect(await screen.findByText("Thorga")).toBeInTheDocument();
      expect(screen.getByText("None")).toBeInTheDocument();
      expect(screen.queryByRole("img", { name: /Portrait of/ })).not.toBeInTheDocument();
    });

    it("asks for an id when the route has none", () => {
      // Arrange
      stubApi({});

      // Act
      renderPage("/characters");

      // Assert
      expect(screen.getByText("Character ID is required.")).toBeInTheDocument();
    });
  });

  describe("character sheet sections", () => {
    it("labels every sheet section so each is its own landmark", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();

      // Assert
      for (const name of ["Abilities", "Saving Throws", "Skills", "Features", "Statistics"]) {
        expect(await section(name), `the ${name} section should be a region named by its heading`).toBeInTheDocument();
      }
    });

    it("shows each ability with its score, signed modifier, base and additional value", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();
      const abilities = await section("Abilities");
      await within(abilities).findByText("Strength");

      // Assert
      expect(rowCells(abilities, "Strength")).toEqual(["Strength", "17", "+3", "15", "2"]);
      expect(rowCells(abilities, "Dexterity")).toEqual(["Dexterity", "8", "-1", "8", "0"]);
      expect(rowCells(abilities, "Constitution"), "a zero modifier reads as +0, like on a paper sheet").toEqual(["Constitution", "10", "+0", "10", "0"]);
    });

    it("shows saving throws by ability name without the Saving Throw suffix", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();
      const saves = await section("Saving Throws");
      await within(saves).findByText("Strength");

      // Assert
      expect(rowCells(saves, "Strength")).toEqual(["Strength", "+5"]);
      expect(rowCells(saves, "Dexterity")).toEqual(["Dexterity", "-1"]);
    });

    it("shows each skill with its ability abbreviation and signed bonus", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();
      const skills = await section("Skills");
      await within(skills).findByText("Athletics");

      // Assert
      expect(rowCells(skills, "Athletics")).toEqual(["Athletics(STR)", "+5"]);
      expect(rowCells(skills, "Stealth")).toEqual(["Stealth(DEX)", "-1"]);
    });

    it("shows features as a tree, with granted features nested under what granted them", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();
      const features = await section("Features");
      await within(features).findByText("Barbarian");

      // Assert
      const barbarianItem = within(features).getByText("Barbarian").closest("li")!;
      expect(within(barbarianItem).getByText("Rage"), "Rage is granted by the Barbarian class").toBeInTheDocument();
      expect(within(barbarianItem).getByText("(ClassFeature)")).toBeInTheDocument();
      const humanItem = within(features).getByText("Human").closest("li")!;
      expect(within(humanItem).queryByText("Rage")).not.toBeInTheDocument();
    });

    it("shows each statistic group with its total, finalized flag and sources", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();
      const statistics = await section("Statistics");
      await within(statistics).findByText("hit points");

      // Assert
      const hitPoints = rowCells(statistics, "hit points");
      expect(hitPoints.slice(0, 3)).toEqual(["hit points", "31", "Yes"]);
      expect(hitPoints[3], "a display name wins over the raw source").toContain("Hit Die: 12");
      expect(hitPoints[3], "without a display name the source is shown").toContain("constitution-modifier: 3");
      expect(rowCells(statistics, "speed").slice(0, 3)).toEqual(["speed", "30", "No"]);
    });

    it("shows a loading message in a section until its data arrives", async () => {
      // Arrange
      let releaseStatistics: () => void = () => {};
      const routes = fullCharacterRoutes();
      stubApi({
        ...routes,
        [`GET ${base}/statistics`]: () =>
          new Promise((resolve) => {
            releaseStatistics = () => resolve(routes[`GET ${base}/statistics`]);
          }),
      });

      // Act
      renderPage();
      const statistics = await section("Statistics");

      // Assert
      expect(within(statistics).getByText("Loading...")).toBeInTheDocument();
      releaseStatistics();
      expect(await within(statistics).findByText("hit points")).toBeInTheDocument();
      expect(within(statistics).queryByText("Loading...")).not.toBeInTheDocument();
    });

    it("tells you when a new character has nothing in a section yet", async () => {
      // Arrange
      stubApi({
        ...fullCharacterRoutes(),
        [`GET ${base}/ability-scores`]: { body: { abilityScores: [] } },
        [`GET ${base}/saving-throws`]: { body: { savingThrows: [] } },
        [`GET ${base}/skills`]: { body: { skills: [] } },
        [`GET ${base}/registrations`]: { body: { registrations: [] } },
        [`GET ${base}/statistics`]: { body: { statistics: [] } },
        [`GET ${base}/classes`]: { body: { classes: [] } },
      });

      // Act
      renderPage();

      // Assert
      expect(await within(await section("Abilities")).findByText("This character has no ability scores yet.")).toBeInTheDocument();
      expect(await within(await section("Saving Throws")).findByText("This character has no saving throws yet.")).toBeInTheDocument();
      expect(await within(await section("Skills")).findByText("This character has no skills yet.")).toBeInTheDocument();
      expect(await within(await section("Features")).findByText(/This character has no features yet/)).toBeInTheDocument();
      expect(await within(await section("Statistics")).findByText("This character has no calculated statistics yet.")).toBeInTheDocument();
      expect(await screen.findByText(/No class yet/)).toBeInTheDocument();
    });

    it("shows an alert in the failing section only, and keeps the rest of the sheet", async () => {
      // Arrange
      stubApi({ ...fullCharacterRoutes(), [`GET ${base}/statistics`]: { status: 500, statusText: "Internal Server Error", body: "boom" } });

      // Act
      renderPage();
      const statistics = await section("Statistics");

      // Assert
      expect(await within(statistics).findByRole("alert")).toHaveTextContent("Could not load statistics.");
      expect(await within(await section("Skills")).findByText("Athletics"), "other sections still render").toBeInTheDocument();
      expect(screen.getAllByRole("alert"), "only the failing section reports an error").toHaveLength(1);
    });

    it("logs the failure to the console so a developer can see why a section failed", async () => {
      // Arrange
      stubApi({ ...fullCharacterRoutes(), [`GET ${base}/skills`]: { status: 500, statusText: "Internal Server Error", body: "boom" } });

      // Act
      renderPage();
      await within(await section("Skills")).findByRole("alert");

      // Assert
      expect(console.error).toHaveBeenCalledWith("[character details] Could not load skills", expect.objectContaining({ status: 500 }));
    });
  });

  describe("editing ability scores", () => {
    it("names every score button after the ability and direction", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();
      const abilities = await section("Abilities");

      // Assert
      expect(await within(abilities).findByRole("button", { name: "Increase Strength base score" })).toBeInTheDocument();
      expect(within(abilities).getByRole("button", { name: "Decrease Strength base score" })).toBeInTheDocument();
    });

    it("raises the base score by one and shows the refreshed value", async () => {
      // Arrange
      let strength = abilityScore("str", "Strength", 15, 2, 3);
      const { requests } = stubApi({
        ...fullCharacterRoutes(),
        [`GET ${base}/ability-scores`]: () => ({ body: { abilityScores: [strength] } }),
        [`POST ${base}/ability-scores/str/base`]: ({ body }) => {
          const value = (body as { value: number }).value;
          strength = { ...abilityScore("str", "Strength", value, 2, 3), calculatedScore: value + 2 };
          return { body: strength };
        },
      });
      const { user } = renderPage();
      const abilities = await section("Abilities");

      // Act
      await user.click(await within(abilities).findByRole("button", { name: "Increase Strength base score" }));

      // Assert
      expect(requests).toContainEqual({ method: "POST", path: `${base}/ability-scores/str/base`, body: { value: 16 } });
      await vi.waitFor(() => expect(rowCells(abilities, "Strength").slice(0, 4)).toEqual(["Strength", "18", "+3", "16"]));
    });

    it("lowers the base score by one", async () => {
      // Arrange
      const { requests } = stubApi({ ...fullCharacterRoutes(), [`POST ${base}/ability-scores/dex/base`]: { body: abilityScore("dex", "Dexterity", 7, 0, -2) } });
      const { user } = renderPage();
      const abilities = await section("Abilities");

      // Act
      await user.click(await within(abilities).findByRole("button", { name: "Decrease Dexterity base score" }));

      // Assert
      await vi.waitFor(() => expect(requests).toContainEqual({ method: "POST", path: `${base}/ability-scores/dex/base`, body: { value: 7 } }));
    });

    it("shows an error toast when the score change fails", async () => {
      // Arrange
      stubApi({ ...fullCharacterRoutes(), [`POST ${base}/ability-scores/str/base`]: { status: 500, statusText: "Internal Server Error", body: "boom" } });
      const { user } = renderPage();
      const abilities = await section("Abilities");

      // Act
      await user.click(await within(abilities).findByRole("button", { name: "Increase Strength base score" }));

      // Assert
      expect(await screen.findByText("Could not change the Strength base score")).toBeInTheDocument();
    });
  });

  describe("class levels", () => {
    async function classItem(name: string) {
      const label = await screen.findByText(new RegExp(`^${name} \\(Level`));
      return label.closest("li")!;
    }

    it("lists each class with its level and marks the primary one", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();

      // Assert
      expect(await screen.findByText("Barbarian (Level 3) [Primary]")).toBeInTheDocument();
      expect(screen.getByText("Rogue (Level 1)")).toBeInTheDocument();
    });

    it("sends the next level when you level up", async () => {
      // Arrange
      const { requests } = stubApi({ ...fullCharacterRoutes(), [`POST ${base}/classes/cc-barbarian/level`]: { status: 204 } });
      const { user } = renderPage();

      // Act
      await user.click(within(await classItem("Barbarian")).getByRole("button", { name: "Level Up" }));

      // Assert
      await vi.waitFor(() => expect(requests).toContainEqual({ method: "POST", path: `${base}/classes/cc-barbarian/level`, body: { newLevel: 4 } }));
    });

    it("sends the previous level when you level down", async () => {
      // Arrange
      const { requests } = stubApi({ ...fullCharacterRoutes(), [`POST ${base}/classes/cc-barbarian/level`]: { status: 204 } });
      const { user } = renderPage();

      // Act
      await user.click(within(await classItem("Barbarian")).getByRole("button", { name: "Level Down" }));

      // Assert
      await vi.waitFor(() => expect(requests).toContainEqual({ method: "POST", path: `${base}/classes/cc-barbarian/level`, body: { newLevel: 2 } }));
    });

    it("stops level down at level 1", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();
      const rogue = await classItem("Rogue");

      // Assert
      expect(within(rogue).getByRole("button", { name: "Level Down" })).toBeDisabled();
      expect(within(rogue).getByRole("button", { name: "Level Up" })).toBeEnabled();
    });

    it("stops level up at level 20", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());

      // Act
      renderPage();
      const fighter = await classItem("Fighter");

      // Assert
      expect(within(fighter).getByRole("button", { name: "Level Up" })).toBeDisabled();
      expect(within(fighter).getByRole("button", { name: "Level Down" })).toBeEnabled();
    });

    it("shows an error toast when the level change fails", async () => {
      // Arrange
      stubApi({ ...fullCharacterRoutes(), [`POST ${base}/classes/cc-barbarian/level`]: { status: 400, statusText: "Bad Request", body: "nope" } });
      const { user } = renderPage();

      // Act
      await user.click(within(await classItem("Barbarian")).getByRole("button", { name: "Level Up" }));

      // Assert
      expect(await screen.findByText("Could not change the Barbarian level")).toBeInTheDocument();
    });
  });

  describe("selection rules", () => {
    it("registers an option under the rule's parent registration", async () => {
      // Arrange
      const { requests } = stubApi({
        ...fullCharacterRoutes(),
        [`POST ${base}/builder/selection-rules/rule-class/register`]: { body: { registrationId: "r-new" } },
      });
      const { user } = renderPage();
      const option = (await screen.findByText(/^Barbarian \| ID: el-barbarian/)).closest("li")!;

      // Act
      await user.click(within(option).getByRole("button", { name: "Register" }));

      // Assert
      await vi.waitFor(() =>
        expect(requests).toContainEqual({
          method: "POST",
          path: `${base}/builder/selection-rules/rule-class/register`,
          body: { parentRegistration: "r-root", elementId: "el-barbarian" },
        }),
      );
    });

    it("unregisters an option under the rule's parent registration", async () => {
      // Arrange
      const { requests } = stubApi({
        ...fullCharacterRoutes(),
        [`POST ${base}/builder/selection-rules/rule-class/unregister`]: { status: 204 },
      });
      const { user } = renderPage();
      const option = (await screen.findByText(/^Barbarian \| ID: el-barbarian/)).closest("li")!;

      // Act
      await user.click(within(option).getByRole("button", { name: "Unregister" }));

      // Assert
      await vi.waitFor(() =>
        expect(requests).toContainEqual({
          method: "POST",
          path: `${base}/builder/selection-rules/rule-class/unregister`,
          body: { parentRegistration: "r-root", elementId: "el-barbarian" },
        }),
      );
    });

    it("loads the species and background choices when you open the Character Origin tab", async () => {
      // Arrange
      const { requests } = stubApi({
        ...fullCharacterRoutes(),
        [`GET ${base}/builder/selection-rules?type=Species`]: { body: { rules: [] } },
        [`GET ${base}/builder/selection-rules?type=Background`]: { body: { rules: [] } },
      });
      const { user } = renderPage();

      // Act
      await user.click(await screen.findByRole("tab", { name: "Character Origin" }));

      // Assert
      expect(await screen.findByText("Species Selection Rules")).toBeInTheDocument();
      expect(await screen.findByText("Background Selection Rules")).toBeInTheDocument();
      expect(requests.map((r) => r.path)).toEqual(
        expect.arrayContaining([`${base}/builder/selection-rules?type=Species`, `${base}/builder/selection-rules?type=Background`]),
      );
    });
  });

  describe("printing", () => {
    it("opens the browser print dialog from the Print button", async () => {
      // Arrange
      stubApi(fullCharacterRoutes());
      const print = vi.spyOn(window, "print").mockImplementation(() => {});
      const { user } = renderPage();

      // Act
      await user.click(await screen.findByRole("button", { name: "Print" }));

      // Assert
      expect(print).toHaveBeenCalledTimes(1);
    });
  });
});
