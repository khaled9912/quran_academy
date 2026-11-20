// The academy's WhatsApp username.
export const ACADEMY_WHATSAPP_USERNAME = "ana.quran";

const INTRODUCTION =
  "Assalamu alaikum, I'd like to know more about Ana Quran lessons.";

export const ACADEMY_WHATSAPP_URL = `https://wa.me/@${ACADEMY_WHATSAPP_USERNAME}?text=${encodeURIComponent(
  INTRODUCTION
)}`;
