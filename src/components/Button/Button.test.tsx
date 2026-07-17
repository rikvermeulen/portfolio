/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { fireEvent, render, screen } from "@testing-library/react";

import Button from "./Button.tsx";

// The glass material relies on browser-only APIs (ResizeObserver, matchMedia,
// rAF); stub it so these tests exercise Button's own markup and behaviour.
jest.mock("@/components/Glass/index.ts", () => ({
  __esModule: true,
  default: () => <div data-testid="glass" />,
}));

describe("Button", () => {
  it("renders a native button with type=button by default", () => {
    render(<Button>Done</Button>);

    const button = screen.getByRole("button", { name: "Done" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("focus-ring", "rounded-full");
  });

  it("fires the click handler", () => {
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Done</Button>);

    fireEvent.click(screen.getByRole("button", { name: "Done" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("paints onto the child element with asChild", () => {
    render(
      <Button asChild>
        <a href="#main">Skip</a>
      </Button>,
    );

    const link = screen.getByRole("link", { name: "Skip" });
    expect(link).toHaveAttribute("href", "#main");
    expect(link).toHaveClass("focus-ring", "rounded-full");
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("renders the glass material behind the label", () => {
    render(<Button>Done</Button>);

    expect(screen.getByTestId("glass")).toBeInTheDocument();
    expect(screen.getByRole("button")).toHaveTextContent("Done");
  });

  it("paints a solid fill only for the prominent variant", () => {
    const { rerender } = render(<Button variant="glass">Done</Button>);
    expect(document.querySelector('[aria-hidden="true"]')).toBeNull();

    rerender(
      <Button tone="accent" variant="prominent">
        Done
      </Button>,
    );
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("can be disabled", () => {
    render(<Button disabled>Done</Button>);

    expect(screen.getByRole("button")).toBeDisabled();
  });
});
