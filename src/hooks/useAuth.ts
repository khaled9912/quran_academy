"use client";

import { useEffect, useState } from "react";
import { getSession, getProfileById } from "@/services/auth.service";
import type { UserProfile } from "@/types/user";

export const useAuth = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAuth = async () => {
      try {
        const session = await getSession();
        if (session?.user?.id) {
          const userProfile = await getProfileById(session.user.id);
          setProfile(userProfile);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadAuth();
  }, []);

  return { profile, loading };
};
