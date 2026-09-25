import { srdAttribution } from "@/lib/srd-attribution";
import { Link } from "react-router-dom";

/** The footer on every page: a short SRD credit that links to the full attribution on the About page. */
export function SiteFooter() {
  return (
    // stays in print, so a printed character sheet still carries the credit for the SRD content on it
    <footer className="border-t mt-16 print:mt-6">
      <div className="container mx-auto px-4 py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
        <p>
          Includes material from the{" "}
          <a href={srdAttribution.srdUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">
            System Reference Document 5.2.1
          </a>{" "}
          by Wizards of the Coast LLC, licensed under{" "}
          <a href={srdAttribution.licenseUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-foreground">
            CC BY 4.0
          </a>
          .
        </p>
        <Link to="/about#content-and-licensing" className="shrink-0 underline underline-offset-2 hover:text-foreground print:hidden">
          Content and licensing
        </Link>
      </div>
    </footer>
  );
}
