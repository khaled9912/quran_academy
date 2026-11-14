import type { ComponentProps } from "react";

import { SignUpCta } from "@/components/SignUpCta";
import { restrictedVisitor } from "@/lib/pricing-visibility";

/**
 * The sign-up invitation, withheld where enrolment is closed. Marketing pages
 * are server components, so the check happens before the link is ever in the
 * HTML — a hidden button would still be a link to a page that turns them away.
 */
export async function EnrolCta(props: ComponentProps<typeof SignUpCta>) {
  if (await restrictedVisitor()) return null;
  return <SignUpCta {...props} />;
}
