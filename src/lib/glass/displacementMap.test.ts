import { computeDisplacement, GLASS_DEFAULTS } from "./displacementMap.ts";

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
