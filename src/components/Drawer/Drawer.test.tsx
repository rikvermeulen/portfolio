/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { render, screen } from "@testing-library/react";

import { getSheetVariants } from "./Drawer.animate.ts";
import Drawer from "./Drawer.tsx";

// Glass leans on browser-only APIs (ResizeObserver, matchMedia, rAF); stub it so
// these tests exercise Drawer's own markup. The reduced-motion hook reads
// matchMedia too — pin it to a known value per suite instead.
jest.mock("@/components/Glass/index.ts", () => ({
  __esModule: true,
  default: () => <div data-testid="glass" />,
}));

const mockReduceMotion = jest.fn(() => false);
jest.mock("@/hooks/usePrefersReducedMotion/index.ts", () => ({
  // eslint-disable-next-line @eslint-react/no-unnecessary-use-prefix -- mocks the real hook by name
  usePrefersReducedMotion: () => mockReduceMotion(),
}));

const baseProps = {
  isOpen: true,
  onOpenChange: () => undefined,
  title: "Settings",
};

describe("Drawer", () => {
  afterEach(() => mockReduceMotion.mockReturnValue(false));

  it("renders nothing while closed", () => {
    render(
      <Drawer {...baseProps} isOpen={false}>
        <p>Body</p>
      </Drawer>,
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByText("Body")).not.toBeInTheDocument();
  });

  it("renders the sheet with its children when open", () => {
    render(
      <Drawer {...baseProps}>
        <p>Body</p>
      </Drawer>,
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Body")).toBeInTheDocument();
    expect(screen.getByTestId("glass")).toBeInTheDocument();
  });

  it("renders the default title/description block and labels the dialog by it", () => {
    render(
      <Drawer {...baseProps} description="Manage your account">
        <p>Body</p>
      </Drawer>,
    );

    const heading = screen.getByText("Settings");
    expect(heading).toBeInTheDocument();
    expect(screen.getByText("Manage your account")).toBeInTheDocument();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute(
      "aria-labelledby",
      heading.getAttribute("id"),
    );
    expect(dialog).not.toHaveAttribute("aria-label");
  });

  it("omits the description paragraph when none is given", () => {
    render(
      <Drawer {...baseProps}>
        <p>Body</p>
      </Drawer>,
    );

    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(
      screen.getByRole("dialog").querySelectorAll("header p"),
    ).toHaveLength(1);
  });

  it("renders a custom header and labels the dialog with the title instead", () => {
    render(
      <Drawer {...baseProps} header={<span>Custom header</span>}>
        <p>Body</p>
      </Drawer>,
    );

    expect(screen.getByText("Custom header")).toBeInTheDocument();
    // The default title block is replaced, so the title only survives as the label.
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveAttribute("aria-label", "Settings");
    expect(dialog).not.toHaveAttribute("aria-labelledby");
  });

  it("renders a footer only when one is provided", () => {
    const { rerender } = render(
      <Drawer {...baseProps}>
        <p>Body</p>
      </Drawer>,
    );
    expect(screen.queryByText("Save")).not.toBeInTheDocument();

    rerender(
      <Drawer {...baseProps} footer={<button type="button">Save</button>}>
        <p>Body</p>
      </Drawer>,
    );
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
  });

  it("merges a custom className onto the sheet surface", () => {
    render(
      <Drawer {...baseProps} className="custom-sheet">
        <p>Body</p>
      </Drawer>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveClass("custom-sheet");
    expect(dialog).toHaveClass("rounded-tile");
  });
});

describe("getSheetVariants", () => {
  it("slides in from the bottom with default motion", () => {
    expect(getSheetVariants(false)).toEqual({
      initial: { y: "100%" },
      animate: { y: 0 },
      exit: { y: "100%" },
    });
  });

  it("fades in place when reduced motion is preferred", () => {
    expect(getSheetVariants(true)).toEqual({
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    });
  });
});
