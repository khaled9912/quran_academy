"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession, getProfileById } from "@/services/auth.service";
import { redirectAfterLogin } from "@/components/AutoRedirect";
import type { UserRole } from "@/types/user";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const isValidEmail = (value: string) => emailRegex.test(value.trim());

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const setRoleCookie = (roleValue: string) => {
    document.cookie = `user-role=${roleValue}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax; Secure`;
  };

  const redirectByRole = useCallback(
    (roleValue: string) => {
      redirectAfterLogin(roleValue as UserRole, router);
    },
    [router]
  );

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession();
        const userId = session?.user?.id;
        if (!userId) return;

        const profile = await getProfileById(userId);
        if (!profile?.role) return;

        setRoleCookie(profile.role);
        redirectByRole(profile.role);
      } catch (error) {
        console.error(error);
      }
    };

    checkSession();
  }, [redirectByRole]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");

    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setMessage("Please enter your email address.");
      return;
    }

    if (!isValidEmail(trimmedEmail)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    if (!trimmedPassword) {
      setMessage("Please enter your password.");
      return;
    }

    setLoading(true);

    try {
      const signInResponse = await signIn(trimmedEmail, trimmedPassword);

      if (!signInResponse?.user) {
        setMessage("Something went wrong. Please try again.");
        return;
      }

      const profile = await getProfileById(signInResponse.user.id);
      if (!profile?.role) {
        setMessage("Unable to determine your role. Contact support.");
        return;
      }

      if (!profile.is_active) {
        setMessage("Your account is deactivated. Contact an administrator.");
        return;
      }

      setRoleCookie(profile.role);
      redirectByRole(profile.role);
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-24 px-4 font-sans">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">Rayan Academy</h1>
        <p className="text-center text-foreground opacity-75 mb-8">
          Sign in to manage classes, view your dashboard, or join live lessons.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-2"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Processing..." : "Sign in"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-500">{message}</p>
        )}

        <div className="mt-8 text-center text-sm text-foreground opacity-75">
          New here?{" "}
          <Link href="/signup" className="font-semibold text-green-500 hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
