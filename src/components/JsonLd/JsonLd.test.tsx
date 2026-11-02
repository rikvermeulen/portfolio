/**
 * @jest-environment jsdom
 */
import { render } from "@testing-library/react";

import JsonLd from "./JsonLd.tsx";

describe("JsonLd", () => {
  it("escapes < so a value cannot close the script tag", () => {
    const { container } = render(
      <JsonLd data={{ name: "</script><script>alert(1)</script>" }} />,
    );
    const script = container.querySelector("script");

    expect(script?.innerHTML).not.toContain("</script>");
    expect(JSON.parse(script?.textContent ?? "")).toEqual({
      name: "</script><script>alert(1)</script>",
    });
  });
});
