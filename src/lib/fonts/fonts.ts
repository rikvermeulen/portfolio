/* istanbul ignore file */

// We are not testing this file because when using `next/font/local`
// the tests will fail because of a bug https://github.com/vercel/next.js/issues/55616

import { Inter } from "next/font/google";

/**
 * @next/font will optimize your fonts and remove external network requests
 * @see  https://nextjs.org/docs/app/building-your-application/optimizing/fonts
 */

export const fontInter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
