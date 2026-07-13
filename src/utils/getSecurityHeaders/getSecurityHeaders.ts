import crypto from "crypto";

import type {
  CspConfig,
  CspHeaderKey,
  FullCspConfig,
  NextConfigSecurityHeaders,
  ResponseSecurityHeaders,
  SecurityHeaderKey,
  SecurityHeadersConfig,
} from "./getSecurityHeaders.types.ts";

import {
  NONE,
  SELF,
  STRICT_DYNAMIC,
  UNSAFE_EVAL,
  UNSAFE_INLINE,
} from "./getSecurityHeaders.const.ts";

const baseCspConfig: FullCspConfig = {
  "base-uri": [NONE],
  "child-src": [NONE],
  "connect-src": [SELF],
  "default-src": [SELF],
  "font-src": [SELF],
  "form-action": [SELF],
  "frame-ancestors": [NONE],
  "frame-src": [NONE],
  "img-src": [SELF],
  "manifest-src": [SELF],
  "media-src": [SELF],
  "object-src": [NONE],
  "script-src": [SELF],
  "style-src": [SELF],
  "worker-src": [SELF],
};

const disallowedStaticStrings: string[] = [
  "'self'",
  "'none'",
  "'unsafe-inline'",
  "'unsafe-eval'",
  "'strict-dynamic'",
];

/**
 * Converts a CSP value from a string or symbol to its corresponding string representation.
 */
export function getCspValue(value: string | symbol): string {
  if (typeof value === "string") {
    if (disallowedStaticStrings.includes(value)) {
      throw new Error(
        `Use symbols from constants.ts instead of string ${value}`,
      );
    }
    return value;
  }
  switch (value) {
    case NONE:
      return "'none'";
    case SELF:
      return "'self'";
    case UNSAFE_INLINE:
      return "'unsafe-inline'";
    case UNSAFE_EVAL:
      return "'unsafe-eval'";
    case STRICT_DYNAMIC:
      return "'strict-dynamic'";
    default:
      return "";
  }
}

/**
 * Adds 'unsafe-inline' and 'unsafe-eval' to 'script-src' and 'unsafe-inline' to 'style-src' in development mode.
 */
function addDevelopmentCspHeaders(config: FullCspConfig): FullCspConfig {
  return Object.entries(config).reduce<FullCspConfig>((acc, [key, value]) => {
    const cspKey = key as CspHeaderKey;
    if (cspKey === "script-src") {
      return {
        ...acc,
        [cspKey]: [...value, UNSAFE_INLINE, UNSAFE_EVAL],
      };
    }
    if (cspKey === "style-src") {
      return {
        ...acc,
        [cspKey]: [...value, UNSAFE_INLINE],
      };
    }
    return acc;
  }, config);
}

/**
 * Creates a Content Security Policy header string from the given configuration.
 */
export function createCspHeader(config: CspConfig): string | null {
  const entries = Object.entries(config);
  if (entries.length === 0) {
    return null;
  }
  return entries
    .reduce<string[]>((acc, [key, value]) => {
      const cspKey = key as CspHeaderKey;
      const cspValues = value.map(getCspValue).join(" ");
      return acc.concat(`${cspKey} ${cspValues};`);
    }, [])
    .join(" ");
}

/**
 * Generates security headers based on the provided configuration.
 */
function getSecurityHeaders(
  config: SecurityHeadersConfig = {},
  format: "response" | "nextConfig" = "response",
): ResponseSecurityHeaders | NextConfigSecurityHeaders {
  const extendedConfig = {
    ...config,
    permissionsPolicy: {
      geolocation: "()",
      microphone: "()",
      camera: "()",
      usb: "()",
      fullscreen: "()",
      ...(config.permissionsPolicy || {}),
    },
  };

  const {
    isDevelopment = false,
    cspReportOnly = false,
    permissionsPolicy,
    nonceProperties = [],
    contentTypeOptions = "nosniff",
    frameOptions = "DENY",
    xssProtection = "1; mode=block",
    referrerPolicy = "no-referrer",
  } = extendedConfig;

  let cspConfig: FullCspConfig = {
    ...baseCspConfig,
    ...(config.cspConfig || {}),
  };

  if (isDevelopment) {
    cspConfig = addDevelopmentCspHeaders(cspConfig);
  }

  // In development mode, nonces are ignored due to 'unsafe-inline' and 'unsafe-eval'
  let nonce: string | null = null;
  if (!isDevelopment && nonceProperties.length > 0) {
    nonce = crypto.randomUUID();
    for (const prop of nonceProperties) {
      const propConfig = cspConfig[prop] || [];
      cspConfig = {
        ...cspConfig,
        [prop]: [`'nonce-${nonce}'`, ...propConfig],
      };
    }
  }

  const cspHeaderName: SecurityHeaderKey = cspReportOnly
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";
  const cspHeader = createCspHeader(cspConfig);

  type HeaderEntry = [SecurityHeaderKey | "X-Nonce", string];

  const rawEntries: [SecurityHeaderKey | "X-Nonce", string | null][] = [
    [cspHeaderName, cspHeader],
    ["X-Nonce", nonce],
    ["Referrer-Policy", referrerPolicy],
    [
      "Permissions-Policy",
      Object.entries(permissionsPolicy)
        .map(([feature, policy]) => `${feature}=${policy}`)
        .join(", "),
    ],
    ["X-Content-Type-Options", contentTypeOptions],
    ["X-Frame-Options", frameOptions],
    ["X-Xss-Protection", xssProtection],
  ];

  const entries = rawEntries.filter(
    (entry): entry is [SecurityHeaderKey | "X-Nonce", string] =>
      entry[1] !== null,
  ) as HeaderEntry[];

  if (format === "response") {
    return Object.fromEntries(entries) as ResponseSecurityHeaders;
  }

  // Return in Next.js config format
  return entries.map(([key, value]) => ({
    key,
    value,
  })) as NextConfigSecurityHeaders;
}

export { getSecurityHeaders };
