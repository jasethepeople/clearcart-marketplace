export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 160);
}

export function isReviewRating(value: number) {
  return Number.isInteger(value) && value >= 1 && value <= 5;
}

export function canSubmitReview(orderStatus: string, hasExistingReview: boolean) {
  return orderStatus === "completed" && !hasExistingReview;
}

const orderStatusRank: Record<string, number> = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  completed: 4,
};

export function canTransitionOrder(currentStatus: string, nextStatus: string) {
  if (currentStatus === "completed" || currentStatus === "cancelled") return false;
  if (nextStatus === "cancelled") return true;
  const currentRank = orderStatusRank[currentStatus];
  const nextRank = orderStatusRank[nextStatus];
  return currentRank !== undefined && nextRank !== undefined && nextRank > currentRank;
}
