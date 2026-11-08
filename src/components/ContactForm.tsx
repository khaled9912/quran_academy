"use client";

import { useState } from "react";
import { useForm, type FieldErrors } from "react-hook-form";
import { ApiError, backendFetch } from "@/lib/backend-client";
import { useToast } from "@/providers/toast-provider";
import { reportUnexpectedError } from "@/lib/sentry";

interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

const CONTACT_FIELDS: (keyof ContactFormValues)[] = [
  "name",
  "email",
  "message",
];
const isContactField = (field: string): field is keyof ContactFormValues =>
  (CONTACT_FIELDS as string[]).includes(field);

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;

const inputClass =
  "p-2 border border-card-border rounded bg-card-bg text-foreground focus:outline-none focus:border-green-500";

const ContactForm = () => {
  const { register, handleSubmit, reset } = useForm<ContactFormValues>();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    try {
      await backendFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });
      reset();
      showToast(
        "Thank you! Your message has been sent successfully.",
        "success"
      );
    } catch (error) {
      const validationErrors =
        error instanceof ApiError ? error.validationErrors : undefined;
      const fieldErrors = Object.entries(validationErrors ?? {}).filter(
        ([field]) => isContactField(field)
      );
      const firstMessage = fieldErrors
        .map(([, messages]) => messages[0])
        .find(Boolean);
      if (firstMessage) {
        showToast(firstMessage, "error");
      } else {
        if (!(error instanceof ApiError))
          showToast(
            "We could not send your message. Please try again.",
            "error"
          );
        reportUnexpectedError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const onInvalid = (invalidErrors: FieldErrors<ContactFormValues>) => {
    const first = Object.values(invalidErrors).find(
      (entry) => entry?.message
    );
    if (first?.message) showToast(String(first.message), "error");
  };

  return (
    <div className="bg-background border border-card-border p-6 rounded-lg shadow-md w-full">
      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-4 mt-2"
        noValidate
      >
        <div className="flex flex-col">
          <label htmlFor="name" className="text-foreground">
            Name
          </label>
          <input
            id="name"
            {...register("name", {
              required: "Name is required",
              maxLength: {
                value: 120,
                message: "Name must be 120 characters or fewer",
              },
            })}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="text-foreground">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: EMAIL_PATTERN,
                message: "Enter a valid email address",
              },
            })}
            className={inputClass}
          />
        </div>

        <div className="flex flex-col">
          <label htmlFor="message" className="text-foreground">
            Message
          </label>
          <textarea
            id="message"
            rows={4}
            {...register("message", {
              required: "Message is required",
              minLength: {
                value: 5,
                message: "Message must be at least 5 characters",
              },
              maxLength: {
                value: 3000,
                message: "Message must be 3000 characters or fewer",
              },
            })}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="p-2 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded mt-2 transition disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Sending..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default ContactForm;
