/**
 * A browser cannot be handed an audio file the way a phone can and the web app
 * ships no sound assets, so the message ping is synthesised. It is two short
 * rising notes: long enough to notice, far shorter than the lesson ring so the
 * two are never confused.
 */
const NOTES = [660, 880];
const NOTE_MS = 130;
const GAP_MS = 90;

let context: AudioContext | null = null;

/**
 * Safari only accepts an audio context that was resumed inside a real gesture,
 * and a tab that has never been touched keeps its context suspended. The unlock
 * therefore rides on the first interaction — which for every real user is the
 * login they performed to reach a notification in the first place.
 */
let unlocked = false;

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

/** Listens once, then never again. Safe to call on every mount. */
export const primeNotificationSound = () => {
  if (typeof window === "undefined" || unlocked) return;
  const events = ["pointerdown", "keydown"] as const;
  const onGesture = () => {
    for (const event of events) window.removeEventListener(event, onGesture);
    const ctx = audioContext();
    if (!ctx) return;
    void ctx.resume().then(() => {
      unlocked = ctx.state === "running";
    });
  };
  for (const event of events)
    window.addEventListener(event, onGesture, { once: true, passive: true });
};

/** Stays silent until a gesture has unlocked audio; never throws. */
export const playNotificationPing = () => {
  const ctx = audioContext();
  if (!ctx) return;
  if (!unlocked) {
    if (ctx.state !== "running") return;
    unlocked = true;
  }
  let start = ctx.currentTime;
  for (const frequency of NOTES) {
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    const end = start + NOTE_MS / 1000;
    oscillator.type = "sine";
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.35, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, end);
    oscillator.connect(gain).connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(end);
    start = end + GAP_MS / 1000;
  }
};
