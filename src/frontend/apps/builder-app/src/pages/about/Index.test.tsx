import { SiteFooter } from "@/components/site-footer";
import { srdAttribution } from "@/lib/srd-attribution";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import AboutPage from "./Index";

describe("AboutPage", () => {
  it("quotes the SRD 5.2.1 attribution exactly as its license asks", () => {
    // Arrange
    render(
      <MemoryRouter>
        <AboutPage />
      </MemoryRouter>,
    );

    // Act
    const section = screen.getByRole("region", { name: "Content and licensing" });

    // Assert
    expect(section).toHaveTextContent(srdAttribution.statement);
  });
});

describe("SiteFooter", () => {
  it("credits the SRD and links to the full attribution on the About page", () => {
    // Arrange
    render(
      <MemoryRouter>
        <SiteFooter />
      </MemoryRouter>,
    );

    // Act
    const srdLink = screen.getByRole("link", { name: "System Reference Document 5.2.1" });
    const aboutLink = screen.getByRole("link", { name: "Content and licensing" });

    // Assert
    expect(srdLink).toHaveAttribute("href", srdAttribution.srdUrl);
    expect(screen.getByRole("link", { name: "CC BY 4.0" })).toHaveAttribute("href", srdAttribution.licenseUrl);
    expect(aboutLink).toHaveAttribute("href", "/about#content-and-licensing");
  });
});
