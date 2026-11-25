import { GITLAB_PROFILE_URL } from "./client.ts";
import { getGitLabActivityResult } from "./service.ts";

const mockEnv = { GITLAB_TOKEN: "test-token" as string | undefined };

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

const TODAY = new Date("2026-11-05T12:00:00Z");

const eventsResponse = (
  events: readonly unknown[],
  totalPages: number,
  status = 200,
): Response =>
  new Response(JSON.stringify(events), {
    status,
    headers: {
      "content-type": "application/json",
      "x-total-pages": String(totalPages),
    },
  });

describe("getGitLabActivityResult", () => {
  beforeEach(() => {
    jest.restoreAllMocks();
    jest.spyOn(console, "error").mockImplementation(() => undefined);
    mockEnv.GITLAB_TOKEN = "test-token";
  });

  it("fetches every page of events and counts them by kind", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(
        eventsResponse([{ action_name: "pushed to", target_type: null }], 2),
      )
      .mockResolvedValueOnce(
        eventsResponse(
          [{ action_name: "approved", target_type: "MergeRequest" }],
          2,
        ),
      );

    const result = await getGitLabActivityResult(TODAY);

    expect(result).toMatchObject({
      ok: true,
      data: {
        total: 2,
        shares: expect.arrayContaining([
          { kind: "pushes", count: 1 },
          { kind: "reviews", count: 1 },
        ]),
      },
    });

    const [firstUrl, firstInit] = fetchMock.mock.calls[0] ?? [];
    expect(String(firstUrl)).toBe(
      "https://gitlab.com/api/v4/users/19245500/events?after=2026-08-06&per_page=100&page=1",
    );
    expect(firstInit).toMatchObject({
      headers: { "PRIVATE-TOKEN": "test-token" },
    });
    expect(String(fetchMock.mock.calls[1]?.[0])).toContain("page=2");
    expect(GITLAB_PROFILE_URL).toBe("https://gitlab.com/rikvermeulen97");
  });

  it("returns a safe error instead of undercounting without a page count", async () => {
    const fetchMock = jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(new Response("[]", { status: 200 }));

    await expect(getGitLabActivityResult(TODAY)).resolves.toMatchObject({
      ok: false,
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("returns a safe error on a non-ok response", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(eventsResponse([], 1, 401));

    await expect(getGitLabActivityResult(TODAY)).resolves.toEqual({
      ok: false,
      errorMessage: "Could not load GitLab activity right now",
    });
  });

  it("returns a safe error without fetching when no token is set", async () => {
    mockEnv.GITLAB_TOKEN = undefined;
    const fetchMock = jest.spyOn(globalThis, "fetch");

    await expect(getGitLabActivityResult(TODAY)).resolves.toMatchObject({
      ok: false,
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("defaults to today's date", async () => {
    jest
      .spyOn(globalThis, "fetch")
      .mockResolvedValueOnce(eventsResponse([], 1));

    await expect(getGitLabActivityResult()).resolves.toMatchObject({
      ok: true,
    });
  });
});
