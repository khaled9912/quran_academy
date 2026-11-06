/**
 * A browser cannot be handed an audio file the way a phone can, and the web app
 * ships no sound assets, so the ring is synthesised. It is deliberately a
 * two-tone pattern rather than the system "ding", because the point is to be
 * mistaken for a call.
 */
const BEEP_MS = 320;
const GAP_MS = 190;
const TONES = [880, 1175];

let context: AudioContext | null = null;
let pattern: ReturnType<typeof setInterval> | null = null;
let tone = 0;

const audioContext = () => {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctor) return null;
  if (!context) context = new Ctor();
  return context;
};

const beep = (ctx: AudioContext) => {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const frequency = TONES[tone % TONES.length];
  tone += 1;
  oscillator.type = "sine";
  oscillator.frequency.value = frequency;
  const start = ctx.currentTime;
  const end = start + BEEP_MS / 1000;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(0.6, start + 0.03);
  gain.gain.setValueAtTime(0.6, end - 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, end);
  oscillator.connect(gain).connect(ctx.destination);
  oscillator.start(start);
  oscillator.stop(end);
};

/**
 * Autoplay policy: a tab that has never been interacted with keeps its audio
 * context suspended. The caller still sees the banner, so ringing is attempted
 * and simply stays quiet when the browser refuses.
 */
export const startRinger = () => {
  const ctx = audioContext();
  if (!ctx) return;
  void ctx.resume().catch(() => {});
  if (pattern) return;
  const tick = () => {
    const live = audioContext();
    if (live && live.state === "running") beep(live);
  };
  tick();
  pattern = setInterval(tick, BEEP_MS + GAP_MS);
};

export const stopRinger = () => {
  if (pattern) {
    clearInterval(pattern);
    pattern = null;
  }
};

/**
 * The notification is a courtesy for someone whose tab is in another window;
 * it is only used when permission was already given, because asking out of
 * nowhere is worse than a banner.
 */
export const showBrowserNotice = (
  title: string,
  body: string,
  link: string
) => {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    const notice = new Notification(title, {
      body,
      tag: "ana-quran-lesson-call",
      requireInteraction: true,
    });
    notice.onclick = () => {
      window.focus();
      window.location.href = link;
      notice.close();
    };
  } catch {
    // Some browsers only allow ServiceWorkerRegistration.showNotification.
  }
};
