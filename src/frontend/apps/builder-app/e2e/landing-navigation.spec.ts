import { expect, test } from "@playwright/test";

/**
 * The landing page and the main navigation only link to pages the app serves. Planned pages show
 * as disabled items, so a visitor never lands on a 404. Runs at desktop width, where the menus show.
 */
test.use({ viewport: { width: 1280, height: 900 } });

test.beforeEach(async ({ page }) => {
  // the landing page makes no API calls; answer any stray request so nothing reaches a real backend
  await page.route((url) => url.pathname.startsWith("/api/"), (route) => route.fulfill({ status: 200, json: { items: [] } }));
  await page.goto("/");
});

test("the Character Builder menu shows the start page as a link and the builder steps as disabled", async ({ page }) => {
  // Arrange
  const menu = page.getByRole("navigation").first();

  // Act
  await menu.getByRole("button", { name: "Character Builder" }).hover();

  // Assert
  await expect(page.getByRole("link", { name: /Start Page/ })).toHaveAttribute("href", "/characters");
  for (const title of ["Build Options", "Spellcasting Options", "Equipment", "Manage Character"]) {
    const item = page.locator("[aria-disabled='true']", { hasText: title });
    await expect(item, `${title} should be shown as disabled`).toBeVisible();
    await expect(page.getByRole("link", { name: new RegExp(title) }), `${title} should not be a link`).toHaveCount(0);
  }
});

test("clicking a disabled menu item keeps you on the page", async ({ page }) => {
  // Arrange
  await page.getByRole("button", { name: "Collections" }).hover();
  const campaigns = page.locator("[aria-disabled='true']", { hasText: "Campaigns" });
  await expect(campaigns).toBeVisible();

  // Act
  await campaigns.click({ force: true });

  // Assert
  await expect(page).toHaveURL("/");
});

test("the planned landing tiles are not links, and the builder tile opens the characters page", async ({ page }) => {
  // Arrange
  const planned = page.locator("[aria-disabled='true']", { has: page.getByRole("heading", { name: "Campaign Ledger" }) });
  await expect(planned).toBeVisible();
  await expect(page.getByRole("link", { name: /Campaign Ledger|Compendium of Lore/ })).toHaveCount(0);

  // Act
  await page.getByRole("link", { name: /Character Builder \| SRD 5\.2/ }).click();

  // Assert
  await expect(page).toHaveURL("/characters");
});
