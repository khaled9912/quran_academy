import { useEffect, useState } from "react";

import { restrictedVisitorInBrowser } from "@/lib/restricted-country";

/**
 * The country gate for chrome that renders on the server too, e.g. the navbar.
 * Starts open and closes after mount so hydration matches; the cookie it reads
 * was written by the proxy on this visitor's first request.
 */
export function useRestrictedVisitor() {
  const [restricted, setRestricted] = useState(false);
  useEffect(() => setRestricted(restrictedVisitorInBrowser()), []);
  return restricted;
}
