/**
 * Checks whether `href` points outside the site rooted at `baseUrl`.
 *
 * Pure and project-agnostic: the caller supplies `baseUrl` (e.g. the app's
 * public origin) rather than the util reaching into env. A URL is considered
 * internal when its host equals the base host or is a subdomain of it, so
 * `yourdomain.com` and `www.yourdomain.com` are internal while
 * `yourdomain.com.evil.com` is not.
 *
 * @param {string} href - The URL to check (absolute, relative, or a non-web scheme like `mailto:`).
 * @param {string} baseUrl - Absolute URL whose host defines "internal".
 * @returns {boolean} `true` when `href` is an http(s) URL on a different host, otherwise `false`.
 */
export const isExternalUrl = (href: string, baseUrl: string): boolean => {
  if (!href) {
    return false;
  }

  try {
    const url = new URL(href, baseUrl);
    const base = new URL(baseUrl);

    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return false;
    }

    const host = url.hostname;
    const baseHost = base.hostname;

    return host !== baseHost && !host.endsWith(`.${baseHost}`);
  } catch {
    return false;
  }
};
