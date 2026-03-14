import { env } from "@env";

const getDomain = (hostname: string) => {
  const parts = hostname.split(".").reverse();

  if (parts.length >= 2) {
    return `${parts[1]}.${parts[0]}`;
  }

  return hostname;
};

/**
 * Checks if a given URL is external.
 *
 * @param {string | null | undefined} href - The URL to check.
 * @returns {boolean} `true` if the URL is external, otherwise `false`.
 */
export const isExternalUrl = (href: string) => {
  if (!href) {
    return false;
  }

  const baseUrl = env.NEXT_PUBLIC_APP_URL;

  try {
    const url = new URL(href, baseUrl);
    const base = new URL(baseUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    const urlDomain = getDomain(url.hostname);
    const baseDomain = getDomain(base.hostname);

    return urlDomain !== baseDomain;
  } catch {
    console.error(`Invalid URL: ${href}`);
    return false;
  }
};
