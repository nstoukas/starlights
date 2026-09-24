import { stubApi } from "@/test/api-stub";
import { builderQueryKeys, characterQueryKeys } from "@starlights/api-client";
import { QueryClient, QueryClientProvider, type QueryKey } from "@tanstack/react-query";
import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useUpdateAdditionalAbilityScore, useUpdateBaseAbilityScore } from "./queries";

const characterId = "char-1";

function setup<T>(useHook: (characterId: string) => T) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  const wrapper = ({ children }: { children: ReactNode }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  const { result } = renderHook(() => useHook(characterId), { wrapper });
  const invalidatedKeys = () => invalidate.mock.calls.map(([filters]) => filters?.queryKey as QueryKey);
  return { result, invalidatedKeys };
}

const scoreResponse = {
  id: "row-str",
  abilityScoreId: "str",
  name: "Strength",
  abbreviation: "STR",
  baseScore: 16,
  additionalScore: 0,
  calculatedScore: 16,
  calculatedModifier: 3,
};

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe.each([
  { hook: useUpdateBaseAbilityScore, name: "useUpdateBaseAbilityScore", segment: "base" },
  { hook: useUpdateAdditionalAbilityScore, name: "useUpdateAdditionalAbilityScore", segment: "additional" },
])("$name", ({ hook, segment }) => {
  const endpoint = `/api/characters/${characterId}/ability-scores/str/${segment}`;

  it("posts the new value to the ability score endpoint", async () => {
    // Arrange
    const { requests } = stubApi({ [`POST ${endpoint}`]: { body: scoreResponse } });
    const { result } = setup(hook);

    // Act
    await act(() => result.current.mutateAsync({ abilityScoreId: "str", value: 16 }));

    // Assert
    expect(requests).toEqual([{ method: "POST", path: endpoint, body: { value: 16 } }]);
  });

  it("refreshes the ability scores right away", async () => {
    // Arrange
    stubApi({ [`POST ${endpoint}`]: { body: scoreResponse } });
    const { result, invalidatedKeys } = setup(hook);

    // Act
    await act(() => result.current.mutateAsync({ abilityScoreId: "str", value: 16 }));

    // Assert
    expect(invalidatedKeys()).toEqual([characterQueryKeys.abilityScores(characterId)]);
  });

  it("refreshes saving throws, skills and statistics one second later, once the server has recalculated", async () => {
    // Arrange
    stubApi({ [`POST ${endpoint}`]: { body: scoreResponse } });
    const { result, invalidatedKeys } = setup(hook);
    await act(() => result.current.mutateAsync({ abilityScoreId: "str", value: 16 }));

    // Act
    act(() => {
      vi.advanceTimersByTime(999);
    });
    const beforeTheDelay = invalidatedKeys();
    act(() => {
      vi.advanceTimersByTime(1);
    });

    // Assert
    expect(beforeTheDelay, "nothing but the ability scores refresh before the delay").toHaveLength(1);
    expect(invalidatedKeys()).toEqual(
      expect.arrayContaining([
        characterQueryKeys.savingThrows(characterId),
        characterQueryKeys.skills(characterId),
        builderQueryKeys.statistics(characterId),
      ]),
    );
  });

  it("refreshes nothing when the server rejects the change", async () => {
    // Arrange
    stubApi({ [`POST ${endpoint}`]: { status: 400, statusText: "Bad Request", body: "invalid score" } });
    const { result, invalidatedKeys } = setup(hook);

    // Act
    await act(async () => {
      await expect(result.current.mutateAsync({ abilityScoreId: "str", value: 99 })).rejects.toThrow("HTTP 400 Bad Request");
    });
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Assert
    expect(invalidatedKeys()).toEqual([]);
  });
});
