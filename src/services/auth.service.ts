import { supabase } from "@/lib/supabase-client";
import type { UserProfile } from "@/types/user";

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string, role: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  return data;
};

export const createProfile = async (profile: Partial<UserProfile>) => {
  const { data, error } = await supabase.from("profiles").upsert(profile);

  if (error) throw error;
  return data;
};

export const getSession = async () => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

export const getProfileById = async (
  userId: string
): Promise<UserProfile | null> => {
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, role, first_name, last_name, full_name, is_active, avatar_url, created_at"
    )
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data as UserProfile | null;
};
