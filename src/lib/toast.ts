export type ToastTone = "success" | "error" | "warning" | "info";

export const TOAST_EVENT = "academy:toast";

/** Fires a toast from non-React code such as the API client. */
export const dispatchToast = (message: string, tone: ToastTone = "error") => {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(TOAST_EVENT, { detail: { message, tone } })
  );
};
