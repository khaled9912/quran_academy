"use client";

/**
 * The line a field shows when client validation refuses it. Server rejections
 * never reach this: they get the site-wide generic toast.
 */
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-2 text-xs font-semibold text-red-700 dark:text-red-300"
    >
      {message}
    </p>
  );
}
