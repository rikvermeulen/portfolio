import { isExternalUrl } from "./isExternalUrl.ts";

const BASE = "https://yourdomain.com";

describe("isExternalUrl", () => {
  test("returns true for external URLs", () => {
    expect(isExternalUrl("https://google.com", BASE)).toBe(true);
    expect(isExternalUrl("http://example.org", BASE)).toBe(true);
    expect(isExternalUrl("https://yourdomain.com.evil.com", BASE)).toBe(true);
  });

  test("returns false for URLs with subdomains of the base domain", () => {
    expect(isExternalUrl("https://www.yourdomain.com/about", BASE)).toBe(false);
    expect(isExternalUrl("https://blog.yourdomain.com", BASE)).toBe(false);
  });

  test("returns true for URLs with similar domains", () => {
    expect(isExternalUrl("https://notyourdomain.com", BASE)).toBe(true);
    expect(isExternalUrl("https://yourdomain.net", BASE)).toBe(true);
  });

  test("returns false for internal URLs", () => {
    expect(isExternalUrl("https://yourdomain.com/about", BASE)).toBe(false);
    expect(isExternalUrl("/about", BASE)).toBe(false);
  });

  test("handles empty, null, and undefined hrefs", () => {
    expect(isExternalUrl("", BASE)).toBe(false);
    expect(isExternalUrl("not a url", BASE)).toBe(false);
    expect(isExternalUrl("http://", BASE)).toBe(false);
  });

  test("handles URLs without http/https", () => {
    expect(isExternalUrl("ftp://example.com", BASE)).toBe(false);
    expect(isExternalUrl("mailto:someone@example.com", BASE)).toBe(false);
  });

  test("handles URLs with single-part hostnames", () => {
    expect(isExternalUrl("http://localhost", BASE)).toBe(true);
    expect(isExternalUrl("http://com", BASE)).toBe(true);
    expect(isExternalUrl("https://localhost", BASE)).toBe(true);
  });

  test("handles mailto, tel, and anchor references properly", () => {
    expect(isExternalUrl("mailto:someone@example.com", BASE)).toBe(false);
    expect(isExternalUrl("tel:+1234567890", BASE)).toBe(false);
    expect(isExternalUrl("#", BASE)).toBe(false);
  });
});
