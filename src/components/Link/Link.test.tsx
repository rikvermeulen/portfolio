/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import Link from "./Link.tsx";

// Icon pulls in `.svg?react` imports that Jest's transform can't resolve; the
// external-link arrow is decorative and irrelevant to these assertions.
jest.mock("@/components/Icon/index.ts", () => ({
  __esModule: true,
  default: () => null,
}));

// `@env` resolves to the t3-env module (ESM, untransformed by Jest). Stub it
// with the origin isExternalUrl needs to classify same-host vs external.
jest.mock("@env", () => ({
  env: { NEXT_PUBLIC_APP_URL: "https://rikvermeulen.com" },
}));

describe("Link", () => {
  it("renders an internal link without a new-tab target or cue", () => {
    render(<Link href="/about">About</Link>);

    const link = screen.getByRole("link", { name: "About" });
    expect(link).not.toHaveAttribute("target");
    expect(screen.queryByText(/opens in new tab/i)).not.toBeInTheDocument();
  });

  it("opens external links in a new tab with a safe rel and a screen-reader cue", () => {
    render(<Link href="https://example.com">Example</Link>);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("rel")).toContain("noopener");
    expect(screen.getByText(/opens in new tab/i)).toBeInTheDocument();
  });

  it("adds the new-tab cue even when children are not plain text", () => {
    render(
      <Link href="https://example.com">
        <span>Icon</span>
      </Link>,
    );

    expect(screen.getByText(/opens in new tab/i)).toBeInTheDocument();
  });
});
