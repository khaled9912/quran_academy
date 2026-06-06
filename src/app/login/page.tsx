"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

const LoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        await redirectByRole(data.session.user.id);
      }
    };
    checkSession();
  }, []);

  const redirectByRole = async (userId: string) => {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.warn("Profile lookup failed", error.message);
      return;
    }

    if (profile?.role === "teacher") {
      router.push("/teacher/schedule");
    } else if (profile?.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/student-dashboard");
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) {
          setMessage(error.message);
          return;
        }

        if (data.user) {
          await supabase.from("profiles").upsert({
            id: data.user.id,
            email,
            role,
          });
          setMessage(
            "Check your inbox for confirmation email. Redirecting shortly..."
          );
          await redirectByRole(data.user.id);
        }
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.user) {
        await redirectByRole(data.user.id);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center py-24 px-4">
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
                onChange={(event) => setRole(event.target.value)}
                className="w-full rounded-xl border border-card-border bg-background px-4 py-3 text-foreground focus:outline-none focus:border-green-500"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
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
