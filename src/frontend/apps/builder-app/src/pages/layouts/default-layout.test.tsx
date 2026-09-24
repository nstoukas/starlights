import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MainNavigation } from "./default-layout";

/** Renders the navigation and opens one top level menu. */
async function openMenu(name: string) {
  const user = userEvent.setup();
  render(
    <MemoryRouter>
      <MainNavigation />
    </MemoryRouter>,
  );

  await user.click(screen.getByRole("button", { name }));
}

/** The menu row (the <li>) that holds the item with this title. */
function row(title: string) {
  return screen.getByText(title).closest("li") as HTMLElement;
}

describe("MainNavigation", () => {
  describe("Collections menu", () => {
    it("links the character collection to the characters page", async () => {
      // Arrange
      await openMenu("Collections");

      // Act
      const link = within(row("Character Collection")).getByRole("link");

      // Assert
      expect(link).toHaveAttribute("href", "/characters");
    });

    it.each(["Campaigns", "Compendium", "Homebrew Content"])("shows %s as a disabled item without a link, since the page does not exist yet", async (title) => {
      // Arrange
      await openMenu("Collections");

      // Act
      const item = row(title);

      // Assert
      expect(within(item).queryByRole("link")).not.toBeInTheDocument();
      expect(within(item).getByText(title).closest("[aria-disabled='true']")).not.toBeNull();
    });
  });

  describe("Character Builder menu", () => {
    it("links the start page to the characters page", async () => {
      // Arrange
      await openMenu("Character Builder");

      // Act
      const link = within(row("Start Page")).getByRole("link");

      // Assert
      expect(link).toHaveAttribute("href", "/characters");
    });

    it.each(["Build Options", "Spellcasting Options", "Equipment", "Manage Character"])(
      "shows %s as a disabled item without a link, since it needs a character to point at",
      async (title) => {
        // Arrange
        await openMenu("Character Builder");

        // Act
        const item = row(title);

        // Assert
        expect(within(item).queryByRole("link")).not.toBeInTheDocument();
        expect(within(item).getByText(title).closest("[aria-disabled='true']")).not.toBeNull();
      },
    );
  });

  describe("Developer menu", () => {
    it.each([
      ["Development", "/development"],
      ["Library Page", "/lib"],
      ["Builder Layout Demo Page", "/app2"],
    ])("links %s to %s, a route the app serves", async (title, href) => {
      // Arrange
      await openMenu("Developer");

      // Act
      const link = within(row(title)).getByRole("link");

      // Assert
      expect(link).toHaveAttribute("href", href);
    });
  });

  it("renders no link to a page the app does not have", async () => {
    // Arrange
    const deadRoutes = ["/campaigns", "/compendium", "/homebrew", "/characters/12345"];

    // Act
    for (const menu of ["Collections", "Character Builder", "Developer"]) {
      const user = userEvent.setup();
      const { unmount } = render(
        <MemoryRouter>
          <MainNavigation />
        </MemoryRouter>,
      );
      await user.click(screen.getByRole("button", { name: menu }));

      // Assert
      const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href") ?? "");
      expect(hrefs.filter((href) => deadRoutes.some((dead) => href.startsWith(dead))), `the ${menu} menu`).toEqual([]);
      unmount();
    }
  });
});
