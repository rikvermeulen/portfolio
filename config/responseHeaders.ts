/* eslint-disable no-restricted-properties -- validated env module / standalone scripts read process.env directly */

// Note :relative import paths needed because this is included in next.config.ts
import type {
  CspConfig,
  SecurityHeadersConfig,
} from "../src/utils/getSecurityHeaders/index.ts";

import {
  getSecurityHeaders,
  NONE,
  SELF,
  UNSAFE_EVAL,
  UNSAFE_INLINE,
} from "../src/utils/getSecurityHeaders/index.ts";

const getScriptSrc = () => {
  // In next 15 we need to allow unsafe-eval in develompent to make sure HMR works:
  // https://community.vercel.com/t/create-a-note-in-csp-documentation-regarding-unsafe-eval-locally/3066
  // https://chris.lu/web_development/tutorials/next-js-static-first-mdx-starterkit/content-security-policy
  if (process.env.NODE_ENV === "development") {
    return [SELF, UNSAFE_INLINE, UNSAFE_EVAL, "https://sdk.scdn.co"];
  }

  return [SELF, UNSAFE_INLINE, "https://sdk.scdn.co"];
};

const cspConfig: CspConfig = {
  "connect-src": [
    SELF,
    "https://*.mapbox.com",
    "https://tile.openstreetmap.org",
    "https://api.spotify.com",
    "https://accounts.spotify.com",
    "wss://*.spotify.com",
  ],
  "default-src": [SELF],
  "font-src": [SELF],
  "form-action": [SELF],
  "frame-ancestors": [NONE],
  "frame-src": ["https://*.scdn.co"],
  "img-src": [
    SELF,
    "data:",
    "blob:",
    "https://*.mapbox.com",
    "https://tile.openstreetmap.org",
    "https://*.scdn.co",
    "https://*.steamstatic.com",
    "https://*.s-microsoft.com",
    "https://*.xboxlive.com",
  ],
  "manifest-src": [SELF],
  "media-src": [SELF, "https://*.scdn.co", "https://*.spotifycdn.com"],
  "object-src": [NONE],
  "script-src": getScriptSrc(),
  "style-src": [SELF, UNSAFE_INLINE],
  "worker-src": [SELF, "blob:"],
};

const securityHeadersConfig: SecurityHeadersConfig = {
  cspConfig,
  contentTypeOptions: "nosniff",
  permissionsPolicy: {
    geolocation: "()",
    microphone: "()",
    camera: "()",
    usb: "()",
    fullscreen: "()",
  },
  frameOptions: "DENY",
  xssProtection: "1; mode=block",
  referrerPolicy: "no-referrer",
};

const nextSecurityHeaders = getSecurityHeaders(
  securityHeadersConfig,
  "nextConfig",
) as { key: string; value: string }[];

export { nextSecurityHeaders };
