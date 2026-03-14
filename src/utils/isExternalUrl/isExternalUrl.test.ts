import { isExternalUrl } from "./isExternalUrl.ts";

jest.mock("@env", () => ({
  env: {
    NEXT_PUBLIC_APP_URL: "https://yourdomain.com",
  },
}));

describe("isExternalUrl", () => {
  test("returns true for external URLs", () => {
    expect(isExternalUrl("https://google.com")).toBe(true);
    expect(isExternalUrl("http://example.org")).toBe(true);
    expect(isExternalUrl("https://yourdomain.com.evil.com")).toBe(true);
  });

  test("returns false for URLs with subdomains of the base domain", () => {
    expect(isExternalUrl("https://www.yourdomain.com/about")).toBe(false);
    expect(isExternalUrl("https://blog.yourdomain.com")).toBe(false);
  });

  test("returns true for URLs with similar domains", () => {
    expect(isExternalUrl("https://notyourdomain.com")).toBe(true);
    expect(isExternalUrl("https://yourdomain.net")).toBe(true);
  });

  test("returns false for internal URLs", () => {
    expect(isExternalUrl("https://yourdomain.com/about")).toBe(false);
    expect(isExternalUrl("/about")).toBe(false);
  });

  test("handles empty, null, and undefined hrefs", () => {
    expect(isExternalUrl("")).toBe(false);
    expect(isExternalUrl("not a url")).toBe(false);
    expect(isExternalUrl("http://")).toBe(false);
  });

  test("handles URLs without http/https", () => {
    expect(isExternalUrl("ftp://example.com")).toBe(false);
    expect(isExternalUrl("mailto:someone@example.com")).toBe(false);
  });

  test("handles URLs with single-part hostnames", () => {
    expect(isExternalUrl("http://localhost")).toBe(true);
    expect(isExternalUrl("http://com")).toBe(true);
    expect(isExternalUrl("https://localhost")).toBe(true);
  });

  test("handles mailto, tel, and anchor references properly", () => {
    expect(isExternalUrl("mailto:someone@example.com")).toBe(false);
    expect(isExternalUrl("tel:+1234567890")).toBe(false);
    expect(isExternalUrl("#")).toBe(false);
  });
});
