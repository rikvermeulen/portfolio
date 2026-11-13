import { createClient } from "@supabase/supabase-js";

import { createSupabaseAdminClient } from "./admin.ts";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(() => ({ from: jest.fn() })),
}));

const mockEnv = {
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role" as string | undefined,
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

describe("createSupabaseAdminClient", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockEnv.SUPABASE_SERVICE_ROLE_KEY = "service-role";
  });

  it("creates a session-less client with the service-role key", () => {
    createSupabaseAdminClient();

    expect(createClient).toHaveBeenCalledWith(
      "https://test.supabase.co",
      "service-role",
      { auth: { persistSession: false } },
    );
  });

  it("throws when the service-role key is missing", () => {
    mockEnv.SUPABASE_SERVICE_ROLE_KEY = undefined;

    expect(createSupabaseAdminClient).toThrow(
      "SUPABASE_SERVICE_ROLE_KEY is missing.",
    );
  });
});
