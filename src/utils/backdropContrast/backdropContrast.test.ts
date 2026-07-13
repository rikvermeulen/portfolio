/**
 * @jest-environment jsdom
 */

import {
  contrastRatio,
  parseRgb,
  pickContrastColor,
  relativeLuminance,
} from "./backdropContrast.ts";

describe("parseRgb", () => {
  it("parses rgb() with a default alpha of 1", () => {
    expect(parseRgb("rgb(255, 128, 0)")).toEqual({
      r: 255,
      g: 128,
      b: 0,
      a: 1,
    });
  });

  it("parses rgba() and the modern slash syntax", () => {
    expect(parseRgb("rgba(0, 0, 0, 0.5)")).toEqual({
      r: 0,
      g: 0,
      b: 0,
      a: 0.5,
    });
    expect(parseRgb("rgb(10 20 30 / 0.25)")).toEqual({
      r: 10,
      g: 20,
      b: 30,
      a: 0.25,
    });
  });

  it("parses 3- and 6-digit hex", () => {
    expect(parseRgb("#000000")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
    expect(parseRgb("#fff")).toEqual({ r: 255, g: 255, b: 255, a: 1 });
    expect(parseRgb("#1d1d1f")).toEqual({ r: 29, g: 29, b: 31, a: 1 });
  });

  it("returns null for unparseable values", () => {
    expect(parseRgb("transparent")).toBeNull();
    expect(parseRgb("")).toBeNull();
  });
});

describe("relativeLuminance", () => {
  it("is 0 for black and 1 for white", () => {
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0);
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1);
  });

  it("weights green above red above blue", () => {
    const red = relativeLuminance({ r: 255, g: 0, b: 0 });
    const green = relativeLuminance({ r: 0, g: 255, b: 0 });
    const blue = relativeLuminance({ r: 0, g: 0, b: 255 });
    expect(green).toBeGreaterThan(red);
    expect(red).toBeGreaterThan(blue);
  });

  it("uses the linear segment for very dark channels", () => {
    expect(relativeLuminance({ r: 9, g: 9, b: 9 })).toBeGreaterThan(0);
    expect(relativeLuminance({ r: 9, g: 9, b: 9 })).toBeLessThan(
      relativeLuminance({ r: 20, g: 20, b: 20 }),
    );
  });
});

describe("contrastRatio", () => {
  it("is 21 for black on white and 1 for identical luminances", () => {
    expect(contrastRatio(0, 1)).toBeCloseTo(21);
    expect(contrastRatio(0.5, 0.5)).toBeCloseTo(1);
  });

  it("is order-independent", () => {
    expect(contrastRatio(0, 1)).toBeCloseTo(contrastRatio(1, 0));
  });
});

describe("pickContrastColor", () => {
  it("picks dark text on a light backdrop and white on a dark backdrop", () => {
    expect(pickContrastColor(1)).toBe("#000000"); // white backdrop
    expect(pickContrastColor(0)).toBe("#ffffff"); // black backdrop
  });

  it("honors custom candidates", () => {
    const light = "#f5f5f7";
    const dark = "#1d1d1f";
    expect(pickContrastColor(0.9, { light, dark })).toBe(dark);
    expect(pickContrastColor(0.05, { light, dark })).toBe(light);
  });

  it("uses fallback luminance when candidates are unparseable", () => {
    expect(pickContrastColor(1, { light: "nope", dark: "nope" })).toBe("nope");
    expect(pickContrastColor(0, { light: "nope", dark: "nope" })).toBe("nope");
  });
});

function mockRect(
  left: number,
  top: number,
  width: number,
  height: number,
): DOMRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
    x: left,
    y: top,
    toJSON: () => ({}),
  } as DOMRect;
}

function mockCanvasContext(
  r = 128,
  g = 128,
  b = 128,
  a = 255,
): CanvasRenderingContext2D {
  return {
    clearRect: jest.fn(),
    fillRect: jest.fn(),
    fillStyle: "",
    getImageData: jest.fn().mockReturnValue({
      data: new Uint8ClampedArray([r, g, b, a]),
    }),
  } as unknown as CanvasRenderingContext2D;
}

