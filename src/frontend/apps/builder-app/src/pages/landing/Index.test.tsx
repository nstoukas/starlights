import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { LandingPage2 } from "./Index";

function renderLanding() {
  render(
    <MemoryRouter>
      <LandingPage2 />
    </MemoryRouter>,
  );
}

/** The tile (link or disabled block) that holds the heading with this title. */
function tile(title: string) {
  return screen.getByRole("heading", { name: title }).closest("a, [aria-disabled='true']") as HTMLElement;
}

describe("LandingPage2", () => {
  it("links the character builder tile to the characters page", () => {
    // Arrange
    renderLanding();

    // Act
    const builder = tile("Character Builder | SRD 5.2");

    // Assert
    expect(builder.tagName).toBe("A");
    expect(builder).toHaveAttribute("href", "/characters");
  });

  it.each(["Campaign Ledger", "Compendium of Lore"])("renders the planned %s tile as a disabled block, not a link to a missing page", (title) => {
    // Arrange
    renderLanding();

    // Act
    const planned = tile(title);

    // Assert
    expect(planned.tagName).not.toBe("A");
    expect(planned).toHaveAttribute("aria-disabled", "true");
  });

  it("keeps the planned tiles visible with their Planned badge", () => {
    // Arrange
    renderLanding();

    // Act
    const badges = screen.getAllByText("Planned");

    // Assert
    expect(badges).toHaveLength(2);
    expect(screen.getByText(/plan quests, track NPCs/)).toBeVisible();
    expect(screen.getByText(/searchable archive of spells/)).toBeVisible();
  });

  it("offers exactly one tile link, the character builder", () => {
    // Arrange
    renderLanding();

    // Act
    const links = screen.getAllByRole("link");

    // Assert
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/characters"]);
  });
});
