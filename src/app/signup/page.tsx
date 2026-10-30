"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signUp } from "@/services/auth.service";
import { ApiError } from "@/lib/backend-client";
import { useAuth } from "@/providers/auth-provider";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const SignUpPage = () => {
  const router = useRouter();
  const { applySession } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loading) return;
    setMessage("");
    const trimmedName = fullName.trim();
    const trimmedEmail = email.trim();
    if (!trimmedName) { setMessage("Please enter your full name."); return; }
    if (!emailRegex.test(trimmedEmail)) { setMessage("Please enter a valid email address."); return; }
    if (!strongPasswordRegex.test(password)) {
      setMessage("Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.");
      return;
    }

    setLoading(true);
    try {
      // The API creates a student account and starts the session. Applying it
      // once lets the AuthProvider perform the single dashboard redirect.
      const { user } = await signUp(trimmedName, trimmedEmail, password);
      if (user) applySession(user);
      else router.replace("/login");
    } catch (error) {
      setMessage(error instanceof ApiError ? error.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-24 px-4 font-sans">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">Create your account</h1>
        <p className="text-center text-foreground opacity-75 mb-8">
          Create your student account and get connected with your teacher.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="fullName" className="block text-sm font-semibold mb-2">Full name</label>
            <input id="fullName" type="text" value={fullName} onChange={(event) => setFullName(event.target.value)} required autoComplete="name" className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500" />
          </div>
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
              autoComplete="email"
              className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              autoComplete="new-password"
              className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500"
            />
            <p className="mt-2 text-xs text-foreground opacity-70">
              Use at least 8 characters with uppercase, lowercase, a number,
              and a symbol.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {message && (
          <p role="alert" className="mt-4 text-center text-sm text-red-500">{message}</p>
        )}

        <div className="mt-8 text-center text-sm text-foreground opacity-75">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-green-500 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
