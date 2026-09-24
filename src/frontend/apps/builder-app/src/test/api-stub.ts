import { vi } from "vitest";

type StubResponse = { status?: number; statusText?: string; body?: unknown };
type Handler = StubResponse | ((request: { method: string; path: string; body: unknown }) => StubResponse | Promise<StubResponse>);

export type RecordedRequest = { method: string; path: string; body: unknown };

/**
 * Replaces the global fetch with a stub keyed by "METHOD /api/path" (query string included).
 * Unknown routes answer 404 so a missing stub shows up as a section error, not a hang.
 */
export function stubApi(routes: Record<string, Handler>) {
  const requests: RecordedRequest[] = [];

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const path = url.slice(url.indexOf("/api/"));
    const method = (init?.method ?? "GET").toUpperCase();
    const body = typeof init?.body === "string" ? JSON.parse(init.body) : undefined;
    const request = { method, path, body };
    requests.push(request);

    const handler = routes[`${method} ${path}`];
    const response = typeof handler === "function" ? await handler(request) : handler;
    if (!response) {
      return new Response(`No stub for ${method} ${path}`, { status: 404, statusText: "Not Found" });
    }

    const status = response.status ?? 200;
    if (status === 204 || response.body === undefined) {
      return new Response(null, { status, statusText: response.statusText });
    }
    return new Response(JSON.stringify(response.body), { status, statusText: response.statusText, headers: { "Content-Type": "application/json" } });
  });

  vi.stubGlobal("fetch", fetchMock);
  return { fetchMock, requests };
}
