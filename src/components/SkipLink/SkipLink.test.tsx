/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import SkipLink from "./SkipLink.tsx";

// SkipLink now renders a glass `Button`; the glass material needs browser-only
// APIs, so stub it and assert on the anchor SkipLink is responsible for.
jest.mock("@/components/Glass/index.ts", () => ({
  __esModule: true,
  default: () => <div data-testid="glass" />,
}));

describe("SkipLink", () => {
  it("renders a link to the main landmark with default label", () => {
    render(<SkipLink />);

    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("href", "#main");
  });

  it("targets a custom landmark id", () => {
    render(<SkipLink targetId="content" />);

    expect(screen.getByRole("link")).toHaveAttribute("href", "#content");
  });

  it("renders custom link text", () => {
    render(<SkipLink>Skip to main content</SkipLink>);

    expect(
      screen.getByRole("link", { name: "Skip to main content" }),
    ).toBeInTheDocument();
  });

  it("applies the shared focus-ring utility", () => {
    render(<SkipLink />);

    expect(screen.getByRole("link")).toHaveClass("focus-ring");
  });
});
