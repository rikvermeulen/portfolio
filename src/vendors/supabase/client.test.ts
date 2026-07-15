import { createClient } from "@supabase/supabase-js";

import { createSupabaseClient } from "./client.ts";

jest.mock("@supabase/supabase-js", () => ({
  createClient: jest.fn(),
}));

const mockEnv = {
  SUPABASE_URL: "https://test.supabase.co",
  SUPABASE_ANON_KEY: "test-anon-key",
};

jest.mock("@env", () => ({
  get env() {
    return mockEnv;
  },
}));

describe("createSupabaseClient", () => {
  const mockCreateClient = createClient as jest.MockedFunction<
    typeof createClient
  >;
  const mockSupabaseClient = {
    auth: {},
    storage: {},
    from: jest.fn(),
  } as unknown as ReturnType<typeof createClient>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateClient.mockReturnValue(mockSupabaseClient);
    // Reset to default valid values
    mockEnv.SUPABASE_URL = "https://test.supabase.co";
    mockEnv.SUPABASE_ANON_KEY = "test-anon-key";
  });

  it("should create a Supabase client with valid environment variables", () => {
    // Arrange
    const expectedUrl = "https://test.supabase.co";
    const expectedKey = "test-anon-key";

    // Act
    const result = createSupabaseClient();

    // Assert
    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockCreateClient).toHaveBeenCalledWith(expectedUrl, expectedKey);
    expect(result).toBe(mockSupabaseClient);
  });

  it("should throw an error when SUPABASE_URL is missing", () => {
    // Arrange
    mockEnv.SUPABASE_URL = "";

    // Act & Assert
    expect(() => {
      createSupabaseClient();
    }).toThrow("Supabase URL and/or Anon Key are missing.");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error when SUPABASE_ANON_KEY is missing", () => {
    // Arrange
    mockEnv.SUPABASE_ANON_KEY = "";

    // Act & Assert
    expect(() => {
      createSupabaseClient();
    }).toThrow("Supabase URL and/or Anon Key are missing.");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error when both SUPABASE_URL and SUPABASE_ANON_KEY are missing", () => {
    // Arrange
    mockEnv.SUPABASE_URL = "";
    mockEnv.SUPABASE_ANON_KEY = "";

    // Act & Assert
    expect(() => {
      createSupabaseClient();
    }).toThrow("Supabase URL and/or Anon Key are missing.");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error when SUPABASE_URL is undefined", () => {
    // Arrange
    mockEnv.SUPABASE_URL = undefined as unknown as string;

    // Act & Assert
    expect(() => {
      createSupabaseClient();
    }).toThrow("Supabase URL and/or Anon Key are missing.");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should throw an error when SUPABASE_ANON_KEY is undefined", () => {
    // Arrange
    mockEnv.SUPABASE_ANON_KEY = undefined as unknown as string;

    // Act & Assert
    expect(() => {
      createSupabaseClient();
    }).toThrow("Supabase URL and/or Anon Key are missing.");
    expect(mockCreateClient).not.toHaveBeenCalled();
  });

  it("should return a new client instance on each call", () => {
    // Arrange
    const mockClient1 = { auth: {}, storage: {} } as unknown as ReturnType<
      typeof createClient
    >;
    const mockClient2 = { auth: {}, storage: {} } as unknown as ReturnType<
      typeof createClient
    >;
    mockCreateClient
      .mockReturnValueOnce(mockClient1)
      .mockReturnValueOnce(mockClient2);

    // Act
    const client1 = createSupabaseClient();
    const client2 = createSupabaseClient();

    // Assert
    expect(client1).toBe(mockClient1);
    expect(client2).toBe(mockClient2);
    expect(client1).not.toBe(client2);
    expect(mockCreateClient).toHaveBeenCalledTimes(2);
  });
});
