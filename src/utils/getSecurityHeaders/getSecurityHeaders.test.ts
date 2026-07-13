import type {
  ResponseSecurityHeaders,
  SecurityHeadersConfig,
} from "./getSecurityHeaders.types.ts";

import { SELF, STRICT_DYNAMIC } from "./getSecurityHeaders.const.ts";
import {
  createCspHeader,
  getCspValue,
  getSecurityHeaders,
} from "./getSecurityHeaders.ts";

const baseHeaderResponse = {
  "Permissions-Policy":
    "geolocation=(), microphone=(), camera=(), usb=(), fullscreen=()",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-Xss-Protection": "1; mode=block",
};

describe("getSecurityHeaders", () => {
  test("should return valid default headers", () => {
    const headers = getSecurityHeaders() as ResponseSecurityHeaders;
    expect(headers).toEqual({
      "Content-Security-Policy":
        "base-uri 'none'; child-src 'none'; connect-src 'self'; default-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self'; manifest-src 'self'; media-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; worker-src 'self';",
      ...baseHeaderResponse,
    });
  });

  test("should return valid csp headers with nonce", () => {
    const headers = getSecurityHeaders({
      nonceProperties: ["script-src", "style-src"],
    }) as ResponseSecurityHeaders;

    expect(headers).toEqual({
      "Content-Security-Policy": expect.any(String),
      "X-Nonce": expect.any(String),
      ...baseHeaderResponse,
    });

    const nonce = headers["X-Nonce"] as string;

    expect(headers["Content-Security-Policy"]).toContain(
      `script-src 'nonce-${nonce}'`,
    );
    expect(headers["Content-Security-Policy"]).toContain(
      `style-src 'nonce-${nonce}'`,
    );
  });

  test("should only accept symbols for self, none, unsafe-eval and unsafe-inline properties", () => {
    expect(() => {
      getSecurityHeaders({
        cspConfig: {
          "script-src": ["'self'", "cdn.jsdelivr.net"],
          "style-src": ["'self'", "cdn.jsdelivr.net"],
        },
        nonceProperties: ["script-src", "style-src"],
        cspReportOnly: true,
      });
    }).toThrow(`Use symbols from constants.ts instead of string 'self'`);
  });

  test("createCspHeader should return null when cspConfig is empty", () => {
    const cspHeader = createCspHeader({});
    expect(cspHeader).toBeNull();
  });

  test("getCspValue should return empty string for unknown symbols", () => {
    const unknownSymbol = Symbol("unknown");
    const result = getCspValue(unknownSymbol);
    expect(result).toBe("");
  });

  test("should return default headers when no configuration is provided", () => {
    const headers = getSecurityHeaders() as ResponseSecurityHeaders;
    expect(headers).toEqual({
      "Content-Security-Policy":
        "base-uri 'none'; child-src 'none'; connect-src 'self'; default-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self'; manifest-src 'self'; media-src 'self'; object-src 'none'; script-src 'self'; style-src 'self'; worker-src 'self';",
      ...baseHeaderResponse,
    });
  });

  test("should handle multiple permissions policies correctly", () => {
    const config: SecurityHeadersConfig = {
      permissionsPolicy: {
        geolocation: "*",
        microphone: "self",
        camera: "none",
      },
    };

    const headers = getSecurityHeaders(config) as ResponseSecurityHeaders;
    expect(headers["Permissions-Policy"]).toBe(
      "geolocation=*, microphone=self, camera=none, usb=(), fullscreen=()",
    );
  });

  test("should handle nonceProperties with cspConfig properties set to undefined", () => {
    const config: SecurityHeadersConfig = {
      cspConfig: {
        "script-src": undefined,
      },
      nonceProperties: ["script-src"],
    };

    const headers = getSecurityHeaders(config) as ResponseSecurityHeaders;

    expect(headers["X-Nonce"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
    );

    expect(headers["Content-Security-Policy"]).toContain(
      `script-src 'nonce-${headers["X-Nonce"]}'`,
    );

    expect(headers["Content-Security-Policy"]).not.toContain(
      "base-uri 'none'; child-src 'none'; connect-src 'self'; default-src 'self'; font-src 'self'; form-action 'self'; frame-ancestors 'none'; frame-src 'none'; img-src 'self'; manifest-src 'self'; media-src 'self'; object-src 'none'; script-src 'nonce-dd2972ac-2fbc-48b1-afd9-8e8e07fd2395'; style-src 'self'; worker-src 'self';",
    );
  });
  test("should include 'strict-dynamic' in CSP when STRICT_DYNAMIC is used", () => {
    const config: SecurityHeadersConfig = {
      cspConfig: {
        "script-src": [SELF, STRICT_DYNAMIC],
        "style-src": [SELF],
      },
    };

    const headers = getSecurityHeaders(config) as ResponseSecurityHeaders;

    expect(headers["Content-Security-Policy"]).toContain("'strict-dynamic'");
    expect(headers["Content-Security-Policy"]).toContain("'self'");
  });

  test("should return valid csp headers with nonce and custom csp in all formats", () => {
    const config: SecurityHeadersConfig = {
      cspConfig: {
        "script-src": [SELF, "cdn.jsdelivr.net"],
        "style-src": [SELF, "cdn.jsdelivr.net"],
      },
      nonceProperties: ["script-src", "style-src"],
      cspReportOnly: true,
      frameOptions: "SAMEORIGIN",
      permissionsPolicy: {
        geolocation: "*",
      },
      xssProtection: "0",
      referrerPolicy: "origin",
    };

    const responseHeaders = getSecurityHeaders(
      config,
    ) as ResponseSecurityHeaders;

    expect(responseHeaders).toEqual({
      "Content-Security-Policy-Report-Only": expect.any(String),
      "X-Nonce": expect.any(String),
      "Permissions-Policy":
        "geolocation=*, microphone=(), camera=(), usb=(), fullscreen=()",
      "Referrer-Policy": "origin",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "X-Xss-Protection": "0",
    });

    const nextjsConfigHeaders = getSecurityHeaders(config, "nextConfig") as {
      key: string;
      value: string;
    }[];

    expect(nextjsConfigHeaders).toEqual([
      {
        key: "Content-Security-Policy-Report-Only",
        value: expect.any(String),
      },
      {
        key: "X-Nonce",
        value: expect.any(String),
      },
      {
        key: "Referrer-Policy",
        value: "origin",
      },
      {
        key: "Permissions-Policy",
        value: "geolocation=*, microphone=(), camera=(), usb=(), fullscreen=()",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "X-Xss-Protection",
        value: "0",
      },
    ]);
  });

  test("should add development csp headers when isDevelopment is true", () => {
    const headers = getSecurityHeaders({
      isDevelopment: true,
    }) as ResponseSecurityHeaders;

    expect(headers).toEqual({
      "Content-Security-Policy": expect.any(String),
      ...baseHeaderResponse,
    });

    const cspHeader = headers["Content-Security-Policy"] as string;

    expect(cspHeader).toContain("'unsafe-inline'");
    expect(cspHeader).toContain("'unsafe-eval'");
    expect(headers["X-Nonce"]).toBeUndefined();
  });
});
