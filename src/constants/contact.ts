// The academy's claimed WhatsApp username. Linking to a handle instead of a
// phone number keeps the digits out of every page's HTML and out of WhatsApp's
// handoff screen, which prints whatever identifier the link carries.
export const ACADEMY_WHATSAPP_USERNAME = "anaquran";

const INTRODUCTION =
  "Assalamu alaikum, I'd like to know more about Ana Quran lessons.";

export const ACADEMY_WHATSAPP_URL = `https://wa.me/@${ACADEMY_WHATSAPP_USERNAME}?text=${encodeURIComponent(
  INTRODUCTION
)}`;
