"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, Link2, MessageCircle, Pencil, Share2, X } from "lucide-react";

const defaultMessage = (url: string) => `Join my Ana Quran lesson room: ${url}`;

// The message is free text, so a user who edits it may drop the link. Send the
// room URL anyway rather than an invite with nowhere to go.
const withLink = (message: string, url: string) => {
  const trimmed = message.trim();
  if (!trimmed) return url;
  return trimmed.includes(url) ? trimmed : `${trimmed}\n${url}`;
};

const copyText = async (value: string) => {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.appendChild(field);
    field.select();
    const copied = document.execCommand("copy");
    document.body.removeChild(field);
    return copied;
  }
};

type Props = {
  open: boolean;
  shareUrl: string;
  onClose: () => void;
};

export function ShareLessonDrawer({ open, shareUrl, onClose }: Props) {
  const [message, setMessage] = useState(() => defaultMessage(shareUrl));
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return;
    setMessage(defaultMessage(shareUrl));
    setCopied(false);
  }, [open, shareUrl]);

  useEffect(() => {
    setCanNativeShare(
      typeof navigator !== "undefined" && typeof navigator.share === "function"
    );
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(timer);
  }, [copied]);

  if (!open) return null;

  const copyLink = async () => {
    if (await copyText(shareUrl)) setCopied(true);
  };

  const shareOnWhatsApp = () => {
    const text = encodeURIComponent(withLink(message, shareUrl));
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
    onClose();
  };

  const shareEverywhere = () => {
    void navigator
      .share({ title: "Ana Quran lesson room", text: withLink(message, shareUrl) })
      .then(onClose)
      .catch(() => {});
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/50"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="share-lesson-title"
        className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col gap-4 overflow-y-auto border-l border-card-border bg-background p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600">
            <Pencil size={18} />
          </span>
          <div className="flex-1">
            <h2 id="share-lesson-title" className="text-lg font-semibold">
              Share lesson room
            </h2>
            <p className="text-sm text-foreground opacity-70">
              Edit the message, then send it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close share options"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-card-border bg-card-bg transition hover:border-green-500"
          >
            <X size={16} />
          </button>
        </div>

        <label htmlFor="share-lesson-message" className="text-sm font-semibold">
          Message
        </label>
        <textarea
          id="share-lesson-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={5}
          className="w-full resize-none rounded-xl border border-card-border bg-card-bg p-3 text-sm text-foreground outline-none focus:border-green-500"
        />

        <div className="flex items-center gap-2 rounded-xl border border-card-border bg-card-bg p-3">
          <Link2 size={16} className="shrink-0 opacity-60" />
          <span className="min-w-0 flex-1 truncate text-xs">{shareUrl}</span>
          <button
            type="button"
            onClick={() => void copyLink()}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
              copied
                ? "border-green-500 text-green-600"
                : "border-card-border hover:border-green-500"
            }`}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="mt-2 flex flex-col gap-2">
          <button
            type="button"
            onClick={shareOnWhatsApp}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600"
          >
            <MessageCircle size={16} /> Share on WhatsApp
          </button>
          {canNativeShare ? (
            <button
              type="button"
              onClick={shareEverywhere}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-card-border bg-card-bg px-5 py-3 text-sm font-semibold transition hover:border-green-500"
            >
              <Share2 size={16} /> More options
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
