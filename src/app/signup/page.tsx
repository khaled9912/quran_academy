"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createProfile,
  getProfileById,
  getSession,
  signUp,
} from "@/services/auth.service";
import { UserRole } from "@/types/user";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const isValidEmail = (value: string) => emailRegex.test(value.trim());
const isStrongPassword = (value: string) => strongPasswordRegex.test(value);

const SignUpPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const setRoleCookie = (roleValue: string) => {
    document.cookie = `user-role=${roleValue}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax; Secure`;
  };

  const redirectByRole = useCallback(
    (roleValue: string) => {
      if (roleValue === "super_admin") {
        router.push("/super-admin/dashboard");
      } else if (roleValue === "admin") {
        router.push("/admin/dashboard");
      } else if (roleValue === "teacher") {
        router.push("/teacher/dashboard");
      } else {
        router.push("/student/dashboard");
      }
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

    if (!isStrongPassword(trimmedPassword)) {
      setMessage(
        "Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character."
      );
      return;
    }

    setLoading(true);

    try {
      const signUpResponse = await signUp(trimmedEmail, trimmedPassword, role);

      if (!signUpResponse?.user) {
        setMessage("Something went wrong. Please try again.");
        return;
      }

      await createProfile({
        id: signUpResponse.user.id,
        email: trimmedEmail,
        role,
        is_active: true,
      });

      setRoleCookie(role);
      setMessage(
        "Account created. Please check your inbox for confirmation, then continue signing in."
      );
      redirectByRole(role);
    } catch {
      setMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-24 px-4 font-sans">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">Create your account</h1>
        <p className="text-center text-foreground opacity-75 mb-8">
          Join the academy and start learning with your new account.
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
            <p className="mt-2 text-xs text-foreground opacity-70">
              Use at least 8 characters with uppercase, lowercase, a number,
              and a symbol.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Role</label>
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as UserRole)}
              className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
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
          <p className="mt-4 text-center text-sm text-red-500">{message}</p>
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
