/**
 * Format a number as Indian Rupee currency string
 */
export function formatPrice(price: number): string {
  return `₹${price.toLocaleString("en-IN")}`;
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Get badge color based on badge label
 */
export function getBadgeColor(badge: string): string {
  if (badge === "Best Seller") return "#EF4444";
  if (badge === "Gaming") return "#8B5CF6";
  return "#22C55E";
}
