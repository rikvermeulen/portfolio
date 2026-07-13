export type CspHeaderKey =
  | "base-uri"
  | "child-src"
  | "connect-src"
  | "default-src"
  | "font-src"
  | "form-action"
  | "frame-ancestors"
  | "frame-src"
  | "img-src"
  | "manifest-src"
  | "media-src"
  | "object-src"
  | "script-src"
  | "style-src"
  | "worker-src";

export type FullCspConfig = Record<CspHeaderKey, readonly (string | symbol)[]>;

export type SecurityHeaderKey =
  | "Content-Security-Policy"
  | "Content-Security-Policy-Report-Only"
  | "Referrer-Policy"
  | "Permissions-Policy"
  | "X-Nonce"
  | "X-Content-Type-Options"
  | "X-Frame-Options"
  | "X-Xss-Protection";

export type ResponseSecurityHeaders = Partial<
  Record<SecurityHeaderKey, string>
>;

export type NextConfigSecurityHeaders = {
  key: SecurityHeaderKey;
  value: string;
}[];

export type CspConfig = Partial<FullCspConfig>;

export interface SecurityHeadersConfig {
  isDevelopment?: boolean;
  cspConfig?: CspConfig;
  cspReportOnly?: boolean;
  nonceProperties?: CspHeaderKey[];
  contentTypeOptions?: "nosniff" | null;
  frameOptions?: "DENY" | "SAMEORIGIN";
  permissionsPolicy?: {
    [key: string]: string | undefined;
    geolocation?: string;
    microphone?: string;
    camera?: string;
    usb?: string;
    fullscreen?: string;
  };
  xssProtection?: string;
  referrerPolicy?:
    | "no-referrer"
    | "no-referrer-when-downgrade"
    | "same-origin"
    | "origin"
    | "strict-origin"
    | "origin-when-cross-origin"
    | "strict-origin-when-cross-origin"
    | "unsafe-url";
}
