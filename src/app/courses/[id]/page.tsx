import { permanentRedirect } from "next/navigation";

// Numbered course pages held demo data; programmes now live at named slugs.
export default function LegacyCoursePage() {
  permanentRedirect("/courses");
}
