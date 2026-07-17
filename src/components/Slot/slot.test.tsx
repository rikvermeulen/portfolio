/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";

import { render } from "@testing-library/react";

import { Slot } from "./index.ts";

describe("Slot", () => {
  it("should merge parent props with child element props", () => {
    const { getByText } = render(
      <Slot className="slot-class">
        <div className="child-class">Child content</div>
      </Slot>,
    );

    const child = getByText("Child content");
    expect(child).toHaveClass("slot-class", "child-class");
  });

  it("should return null for invalid children", () => {
    // @ts-expect-error - we want to test the invalid child case
    const { container } = render(<Slot>not a valid element</Slot>);

    expect(container.firstChild).toBeNull();
  });

  it("should forward ref to child element", () => {
    let node: HTMLDivElement | null = null;

    render(
      <Slot
        ref={(el) => {
          node = el as HTMLDivElement | null;
        }}
      >
        <div>Child content</div>
      </Slot>,
    );

    expect(node).toBeInstanceOf(HTMLDivElement);
  });

  it("should handle single child element correctly", () => {
    const { getByText } = render(
      <Slot className="slot-class">
        <div>Single child</div>
      </Slot>,
    );

    const child = getByText("Single child");
    expect(child).toHaveClass("slot-class");
  });

  it("should preserve child props when merging", () => {
    const { getByText } = render(
      <Slot data-testid="slot" className="slot-class">
        <div id="child-id" data-testid="child" className="child-class">
          Child content
        </div>
      </Slot>,
    );

    const child = getByText("Child content");
    expect(child).toHaveClass("slot-class", "child-class");
    expect(child).toHaveAttribute("data-testid", "child");
    expect(child).toHaveAttribute("id", "child-id");
  });
});
