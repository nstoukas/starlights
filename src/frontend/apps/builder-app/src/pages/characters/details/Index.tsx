import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useCharacterClasses,
  useRegisterSelectionMutation,
  useRegistrationModels,
  useSelectionRuleDataModels,
  useSelectionRuleOptionModels,
  useStatistics,
  useUnregisterSelectionMutation,
  useUpdateClassLevelMutation,
  type CharacterClass,
  type RegistrationModel,
  type SelectionRuleDataModel,
  type SelectionRuleOptionDataModel,
  type StatisticGroupDataModel,
  type StatisticValueDataModel,
} from "@/lib/api/builder/registration-api";
import {
  useAbilityScores,
  useCharacterDetails,
  useSavingThrows,
  useSkills,
  useUpdateAdditionalAbilityScore,
  useUpdateBaseAbilityScore,
  type AbilityScore,
  type SavingThrow,
  type Skill,
} from "@/lib/api/characters/queries";
import { cn } from "@starlights/ui";
import { ChevronDown, ChevronUp, Printer } from "lucide-react";
import { useEffect, useId, type ReactNode } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { CardWrapper } from "../components/card-wrapper";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function formatBonus(value: number | null | undefined): string | null {
  if (value == null) return null;
  return value >= 0 ? `+${value}` : `${value}`;
}

function notifyMutationError(action: string) {
  return (error: Error) => {
    console.error(`[character details] ${action} failed`, error);
    toast.error(`Could not ${action}`, { description: "Try again. The details are in the browser console and the backend logs." });
  };
}

function SectionLoading() {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Spinner /> Loading...
    </div>
  );
}

function SectionError({ what, error }: { what: string; error: Error }) {
  useEffect(() => {
    console.error(`[character details] Could not load ${what}`, error);
  }, [what, error]);

  return (
    <p role="alert" className="text-sm text-destructive">
      Could not load {what}. Try reloading the page. The details are in the browser console and the backend logs.
    </p>
  );
}

function SectionEmpty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>;
}

function SheetSection({ title, className, children }: { title: string; className?: string; children: ReactNode }) {
  const headingId = useId();

  return (
    <section aria-labelledby={headingId} className={cn("min-w-0 rounded border border-dashed p-4 print:p-2", className)}>
      <h3 id={headingId} className="mb-2 text-xs font-semibold uppercase text-muted-foreground break-after-avoid">
        {title}
      </h3>
      {children}
    </section>
  );
}

