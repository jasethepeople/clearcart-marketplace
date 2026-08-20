import { describe, expect, it } from "vitest";
import { canSubmitReview, canTransitionOrder, isReviewRating, slugify } from "./marketplaceRules";

describe("marketplace rules", () => {
  it("creates stable URL-safe product slugs", () => {
    expect(slugify("  Hand-finished & Oak Board!  ")).toBe("hand-finished-oak-board");
    expect(slugify("A")).toBe("a");
  });

  it("accepts only whole-number review ratings from one through five", () => {
    expect(isReviewRating(1)).toBe(true);
    expect(isReviewRating(5)).toBe(true);
    expect(isReviewRating(4.5)).toBe(false);
    expect(isReviewRating(0)).toBe(false);
    expect(isReviewRating(6)).toBe(false);
  });

  it("allows a review only for a completed order without an existing review", () => {
    expect(canSubmitReview("completed", false)).toBe(true);
    expect(canSubmitReview("completed", true)).toBe(false);
    expect(canSubmitReview("pending", false)).toBe(false);
    expect(canSubmitReview("cancelled", false)).toBe(false);
  });

  it("supports the completed-order review path while preventing terminal-state changes", () => {
    expect(canTransitionOrder("pending", "confirmed")).toBe(true);
    expect(canTransitionOrder("confirmed", "processing")).toBe(true);
    expect(canTransitionOrder("processing", "shipped")).toBe(true);
    expect(canTransitionOrder("shipped", "completed")).toBe(true);
    expect(canSubmitReview("completed", false)).toBe(true);
    expect(canTransitionOrder("completed", "shipped")).toBe(false);
    expect(canTransitionOrder("cancelled", "completed")).toBe(false);
  });
});
