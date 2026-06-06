"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  signIn,
  signUp,
  getSession,
  getProfileById,
  createProfile,
} from "@/services/auth.service";
import { UserRole } from "@/types/user";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("student");
  const [isRegistering, setIsRegistering] = useState(false);
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
    setLoading(true);
    setMessage("");

    try {
      if (isRegistering) {
        const signUpResponse = await signUp(email, password, role);

        if (!signUpResponse?.user) {
          setMessage("Registration failed. Please try again.");
          return;
        }

        await createProfile({
          id: signUpResponse.user.id,
          email,
          role,
          is_active: true,
        });

        setRoleCookie(role);
        setMessage(
          "Check your inbox for confirmation email. Redirecting shortly..."
        );
        redirectByRole(role);
        return;
      }

      const signInResponse = await signIn(email, password);

      if (!signInResponse?.user) {
        setMessage("Login failed. Please check your credentials.");
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
    } catch (error: any) {
      setMessage(error?.message ?? "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-24 px-4 font-sans">
      <div className="w-full max-w-md bg-card-bg border border-card-border rounded-3xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center mb-2">Rayan Academy</h1>
        <p className="text-center text-foreground opacity-75 mb-8">
          {isRegistering
            ? "Create your account and join the academy."
            : "Sign in to manage classes, view your dashboard, or join live lessons."}
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

          {isRegistering && (
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
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-green-500 px-4 py-3 text-white font-semibold transition hover:bg-green-600 disabled:opacity-50"
          >
            {loading
              ? "Processing..."
              : isRegistering
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        {message && (
          <p className="mt-4 text-center text-sm text-red-500">{message}</p>
        )}

        <div className="mt-8 text-center text-sm text-foreground opacity-75">
          {isRegistering ? (
            <>
              Already a member?{" "}
              <button
                onClick={() => setIsRegistering(false)}
                className="font-semibold text-green-500 hover:underline"
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button
                onClick={() => setIsRegistering(true)}
                className="font-semibold text-green-500 hover:underline"
              >
                Create account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
