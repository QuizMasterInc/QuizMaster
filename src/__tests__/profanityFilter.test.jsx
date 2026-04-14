import {
  containsProfanity,
  sanitizeProfanity,
  validateNoProfanity,
} from "../utils/profanityFilter";

describe("profanityFilter", () => {
  test("detects common profanity in plain text", () => {
    expect(containsProfanity("This quiz is shit")).toBe(true);
  });

  test("detects profanity with spacing and leetspeak", () => {
    expect(containsProfanity("f.u.c.k")).toBe(true);
    expect(containsProfanity("sh1t happens")).toBe(true);
  });

  test("does not flag clean text", () => {
    expect(containsProfanity("Science practice set")).toBe(false);
  });

  test("sanitizes exact profane words for display", () => {
    expect(sanitizeProfanity("This title is shit")).toBe("This title is [removed]");
  });

  test("returns a field-specific validation message", () => {
    const result = validateNoProfanity([
      {
        label: "Quiz title",
        value: "bad shit title",
        message: "Quiz title cannot include profanity.",
      },
    ]);

    expect(result.valid).toBe(false);
    expect(result.error).toBe("Quiz title cannot include profanity.");
  });
});
