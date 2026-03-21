"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/* ── Sign In ─────────────────────────────────────── */
export async function signIn(
  _prevState: { error?: string } | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const redirectTo = (formData.get("redirectTo") as string) || "/dashboard";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error || !user) {
    return { error: error?.message || "Invalid credentials" };
  }

  // Role-based redirection logic for standard logins
  if (!formData.get("redirectTo")) {
    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      redirect("/admin");
    } else if (profile?.role === "host") {
      redirect("/host");
    }
  }

  redirect(redirectTo);
}

/* ── Sign Up ─────────────────────────────────────── */
export async function signUp(
  _prevState: { error?: string; success?: string } | undefined,
  formData: FormData
) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = (formData.get("fullName") as string) || "";

  if (!email || !password) {
    return { error: "Email and password are required." };
  }

  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success:
      "Account created! Check your email for a confirmation link before signing in.",
  };
}

/* ── Sign Out ────────────────────────────────────── */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
