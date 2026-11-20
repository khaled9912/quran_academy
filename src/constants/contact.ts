// The academy's WhatsApp phone number, with the country code but no + or spaces.
export const ACADEMY_WHATSAPP_NUMBER = "201501229155";

const INTRODUCTION =
  "Assalamu alaikum, I'd like to know more about Ana Quran lessons.";

export const ACADEMY_WHATSAPP_URL = `https://wa.me/${ACADEMY_WHATSAPP_NUMBER}?text=${encodeURIComponent(
  INTRODUCTION
)}`;
