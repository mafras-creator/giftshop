// Routes that show a focused, distraction-free layout - no category pill
// bar, no full footer. Add new paths here any time another page needs
// this treatment (checkout-style flows, legal pages, contact, etc).
export const FOCUSED_ROUTE_PREFIXES = ["/cart", "/contact", "/privacy", "/terms", "/admin"];

export function isFocusedRoute(pathname: string): boolean {
  return FOCUSED_ROUTE_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}