function AbilitiesComponent({ id: characterId }: { id: string }) {
  const { data: abilityScores, isLoading, error } = useAbilityScores(characterId);
  const updateBaseAbilityScore = useUpdateBaseAbilityScore(characterId);
  const updateAdditionalAbilityScore = useUpdateAdditionalAbilityScore(characterId);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError what="ability scores" error={error} />;
  if (!abilityScores?.abilityScores.length) return <SectionEmpty>This character has no ability scores yet.</SectionEmpty>;

  return (
    <div className="overflow-x-auto text-sm print:overflow-visible">
      <table className="min-w-full text-center">
        <thead className="text-xs uppercase font-semibold">
          <tr>
            <th className="px-2 py-2 border-b text-left">Ability</th>
            <th className="px-2 py-2 border-b">Score</th>
            <th className="px-2 py-2 border-b">Modifier</th>
            <th className="px-2 py-2 border-b">Base</th>
            <th className="px-2 py-2 border-b">Additional</th>
          </tr>
        </thead>
        <tbody>
          {abilityScores.abilityScores.map((ability: AbilityScore) => (
            <tr key={ability.abilityScoreId} className="print:break-inside-avoid">
              <td className="px-2 py-1 border-b text-left">{ability.name}</td>
              <td className="px-2 py-1 border-b">{ability.calculatedScore}</td>
              <td className="px-2 py-1 border-b">{formatBonus(ability.calculatedModifier)}</td>
              <td className="px-2 py-1 border-b">
                <div className="flex flex-row items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      const newScore = ability.baseScore - 1;
                      console.log(`Decrease ${ability.name} base score to ${newScore}`);
                      updateBaseAbilityScore.mutate(
                        { abilityScoreId: ability.abilityScoreId, value: newScore },
                        { onError: notifyMutationError(`change the ${ability.name} base score`) },
                      );
                    }}
                    className="h-8 w-8 p-0 print:hidden"
                    title={`Decrease ${ability.name} base score`}
                    aria-label={`Decrease ${ability.name} base score`}
                  >
                    <ChevronDown />
                  </Button>

                  <span className="text-xs py-1 w-10 h-8 border border-dashed rounded leading-6 text-center print:h-auto print:border-0">{ability.baseScore}</span>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      const newScore = ability.baseScore + 1;
                      console.log(`Increase ${ability.name} base score to ${newScore}`);
                      updateBaseAbilityScore.mutate(
                        { abilityScoreId: ability.abilityScoreId, value: newScore },
                        { onError: notifyMutationError(`change the ${ability.name} base score`) },
                      );
                    }}
                    className="h-8 w-8 p-0 print:hidden"
                    title={`Increase ${ability.name} base score`}
                    aria-label={`Increase ${ability.name} base score`}
                  >
                    <ChevronUp />
                  </Button>
                </div>
              </td>
              <td className="px-2 py-1 border-b">
                <div className="flex flex-row items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      const newScore = ability.additionalScore - 1;
                      console.log(`Decrease ${ability.name} additional score to ${newScore}`);
                      updateAdditionalAbilityScore.mutate(
                        { abilityScoreId: ability.abilityScoreId, value: newScore },
                        { onError: notifyMutationError(`change the ${ability.name} additional score`) },
                      );
                    }}
                    className="h-8 w-8 p-0 hidden"
                    title={`Decrease ${ability.name} additional score`}
                    aria-label={`Decrease ${ability.name} additional score`}
                  >
                    <ChevronDown />
                  </Button>

                  <span className="text-xs py-1 w-10 h-8 border border-dashed rounded leading-6 text-center print:h-auto print:border-0">
                    {ability.additionalScore}
                  </span>

                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      const newScore = ability.additionalScore + 1;
                      console.log(`Increase ${ability.name} additional score to ${newScore}`);
                      updateAdditionalAbilityScore.mutate(
                        { abilityScoreId: ability.abilityScoreId, value: newScore },
                        { onError: notifyMutationError(`change the ${ability.name} additional score`) },
                      );
                    }}
                    className="h-8 w-8 p-0 hidden"
                    title={`Increase ${ability.name} additional score`}
                    aria-label={`Increase ${ability.name} additional score`}
                  >
                    <ChevronUp />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SavingThrowsComponent({ characterId }: { characterId: string }) {
  const { data: savingThrowsData, isLoading, error } = useSavingThrows(characterId);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError what="saving throws" error={error} />;
  if (!savingThrowsData?.savingThrows.length) return <SectionEmpty>This character has no saving throws yet.</SectionEmpty>;

  return (
    <div className="overflow-x-auto text-sm print:overflow-visible">
      <table className="min-w-full text-center">
        <thead className="text-xs uppercase font-semibold">
          <tr>
            <th className="px-2 py-2 border-b text-left">Saving Throw</th>
            <th className="px-2 py-2 border-b">Bonus</th>
          </tr>
        </thead>
        <tbody>
          {savingThrowsData.savingThrows.map((save: SavingThrow) => (
            <tr key={save.savingThrowId} className="print:break-inside-avoid">
              <td className="px-2 py-1 border-b text-left">{save.name.replace("Saving Throw", "").trim()}</td>
              <td className="px-2 py-1 border-b">{formatBonus(save.calculatedBonus)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SkillsComponent({ characterId }: { characterId: string }) {
  const { data: skillsData, isLoading, error } = useSkills(characterId);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError what="skills" error={error} />;
  if (!skillsData?.skills.length) return <SectionEmpty>This character has no skills yet.</SectionEmpty>;

  return (
    <div className="overflow-x-auto text-sm print:overflow-visible">
      <table className="min-w-full text-center">
        <thead className="text-xs uppercase font-semibold">
          <tr>
            <th className="px-2 py-2 border-b text-left">Skill</th>
            <th className="px-2 py-2 border-b">Bonus</th>
          </tr>
        </thead>
        <tbody>
          {skillsData.skills.map((skill: Skill) => (
            <tr key={skill.skillId} className="print:break-inside-avoid">
              <td className="px-2 py-1 border-b text-left">
                <span className="flex items-center gap-1">
                  {skill.name}
                  <span className="text-muted-foreground text-xxs">({skill.abilityScoreAbbreviation})</span>
                </span>
              </td>
              <td className="px-2 py-1 border-b">{formatBonus(skill.calculatedBonus)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RegistrationNode({ registration }: { registration: RegistrationModel }) {
  return (
    <li className="break-inside-avoid">
      <span className="font-semibold">{registration.name}</span> <span className="text-muted-foreground">({registration.type})</span>
      {registration.children && registration.children.length > 0 && (
        <ul className="ml-2 border-l pl-3 sm:ml-4">
          {registration.children.map((child) => (
            <RegistrationNode key={child.registrationId} registration={child} />
          ))}
        </ul>
      )}
    </li>
  );
}

function FeaturesComponent({ characterId }: { characterId: string }) {
  const { data: registrationModels, isLoading, error } = useRegistrationModels(characterId);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError what="features" error={error} />;
  if (!registrationModels?.registrations.length) return <SectionEmpty>This character has no features yet. Pick a class or species below.</SectionEmpty>;

  return (
    <ul className="gap-x-6 space-y-1 text-sm sm:columns-2">
      {registrationModels.registrations.map((registration) => (
        <RegistrationNode key={registration.registrationId} registration={registration} />
      ))}
    </ul>
  );
}

function StatisticsComponent({ characterId }: { characterId: string }) {
  const { data: statisticsData, isLoading, error } = useStatistics(characterId);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError what="statistics" error={error} />;
  if (!statisticsData?.statistics.length) return <SectionEmpty>This character has no calculated statistics yet.</SectionEmpty>;

  return (
    <div className="overflow-x-auto text-sm print:overflow-visible">
      <table className="min-w-full text-center">
        <thead className="text-xs uppercase font-semibold">
          <tr>
            <th className="px-2 py-2 border-b text-left">Statistic Group</th>
            <th className="px-2 py-2 border-b">Total Value</th>
            <th className="px-2 py-2 border-b">Finalized</th>
            <th className="px-2 py-2 border-b text-left">Details</th>
          </tr>
        </thead>
        <tbody>
          {statisticsData.statistics.map((group: StatisticGroupDataModel) => (
            <tr key={group.groupName} className="align-top print:break-inside-avoid">
              <td className="px-2 py-1 border-b text-left font-semibold break-words">{group.groupName}</td>
              <td className="px-2 py-1 border-b">{group.totalValue}</td>
              <td className="px-2 py-1 border-b">{group.isFinalized ? "Yes" : "No"}</td>
              <td className="px-2 py-1 border-b text-left">
                <div className="space-y-1">
                  {group.values.map((value: StatisticValueDataModel, index: number) => (
                    <div key={`${value.source}-${index}`} className="text-xs">
                      <span className="text-muted-foreground">{value.displayName || value.source}:</span> <span className="font-medium">{value.value}</span>
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SelectionRulesSectionOptionsComponent({
  characterId,
  selectionRuleId,
  parentRegistration,
}: {
  characterId: string;
  selectionRuleId: string;
  parentRegistration: string;
}) {
  const { data: optionsData, isLoading, error } = useSelectionRuleOptionModels(characterId, selectionRuleId);

  const registerSelectionMutation = useRegisterSelectionMutation(characterId, selectionRuleId);
  const unregisterSelectionMutation = useUnregisterSelectionMutation(characterId, selectionRuleId);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError what="the options for this choice" error={error} />;

  return (
    <div>
      {optionsData && (
        <div className="border border-dashed rounded p-4 my-2">
          <ul className="space-y-2">
            {optionsData.options.map((option: SelectionRuleOptionDataModel) => (
              <li key={option.elementId} className="flex flex-wrap items-center gap-2">
                <span className="min-w-0 break-all">
                  {option.name} | ID: {option.elementId}
                </span>
                <Button
                  size="sm"
                  disabled={registerSelectionMutation.isPending}
                  onClick={() =>
                    registerSelectionMutation.mutate(
                      { parentRegistration: parentRegistration, elementId: option.elementId },
                      { onError: notifyMutationError(`register ${option.name}`) },
                    )
                  }
                >
                  Register
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={unregisterSelectionMutation.isPending}
                  onClick={() =>
                    unregisterSelectionMutation.mutate(
                      { parentRegistration: parentRegistration, elementId: option.elementId },
                      { onError: notifyMutationError(`unregister ${option.name}`) },
                    )
                  }
                >
                  Unregister
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SelectionRulesSectionComponent({
  characterId,
  type,
}: {
  characterId: string;
  type: "Class" | "Species" | "Background" | "SubClass" | "Proficiency" | "Language" | "Alignment";
}) {
  const { data: selectionRulesData, isLoading, error } = useSelectionRuleDataModels(characterId, type);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError what={`the ${type.toLowerCase()} choices`} error={error} />;

  return (
    <div className="mb-2 border border-dashed rounded p-4">
      {selectionRulesData && (
        <div className="overflow-x-auto text-sm w-full">
          <h4>{type} Selection Rules</h4>
          {selectionRulesData.rules.map((rule: SelectionRuleDataModel) => (
            // 1 component per rule with its options and registration button

            <div key={rule.registrationSelectionRuleId}>
              <Separator className="my-4" />
              <div className="border border-dashed rounded p-4 my-2">
                <h5 className="text-sm font-semibold mb-1">
                  {rule.name} ({rule.type})
                </h5>
                <p className="text-xxs text-muted-foreground mb-2 break-all">
                  ID: {rule.registrationSelectionRuleId} | Registered: {rule.activeRegistration ? "Yes" : "No"}
                </p>

                <SelectionRulesSectionOptionsComponent
                  characterId={characterId}
                  selectionRuleId={rule.registrationSelectionRuleId}
                  parentRegistration={rule.registrationId}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CharacterClassesComponent({ characterId }: { characterId: string }) {
  const { data: characterClassesData, isLoading, error } = useCharacterClasses(characterId);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError what="the character's classes" error={error} />;

  return (
    <div>
      <h4>Character Classes</h4>
      {characterClassesData?.classes.length ? (
        <ul className="space-y-2">
          {characterClassesData.classes.map((characterClass: CharacterClass) => (
            <li key={characterClass.characterClassId}>
              <CharacterClassComponent characterId={characterId} characterClass={characterClass} />
            </li>
          ))}
        </ul>
      ) : (
        <SectionEmpty>No class yet. Pick one under Build | Selection Rules.</SectionEmpty>
      )}
    </div>
  );
}

function CharacterClassComponent({ characterId, characterClass }: { characterId: string; characterClass: CharacterClass }) {
  const updateClassLevelMutation = useUpdateClassLevelMutation(characterId, characterClass.characterClassId);
  const changeLevel = (newLevel: number) => {
    updateClassLevelMutation.mutate({ newLevel }, { onError: notifyMutationError(`change the ${characterClass.name} level`) });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span>
        {characterClass.name} (Level {characterClass.level}){characterClass.isPrimary ? " [Primary]" : ""}
      </span>
      <Button size="sm" onClick={() => changeLevel(characterClass.level + 1)} disabled={updateClassLevelMutation.isPending || characterClass.level >= 20}>
        Level Up
      </Button>
      <Button size="sm" onClick={() => changeLevel(characterClass.level - 1)} disabled={updateClassLevelMutation.isPending || characterClass.level <= 1}>
        Level Down
      </Button>
    </div>
  );
}

function CharacterSummary({ characterId }: { characterId: string }) {
  const { data: characterDetails, isLoading, error } = useCharacterDetails(characterId);

  if (isLoading) return <SectionLoading />;
  if (error) return <SectionError what="this character" error={error} />;

  const character = characterDetails?.character;

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row sm:justify-between">
      <dl className="grid flex-1 grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
        <dt className="text-muted-foreground">Id:</dt>
        <dd className="break-all">{characterId}</dd>
        <dt className="text-muted-foreground">Name:</dt>
        <dd>{character?.name}</dd>
        <dt className="text-muted-foreground">Level:</dt>
        <dd>{character?.level}</dd>
        <dt className="text-muted-foreground">Build:</dt>
        <dd>{character?.build}</dd>
        <dt className="text-muted-foreground">Portrait URL:</dt>
        <dd className="break-all">{character?.portraitUrl ?? <span className="text-muted-foreground">None</span>}</dd>
      </dl>
      {character?.portraitUrl && (
        <div className="shrink-0">
          <img src={character.portraitUrl} alt={`Portrait of ${character.name}`} className="h-32 w-32 object-cover rounded print:h-24 print:w-24" />
        </div>
      )}
    </div>
  );
}

function CharacterDetails({ id }: { id: string }) {
  return (
    <div className="container mx-auto px-4 mt-12 mb-12 print:m-0 print:max-w-none print:p-0">
      <CardWrapper className="print:border-0 print:p-0">
        <Card className="rounded-lg print:border-0 print:shadow-none">
          <CardHeader className="border-b">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 space-y-1.5">
                <CardTitle>Character Details</CardTitle>
                <CardDescription className="print:hidden">
                  This is a test page for viewing and editing character details through the API. This is by no means representative of the final UI.
                </CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => window.print()} className="print:hidden">
                <Printer aria-hidden="true" />
                Print
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <CharacterSummary characterId={id} />

            <Separator className="my-4" />

            <h2 className="mb-2">Character Sheet Data</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3 print:grid-cols-2 print:gap-2">
              <SheetSection title="Abilities" className="md:col-span-2 print:col-span-2">
                <AbilitiesComponent id={id} />
              </SheetSection>
              <SheetSection title="Saving Throws">
                <SavingThrowsComponent characterId={id} />
              </SheetSection>
              <SheetSection title="Skills">
                <SkillsComponent characterId={id} />
              </SheetSection>
              <SheetSection title="Features" className="md:col-span-2 print:col-span-2">
                <FeaturesComponent characterId={id} />
              </SheetSection>
              <SheetSection title="Statistics" className="md:col-span-2 xl:col-span-3 print:col-span-2">
                <StatisticsComponent characterId={id} />
              </SheetSection>
            </div>

            <div className="print:hidden">
              <Separator className="my-4" />

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12">
                  <h5>Actions | Commands</h5>
                </div>
                <Tabs defaultValue="tab-actions-1" className="col-span-12">
                  <TabsList className="h-auto flex-wrap justify-start">
                    <TabsTrigger value="tab-actions-1">Class Details</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab-actions-1">
                    <div className="border border-dashed rounded p-4 my-2">
                      <CharacterClassesComponent characterId={id} />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              <Separator className="my-4" />

              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-12">
                  <h5>Build | Selection Rules</h5>
                </div>
                <Tabs defaultValue="tab-selection-rules-class" className="col-span-12">
                  <TabsList className="h-auto flex-wrap justify-start">
                    <TabsTrigger value="tab-selection-rules-class">Character Class</TabsTrigger>
                    <TabsTrigger value="tab-selection-rules-race">Character Origin</TabsTrigger>
                    <TabsTrigger value="tab-selection-rules-proficiency">Proficiency</TabsTrigger>
                    <TabsTrigger value="tab-selection-rules-language">Language</TabsTrigger>
                    <TabsTrigger value="tab-selection-rules-alignment">Alignment</TabsTrigger>
                  </TabsList>
                  <TabsContent value="tab-selection-rules-class">
                    <SelectionRulesSectionComponent characterId={id} type="Class" />
                    <SelectionRulesSectionComponent characterId={id} type="SubClass" />
                  </TabsContent>
                  <TabsContent value="tab-selection-rules-race">
                    <SelectionRulesSectionComponent characterId={id} type="Species" />
                    <SelectionRulesSectionComponent characterId={id} type="Background" />
                  </TabsContent>
                  <TabsContent value="tab-selection-rules-proficiency">
                    <SelectionRulesSectionComponent characterId={id} type="Proficiency" />
                  </TabsContent>
                  <TabsContent value="tab-selection-rules-language">
                    <SelectionRulesSectionComponent characterId={id} type="Language" />
                  </TabsContent>
                  <TabsContent value="tab-selection-rules-alignment">
                    <SelectionRulesSectionComponent characterId={id} type="Alignment" />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardWrapper>
    </div>
  );
}

export default function CharactersDetailsPage() {
  const { id } = useParams<{ id: string }>();

  if (!id) return <div>Character ID is required.</div>;

  return <CharacterDetails id={id} />;
}
