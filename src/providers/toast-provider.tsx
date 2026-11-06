"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";
import { TOAST_EVENT, type ToastTone } from "@/lib/toast";

export type { ToastTone } from "@/lib/toast";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  showToast: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { icon: typeof Info; classes: string }> = {
  success: {
    icon: CheckCircle2,
    classes:
      "border-green-600/30 bg-[#eef7f1] text-[#1d4e47] dark:border-green-500/40 dark:bg-[#12241f] dark:text-green-100",
  },
  error: {
    icon: AlertCircle,
    classes:
      "border-red-500/30 bg-[#fdf0ef] text-[#7a241d] dark:border-red-500/40 dark:bg-[#2a1513] dark:text-red-100",
  },
  info: {
    icon: Info,
    classes:
      "border-[#1d4e47]/20 bg-card-bg text-foreground dark:border-white/15",
  },
};

const DISMISS_AFTER_MS = 6000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const trimmed = message.trim();
      if (!trimmed) return;
      const id = ++nextId.current;
      // Repeated failures during one action should not stack up.
      setToasts((current) => [
        ...current.filter((toast) => toast.message !== trimmed),
        { id, message: trimmed, tone },
      ]);
      window.setTimeout(() => dismiss(id), DISMISS_AFTER_MS);
    },
    [dismiss]
  );

  useEffect(() => {
    const onToast = (event: Event) => {
      const detail = (event as CustomEvent<Partial<Toast>>).detail;
      if (typeof detail?.message === "string")
        showToast(detail.message, detail.tone ?? "error");
    };
    window.addEventListener(TOAST_EVENT, onToast);
    return () => window.removeEventListener(TOAST_EVENT, onToast);
  }, [showToast]);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 top-4 z-[3000] flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((toast) => {
          const { icon: Icon, classes } = TONE_STYLES[toast.tone];
          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur ${classes}`}
            >
              <Icon size={18} className="mt-0.5 shrink-0" />
              <p className="min-w-0 flex-1 text-sm font-medium leading-5">
                {toast.message}
              </p>
              <button
                type="button"
                aria-label="Dismiss notification"
                onClick={() => dismiss(toast.id)}
                className="shrink-0 rounded-full p-0.5 opacity-60 transition hover:opacity-100"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context)
    throw new Error("useToast must be used within a ToastProvider.");
  return context;
}
