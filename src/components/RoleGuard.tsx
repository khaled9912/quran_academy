"use client";

import React from "react";
import { useAuth } from "@/providers/auth-provider";
import { UserRole } from "@/types/user";
import { hasPermission } from "@/lib/permissions";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredPermission?: string;
  fallback?: React.ReactNode;
}

export function RoleGuard({
  children,
  allowedRoles,
  requiredPermission,
  fallback = null,
}: RoleGuardProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  // 1. If checking permission, check if the current role satisfies the permission
  if (requiredPermission) {
    if (!hasPermission(role, requiredPermission)) {
      return <>{fallback}</>;
    }
  }

  // 2. If checking allowed roles, check if the current role is included
  if (allowedRoles) {
    if (!role || !allowedRoles.includes(role)) {
      return <>{fallback}</>;
    }
  }

  // 3. Authorized
  return <>{children}</>;
}

export default RoleGuard;
