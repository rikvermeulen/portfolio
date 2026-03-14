import classnames from "./classnames.ts";

describe("classnames utility function", () => {
  it("concatenates basic string class names", () => {
    expect(classnames("btn", "btn-primary")).toBe("btn btn-primary");
  });

  it("handles conditional classes", () => {
    const isPrimary = true;
    expect(classnames("btn", isPrimary && "btn-primary")).toBe(
      "btn btn-primary",
    );
  });

  it("ignores falsy conditional classes", () => {
    const isPrimary = false;
    expect(classnames("btn", isPrimary && "btn-primary")).toBe("btn");
  });

  it("concatenates classes from arrays", () => {
    expect(classnames(["btn", "btn-large"], "text-center")).toBe(
      "btn btn-large text-center",
    );
  });

  it("flattens and concatenates nested array of classes", () => {
    expect(classnames(["btn", ["btn-primary", "active"]], "text-center")).toBe(
      "btn btn-primary active text-center",
    );
  });

  it("handles mixed conditional classes and arrays", () => {
    const isActive = false;
    expect(classnames(["btn", isActive ? "active" : null], "text-center")).toBe(
      "btn text-center",
    );
  });

  it("filters out undefined and null values", () => {
    expect(classnames("btn", null, undefined, "text-center")).toBe(
      "btn text-center",
    );
  });

  it("handles an empty input gracefully", () => {
    expect(classnames()).toBe("");
  });
});
