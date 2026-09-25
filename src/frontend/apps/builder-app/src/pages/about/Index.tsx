import ProseSection from "@/components/prose-section";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { srdAttribution } from "@/lib/srd-attribution";
import { BookOpenIcon, OrbitIcon, ScaleIcon } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const facts = [
  { label: "Rules", value: "D&D 2024, SRD 5.2.1" },
  { label: "Game content", value: "CC BY 4.0, Wizards of the Coast" },
  { label: "Source code", value: "MIT License" },
];

export default function AboutPage() {
  const { hash } = useLocation();

  // the router doesn't scroll to an anchor on its own, and the footer links straight to the licensing section
  useEffect(() => {
    if (hash) {
      document.getElementById(hash.slice(1))?.scrollIntoView();
    }
  }, [hash]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
      <div className="lg:col-span-2 space-y-10">
        <header className="space-y-3">
          <Badge variant="outline">In Development</Badge>
          <h1 className="font-heading tracking-widest text-3xl sm:text-4xl flex items-center gap-3">
            <OrbitIcon aria-hidden="true" className="size-8 stroke-starlights-purple-600" />
            About Starlights
          </h1>
          <p className="text-muted-foreground text-lg">
            An online toolset for tabletop role playing games, starting with a character builder for the 2024 Dungeons &amp; Dragons rules.
          </p>
        </header>

        <ProseSection>
          <p>
            Starlights is the web successor to{" "}
            <a href="https://www.aurorabuilder.com" target="_blank" rel="noreferrer">
              Aurora
            </a>
            , a character builder for Windows. You build a character step by step, from class and species to equipment and spells, and the builder works
            out the numbers for you. The project is developed in the open.
          </p>
        </ProseSection>

        <section id="content-and-licensing" aria-labelledby="content-and-licensing-heading" className="scroll-mt-24 space-y-4">
          <h2 id="content-and-licensing-heading" className="font-heading tracking-widest text-xl flex items-center gap-2">
            <ScaleIcon aria-hidden="true" className="size-5 stroke-starlights-indigo-600" />
            Content and licensing
          </h2>
          <ProseSection>
            <p>
              The game rules in Starlights come from the System Reference Document 5.2.1, the part of the 2024 rules that Wizards of the Coast released
              under an open license. Using it comes with one condition: credit, given exactly like this.
            </p>
            <blockquote className="wrap-anywhere">{srdAttribution.statement}</blockquote>
            <p>
              Starlights only ships SRD content. Some sample content exists purely to test the builder; its description says{" "}
              <em>Test only placeholder, not SRD content</em>. Starlights is not affiliated with or endorsed by Wizards of the Coast.
            </p>
          </ProseSection>
        </section>
      </div>

      <aside className="lg:pt-14">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-heading tracking-widest text-sm uppercase">
              <BookOpenIcon aria-hidden="true" className="size-4" />
              At a glance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm">
              {facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-muted-foreground text-xs uppercase tracking-wider">{fact.label}</dt>
                  <dd className="font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-6 flex flex-col gap-2 text-sm">
              <a href={srdAttribution.srdUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                Read the SRD 5.2.1
              </a>
              <a href={srdAttribution.licenseUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                Read the CC BY 4.0 license
              </a>
            </div>
          </CardContent>
        </Card>
      </aside>
    </div>
  );
}
