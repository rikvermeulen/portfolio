/**
 * @jest-environment jsdom
 */

import {
  computeDisplacement,
  GLASS_DEFAULTS,
  paintDisplacementMap,
} from "./displacementMap.ts";

const HALF_W = 70;
const HALF_H = 40;

describe("computeDisplacement", () => {
  it("returns a neutral vector in the flat center", () => {
    const { dx, dy } = computeDisplacement(
      0,
      0,
      HALF_W,
      HALF_H,
      GLASS_DEFAULTS,
    );
    expect(dx).toBe(0);
    expect(dy).toBe(0);
  });

  it("returns neutral outside the shape", () => {
    const { dx, dy } = computeDisplacement(
      HALF_W + 20,
      0,
      HALF_W,
      HALF_H,
      GLASS_DEFAULTS,
    );
    expect(dx).toBe(0);
    expect(dy).toBe(0);
  });

  it("bends inward within the bezel band", () => {
    // A point just inside the right edge should push left (negative dx).
    const px = HALF_W - 2;
    const { dx } = computeDisplacement(px, 0, HALF_W, HALF_H, GLASS_DEFAULTS);
    expect(dx).toBeLessThan(0);
  });

  it("is symmetric across both axes", () => {
    const px = HALF_W - 3;
    const py = HALF_H - 3;
    const tl = computeDisplacement(-px, -py, HALF_W, HALF_H, GLASS_DEFAULTS);
    const tr = computeDisplacement(px, -py, HALF_W, HALF_H, GLASS_DEFAULTS);
    const bl = computeDisplacement(-px, py, HALF_W, HALF_H, GLASS_DEFAULTS);
    const br = computeDisplacement(px, py, HALF_W, HALF_H, GLASS_DEFAULTS);

    expect(tr.dx).toBeCloseTo(-tl.dx, 6);
    expect(tr.dy).toBeCloseTo(tl.dy, 6);
    expect(bl.dx).toBeCloseTo(tl.dx, 6);
    expect(bl.dy).toBeCloseTo(-tl.dy, 6);
    expect(br.dx).toBeCloseTo(-tl.dx, 6);
    expect(br.dy).toBeCloseTo(-tl.dy, 6);
  });

  it("ramps the bend up toward the surface", () => {
    // Closer to the edge → larger bend than deeper inside the bezel.
    const nearEdge = computeDisplacement(
      HALF_W - 2,
      0,
      HALF_W,
      HALF_H,
      GLASS_DEFAULTS,
    );
    const deeper = computeDisplacement(
      HALF_W - 8,
      0,
      HALF_W,
      HALF_H,
      GLASS_DEFAULTS,
    );
    expect(Math.abs(nearEdge.dx)).toBeGreaterThan(Math.abs(deeper.dx));
  });

  it("bends diagonally in the rounded corners", () => {
    // A point inside a corner's bezel bends along both axes (a real lens),
    // not just one — this is what makes corners refract like the edges.
    const r = GLASS_DEFAULTS.radius;
    const px = HALF_W - r * 0.3;
    const py = HALF_H - r * 0.3;
    const { dx, dy } = computeDisplacement(
      px,
      py,
      HALF_W,
      HALF_H,
      GLASS_DEFAULTS,
    );
    expect(dx).toBeLessThan(0);
    expect(dy).toBeLessThan(0);
    expect(Math.abs(dx)).toBeGreaterThan(0.05);
    expect(Math.abs(dy)).toBeGreaterThan(0.05);
  });
});

describe("paintDisplacementMap", () => {
  function createCanvas(
    mockCtx?: Partial<CanvasRenderingContext2D>,
  ): HTMLCanvasElement {
    const canvas = document.createElement("canvas");

    const pixelData = new Uint8ClampedArray(200 * 100 * 4).fill(0);
    const imageData = { data: pixelData, width: 200, height: 100 } as ImageData;

    const defaultCtx: Partial<CanvasRenderingContext2D> = {
      createImageData: jest.fn().mockReturnValue(imageData),
      putImageData: jest.fn(),
      getImageData: jest.fn().mockReturnValue(imageData),
    };

    jest.spyOn(canvas, "getContext").mockReturnValue({
      ...defaultCtx,
      ...mockCtx,
    } as CanvasRenderingContext2D);

    jest
      .spyOn(canvas, "toDataURL")
      .mockReturnValue("data:image/png;base64,fake");

    return canvas;
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns a data URL when the canvas 2D context is available", () => {
    const canvas = createCanvas();
    const result = paintDisplacementMap(canvas, 20, 10, GLASS_DEFAULTS);
    expect(result).toMatch(/^data:image\/png/);
  });

  it("sizes the canvas to the given width and height", () => {
    const canvas = createCanvas();
    paintDisplacementMap(canvas, 30, 20, GLASS_DEFAULTS);
    expect(canvas.width).toBe(30);
    expect(canvas.height).toBe(20);
  });

  it("clamps dimensions to at least 1x1", () => {
    const canvas = createCanvas();
    paintDisplacementMap(canvas, 0, 0, GLASS_DEFAULTS);
    expect(canvas.width).toBe(1);
    expect(canvas.height).toBe(1);
  });

  it("returns null when getContext returns null", () => {
    const canvas = document.createElement("canvas");
    jest.spyOn(canvas, "getContext").mockReturnValue(null);
    const result = paintDisplacementMap(canvas, 20, 10, GLASS_DEFAULTS);
    expect(result).toBeNull();
  });

  it("calls putImageData after computing the displacement map", () => {
    const canvas = createCanvas();
    const ctx = canvas.getContext(
      "2d",
    ) as jest.Mocked<CanvasRenderingContext2D>;
    paintDisplacementMap(canvas, 20, 10, GLASS_DEFAULTS);
    expect(ctx.putImageData).toHaveBeenCalledTimes(1);
  });
});
