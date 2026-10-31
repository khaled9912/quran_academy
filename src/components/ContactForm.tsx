"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ApiError, backendFetch } from "@/lib/backend-client";
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
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm<ContactFormValues>();

  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const onSubmit = async (data: ContactFormValues) => {
    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    clearErrors();
    try {
      await backendFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
      });
      reset();
      setSuccessMessage("Thank you! Your message has been sent successfully.");
      setTimeout(() => setSuccessMessage(""), 4000);
    } catch (error) {
      const validationErrors =
        error instanceof ApiError ? error.validationErrors : undefined;
      const fieldErrors = Object.entries(validationErrors ?? {}).filter(
        ([field]) => isContactField(field)
      );
      for (const [field, messages] of fieldErrors) {
        if (messages[0])
          setError(field as keyof ContactFormValues, {
            type: "server",
            message: messages[0],
          });
      }
      if (fieldErrors.length) setErrorMessage("");
      else {
        setErrorMessage(
          error instanceof ApiError
            ? error.message
            : "We could not send your message. Please try again."
        );
        reportUnexpectedError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background border border-card-border p-6 rounded-lg shadow-md w-full">
      {successMessage && (
        <div className="mb-4 p-3 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
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
          {errors.name && (
            <span className="text-red-500 dark:text-red-400">
              {errors.name.message}
            </span>
          )}
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
          {errors.email && (
            <span className="text-red-500 dark:text-red-400">
              {errors.email.message}
            </span>
          )}
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
          {errors.message && (
            <span className="text-red-500 dark:text-red-400">
              {errors.message.message}
            </span>
          )}
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
