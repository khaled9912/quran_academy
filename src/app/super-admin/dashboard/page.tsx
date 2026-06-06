"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { UserProfile } from "@/types/user";

interface AuditLog {
  id: string;
  action: string;
  resource: string;
  resource_id: string;
  created_at: string;
  profiles: {
    email: string;
    full_name: string;
    role: string;
  };
}

export default function SuperAdminDashboard() {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<"users" | "logs">("users");
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const sessionData = localStorage.getItem("sb-access-token") || "";
      const authHeader = sessionData ? `Bearer ${sessionData}` : "";

      // Fetch profiles
      const resProfiles = await fetch("http://localhost:4000/api/profiles", {
        headers: {
          Authorization: authHeader,
        },
      });
      const dataProfiles = await resProfiles.json();
      if (Array.isArray(dataProfiles)) {
        setProfiles(dataProfiles);
      }

      // Fetch audit logs
      const resLogs = await fetch("http://localhost:4000/api/audit-logs", {
        headers: {
          Authorization: authHeader,
        },
      });
      const dataLogs = await resLogs.json();
      if (Array.isArray(dataLogs)) {
        setAuditLogs(dataLogs);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const toggleUserStatus = async (targetId: string, currentActive: boolean) => {
    setUpdatingId(targetId);
    try {
      const sessionData = localStorage.getItem("sb-access-token") || "";
      const res = await fetch(
        `http://localhost:4000/api/profiles/${targetId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData}`,
          },
          body: JSON.stringify({ is_active: !currentActive }),
        }
      );

      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === targetId ? { ...p, is_active: !currentActive } : p
          )
        );
        // Refresh audit logs
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  const changeUserRole = async (targetId: string, newRole: string) => {
    setUpdatingId(targetId);
    try {
      const sessionData = localStorage.getItem("sb-access-token") || "";
      const res = await fetch(
        `http://localhost:4000/api/profiles/${targetId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionData}`,
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      if (res.ok) {
        setProfiles((prev) =>
          prev.map((p) =>
            p.id === targetId ? { ...p, role: newRole as any } : p
          )
        );
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 border-b border-card-border pb-6">
          <h1 className="text-4xl font-extrabold text-green-600 mb-2">
            Super Admin Dashboard
          </h1>
          <p className="text-lg opacity-75">
            Manage system administrators, configuration settings, and audit
            trails.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-6 py-2.5 rounded-xl font-semibold transition ${
              activeTab === "users"
                ? "bg-green-500 text-white"
                : "border border-card-border bg-card-bg hover:bg-card-border"
            }`}
          >
            Manage Users
          </button>
          <button
            onClick={() => setActiveTab("logs")}
            className={`px-6 py-2.5 rounded-xl font-semibold transition ${
              activeTab === "logs"
                ? "bg-green-500 text-white"
                : "border border-card-border bg-card-bg hover:bg-card-border"
            }`}
          >
            Audit Logs
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-lg">
            Loading system data...
          </div>
        ) : activeTab === "users" ? (
          <div className="bg-card-bg border border-card-border rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-card-border">
              <h2 className="text-xl font-bold">System Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background opacity-75 border-b border-card-border">
                    <th className="px-6 py-3 text-sm font-semibold uppercase">
                      Email
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase">
                      Name
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase">
                      Role
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {profiles.map((profile) => (
                    <tr
                      key={profile.id}
                      className="hover:bg-background/50 transition"
                    >
                      <td className="px-6 py-4">{profile.email}</td>
                      <td className="px-6 py-4">
                        {profile.full_name ||
                          `${profile.first_name || ""} ${profile.last_name || ""}` ||
                          "-"}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={profile.role}
                          onChange={(e) =>
                            changeUserRole(profile.id, e.target.value)
                          }
                          disabled={updatingId === profile.id}
                          className="bg-background text-foreground border border-card-border rounded-xl px-2 py-1 focus:outline-none focus:border-green-500"
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            profile.is_active
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }`}
                        >
                          {profile.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() =>
                            toggleUserStatus(profile.id, !!profile.is_active)
                          }
                          disabled={updatingId === profile.id}
                          className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition ${
                            profile.is_active
                              ? "border border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                              : "border border-green-500 text-green-500 hover:bg-green-500 hover:text-white"
                          }`}
                        >
                          {profile.is_active ? "Deactivate" : "Activate"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-card-bg border border-card-border rounded-3xl overflow-hidden shadow-xl">
            <div className="px-6 py-4 border-b border-card-border">
              <h2 className="text-xl font-bold">Audit Trails</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-background opacity-75 border-b border-card-border">
                    <th className="px-6 py-3 text-sm font-semibold uppercase">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase">
                      Actor
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase">
                      Action
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase">
                      Resource
                    </th>
                    <th className="px-6 py-3 text-sm font-semibold uppercase">
                      Resource ID
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border">
                  {auditLogs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-background/50 transition"
                    >
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div>{log.profiles?.full_name || "System"}</div>
                        <div className="text-xs opacity-60">
                          {log.profiles?.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-green-600">
                        {log.action}
                      </td>
                      <td className="px-6 py-4 text-sm uppercase">
                        {log.resource}
                      </td>
                      <td className="px-6 py-4 text-sm font-mono text-xs opacity-70">
                        {log.resource_id || "-"}
                      </td>
                    </tr>
                  ))}
                  {auditLogs.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-8 text-center opacity-60"
                      >
                        No logs recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
