import {
  contactSchema,
  hasEnoughText,
  STEPS,
  validateStep,
} from "./Contact.validation.ts";

describe("contactSchema", () => {
  it("accepts a fully valid submission", () => {
    const result = contactSchema.safeParse({
      name: "Rik",
      reason: "Just saying hi",
      phone: "+31 6 12345678",
      email: "rik@example.com",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid submission", () => {
    const result = contactSchema.safeParse({
      name: "R",
      reason: "",
      phone: "nope",
      email: "not-an-email",
    });
    expect(result.success).toBe(false);
  });
});

describe("STEPS", () => {
  it("covers every schema field in order", () => {
    expect(STEPS.map((s) => s.field)).toEqual([
      "name",
      "reason",
      "phone",
      "email",
    ]);
  });
});

describe("validateStep", () => {
  it("returns null for a valid value", () => {
    expect(validateStep(0, "Rik")).toBeNull();
  });

  it("returns the validator message for an invalid value", () => {
    expect(validateStep(0, "R")).toBe("Name must be at least 2 characters.");
  });

  it("returns null for an out-of-range step", () => {
    expect(validateStep(99, "anything")).toBeNull();
  });
});

describe("hasEnoughText", () => {
  it("is true once at least two non-space characters are present", () => {
    expect(hasEnoughText("hi")).toBe(true);
  });

  it("is false for blank or whitespace-only text", () => {
    expect(hasEnoughText("   ")).toBe(false);
  });
});
