"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ROLE_DASHBOARDS } from "@/constants/role-routes";
import { useAuth } from "@/providers/auth-provider";

type Props = {
  /** What an anonymous visitor is invited to do, e.g. "Start learning". */
  label: string;
  className: string;
  withArrow?: boolean;
};

/**
 * A marketing sign-up call to action that knows who is already signed in. The
 * pages using it are prerendered for search engines, so they cannot read the
 * session server-side: everyone starts on the public invitation and swaps to
 * their own dashboard once the cached identity arrives. Sending a signed-in
 * visitor to /signup is a dead end for someone who already has an account.
 */
export function SignUpCta({ label, className, withArrow = true }: Props) {
  const { isAuthenticated, role } = useAuth();
  const href = isAuthenticated && role ? ROLE_DASHBOARDS[role] : "/signup";
  const signedIn = href !== "/signup";

  return (
    <Link href={href} className={className}>
      {signedIn ? "Go to my dashboard" : label}
      {withArrow ? <ArrowRight size={18} /> : null}
    </Link>
  );
}