function installCanvasMock(ctx: CanvasRenderingContext2D | null): void {
  const realCreateElement = Document.prototype.createElement;
  jest.spyOn(document, "createElement").mockImplementation(function (
    this: Document,
    tag: string,
    options?: ElementCreationOptions,
  ) {
    const el = realCreateElement.call(this, tag, options);
    if (tag === "canvas") {
      jest.spyOn(el as HTMLCanvasElement, "getContext").mockReturnValue(ctx);
    }
    return el;
  });
}

describe("backdropLuminance", () => {
  let backdropLuminance: (el: Element, ignore?: Element | null) => number;

  beforeEach(async () => {
    jest.resetModules();
    installCanvasMock(mockCanvasContext(0, 0, 0, 255));
    ({ backdropLuminance } = await import("./backdropContrast.ts"));
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns 1 for zero-size elements", () => {
    const el = document.createElement("span");
    el.getBoundingClientRect = jest.fn().mockReturnValue(mockRect(0, 0, 0, 0));
    expect(backdropLuminance(el)).toBe(1);
  });

  it("samples opaque backgrounds via the canvas resolver", () => {
    const bg = document.createElement("div");
    const target = document.createElement("span");
    target.getBoundingClientRect = jest
      .fn()
      .mockReturnValue(mockRect(10, 10, 80, 40));

    document.elementsFromPoint = jest.fn().mockReturnValue([target, bg]);
    jest.spyOn(window, "getComputedStyle").mockImplementation((node) => {
      if (node === bg) {
        return {
          backgroundImage: "none",
          backgroundColor: "rgb(0, 0, 0)",
          position: "static",
        } as CSSStyleDeclaration;
      }
      return {
        backgroundImage: "none",
        backgroundColor: "transparent",
        position: "static",
      } as CSSStyleDeclaration;
    });

    expect(backdropLuminance(target)).toBeCloseTo(0, 1);
  });

  it("defaults missing canvas pixel channels to zero", async () => {
    installCanvasMock({
      clearRect: jest.fn(),
      fillRect: jest.fn(),
      fillStyle: "",
      getImageData: jest.fn().mockReturnValue({ data: [] }),
    } as unknown as CanvasRenderingContext2D);
    jest.resetModules();
    const { backdropLuminance: sample } = await import("./backdropContrast.ts");

    const bg = document.createElement("div");
    const target = document.createElement("span");
    target.getBoundingClientRect = jest
      .fn()
      .mockReturnValue(mockRect(0, 0, 100, 40));

    document.elementsFromPoint = jest.fn().mockReturnValue([bg]);
    jest.spyOn(window, "getComputedStyle").mockImplementation((node) => {
      if (node === bg) {
        return {
          backgroundImage: "none",
          backgroundColor: "rgb(255, 0, 0)",
          position: "static",
        } as CSSStyleDeclaration;
      }
      return {
        backgroundImage: "none",
        backgroundColor: "transparent",
        position: "static",
      } as CSSStyleDeclaration;
    });

    expect(sample(target)).toBeCloseTo(1, 1);
  });

  it("averages gradient stops when background-image is a gradient", () => {
    const bg = document.createElement("div");
    const target = document.createElement("span");
    target.getBoundingClientRect = jest
      .fn()
      .mockReturnValue(mockRect(0, 0, 100, 40));

    document.elementsFromPoint = jest.fn().mockReturnValue([bg]);
    jest.spyOn(window, "getComputedStyle").mockImplementation((node) => {
      if (node === bg) {
        return {
          backgroundImage:
            "linear-gradient(to bottom, rgb(255, 0, 0), rgb(0, 0, 255))",
          backgroundColor: "transparent",
          position: "static",
        } as CSSStyleDeclaration;
      }
      return {
        backgroundImage: "none",
        backgroundColor: "transparent",
        position: "static",
      } as CSSStyleDeclaration;
    });

    expect(backdropLuminance(target)).toBeCloseTo(0, 1);
    // Second call hits the gradient cache.
    expect(backdropLuminance(target)).toBeCloseTo(0, 1);
  });

  it("skips transparent layers and composes translucent stacks over white", async () => {
    installCanvasMock(null);
    jest.resetModules();
    const { backdropLuminance: sample } = await import("./backdropContrast.ts");

    const transparent = document.createElement("div");
    const translucent = document.createElement("div");
    const target = document.createElement("span");
    target.getBoundingClientRect = jest
      .fn()
      .mockReturnValue(mockRect(0, 0, 100, 40));

    document.elementsFromPoint = jest
      .fn()
      .mockReturnValue([transparent, translucent, target]);
    jest.spyOn(window, "getComputedStyle").mockImplementation((node) => {
      if (node === transparent) {
        return {
          backgroundImage: "none",
          backgroundColor: "transparent",
          position: "static",
        } as CSSStyleDeclaration;
      }
      if (node === translucent) {
        return {
          backgroundImage: "none",
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          position: "static",
        } as CSSStyleDeclaration;
      }
      return {
        backgroundImage: "none",
        backgroundColor: "transparent",
        position: "static",
      } as CSSStyleDeclaration;
    });

    expect(sample(target)).toBeGreaterThan(0);
    expect(sample(target)).toBeLessThan(1);
  });

  it("skips elements inside the fixed overlay and finds the nearest fixed ancestor", () => {
    const backdrop = document.createElement("div");
    const fixed = document.createElement("div");
    const inner = document.createElement("div");
    const overlayChild = document.createElement("div");
    const target = document.createElement("span");
    backdrop.appendChild(fixed);
    fixed.appendChild(inner);
    inner.appendChild(target);
    fixed.appendChild(overlayChild);

    target.getBoundingClientRect = jest
      .fn()
      .mockReturnValue(mockRect(0, 0, 100, 40));

    document.elementsFromPoint = jest
      .fn()
      .mockReturnValue([overlayChild, target, fixed, backdrop]);
    jest.spyOn(window, "getComputedStyle").mockImplementation((node) => {
      if (node === fixed) {
        return { position: "fixed" } as CSSStyleDeclaration;
      }
      if (node === backdrop) {
        return {
          backgroundImage: "none",
          backgroundColor: "rgb(0, 0, 0)",
          position: "static",
        } as CSSStyleDeclaration;
      }
      if (node === overlayChild) {
        return {
          backgroundImage: "none",
          backgroundColor: "rgb(255, 255, 255)",
          position: "static",
        } as CSSStyleDeclaration;
      }
      return {
        backgroundImage: "none",
        backgroundColor: "transparent",
        position: "static",
      } as CSSStyleDeclaration;
    });

    expect(backdropLuminance(target)).toBeCloseTo(0, 1);
  });

  it("falls back to background-color when a gradient has no parseable stops", () => {
    installCanvasMock(null);
    jest.resetModules();
    return import("./backdropContrast.ts").then(
      ({ backdropLuminance: sample }) => {
        const bg = document.createElement("div");
        const target = document.createElement("span");
        target.getBoundingClientRect = jest
          .fn()
          .mockReturnValue(mockRect(0, 0, 100, 40));

        document.elementsFromPoint = jest.fn().mockReturnValue([bg]);
        jest.spyOn(window, "getComputedStyle").mockImplementation((node) => {
          if (node === bg) {
            return {
              backgroundImage: "linear-gradient(to bottom, red, blue)",
              backgroundColor: "rgb(255, 255, 255)",
              position: "static",
            } as CSSStyleDeclaration;
          }
          return {
            backgroundImage: "none",
            backgroundColor: "transparent",
            position: "static",
          } as CSSStyleDeclaration;
        });

        expect(sample(target)).toBeCloseTo(1, 1);
      },
    );
  });

  it("returns null from gradients whose stops cannot be resolved at all", () => {
    installCanvasMock(null);
    jest.resetModules();
    return import("./backdropContrast.ts").then(
      ({ backdropLuminance: sample }) => {
        const bg = document.createElement("div");
        const target = document.createElement("span");
        target.getBoundingClientRect = jest
          .fn()
          .mockReturnValue(mockRect(0, 0, 100, 40));

        document.elementsFromPoint = jest.fn().mockReturnValue([bg]);
        jest.spyOn(window, "getComputedStyle").mockImplementation((node) => {
          if (node === bg) {
            return {
              backgroundImage:
                "linear-gradient(color(display-p3 1 0 0), color(display-p3 0 0 1))",
              backgroundColor: "transparent",
              position: "static",
            } as CSSStyleDeclaration;
          }
          return {
            backgroundImage: "none",
            backgroundColor: "transparent",
            position: "static",
          } as CSSStyleDeclaration;
        });

        expect(sample(target)).toBeCloseTo(1, 1);
      },
    );
  });

  it("ignores gradient stops that cannot be resolved", () => {
    installCanvasMock(null);
    jest.resetModules();
    return import("./backdropContrast.ts").then(
      ({ backdropLuminance: sample }) => {
        const bg = document.createElement("div");
        const target = document.createElement("span");
        target.getBoundingClientRect = jest
          .fn()
          .mockReturnValue(mockRect(0, 0, 100, 40));

        document.elementsFromPoint = jest.fn().mockReturnValue([bg]);
        jest.spyOn(window, "getComputedStyle").mockImplementation((node) => {
          if (node === bg) {
            return {
              backgroundImage:
                "linear-gradient(color(display-p3 1 0 0), rgb(255, 255, 255))",
              backgroundColor: "rgb(255, 255, 255)",
              position: "static",
            } as CSSStyleDeclaration;
          }
          return {
            backgroundImage: "none",
            backgroundColor: "transparent",
            position: "static",
          } as CSSStyleDeclaration;
        });

        expect(sample(target)).toBeCloseTo(1, 1);
        // Color-string cache hit on repeat sampling.
        expect(sample(target)).toBeCloseTo(1, 1);
      },
    );
  });

  it("falls back to parseRgb when canvas resolution is unavailable", async () => {
    installCanvasMock(null);
    jest.resetModules();
    const { backdropLuminance: sample } = await import("./backdropContrast.ts");

    const bg = document.createElement("div");
    const target = document.createElement("span");
    target.getBoundingClientRect = jest
      .fn()
      .mockReturnValue(mockRect(0, 0, 100, 40));

    document.elementsFromPoint = jest.fn().mockReturnValue([bg]);
    jest.spyOn(window, "getComputedStyle").mockImplementation((node) => {
      if (node === bg) {
        return {
          backgroundImage: "none",
          backgroundColor: "rgb(0, 0, 0)",
          position: "static",
        } as CSSStyleDeclaration;
      }
      return {
        backgroundImage: "none",
        backgroundColor: "transparent",
        position: "static",
      } as CSSStyleDeclaration;
    });

    expect(sample(target)).toBeCloseTo(0, 1);
  });

  it("stops compositing once the stack is effectively opaque", () => {
    installCanvasMock(mockCanvasContext(255, 255, 255, 255));
    jest.resetModules();
    return import("./backdropContrast.ts").then(
      ({ backdropLuminance: sample }) => {
        const front = document.createElement("div");
        const back = document.createElement("div");
        const target = document.createElement("span");
        target.getBoundingClientRect = jest
          .fn()
          .mockReturnValue(mockRect(0, 0, 100, 40));

        document.elementsFromPoint = jest
          .fn()
          .mockReturnValue([front, back, target]);
        jest.spyOn(window, "getComputedStyle").mockImplementation((node) => {
          if (node === front || node === back) {
            return {
              backgroundImage: "none",
              backgroundColor: "rgb(255, 255, 255)",
              position: "static",
            } as CSSStyleDeclaration;
          }
          return {
            backgroundImage: "none",
            backgroundColor: "rgb(0, 0, 0)",
            position: "static",
          } as CSSStyleDeclaration;
        });

        expect(sample(target)).toBeCloseTo(1, 1);
      },
    );
  });
});
