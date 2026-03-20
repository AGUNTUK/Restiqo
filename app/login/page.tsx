"use client";

import Link from "next/link";
import { useState, useActionState } from "react";
import { signIn, signUp } from "@/app/actions/auth";

type AuthState = { error?: string; success?: string } | undefined;

export default function LoginPage() {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [showPass, setShowPass] = useState(false);

  const [signInState, signInAction, signInPending] = useActionState<AuthState, FormData>(
    signIn,
    undefined
  );
  const [signUpState, signUpAction, signUpPending] = useActionState<AuthState, FormData>(
    signUp,
    undefined
  );

  const isPending = signInPending || signUpPending;

  return (
    <div
      className="flex items-center justify-center px-4 py-12"
      style={{ minHeight: "calc(100vh - 136px)" }}
    >
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 no-underline font-extrabold text-2xl"
            style={{ color: "#6c63ff", textDecoration: "none" }}
          >
            <span
              className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
              style={{
                background: "linear-gradient(135deg,#6c63ff,#ff6584)",
                boxShadow: "4px 4px 12px rgba(108,99,255,0.35)",
              }}
            >
              🏠
            </span>
            Restiqa
          </Link>
        </div>

        {/* Card */}
        <div className="neo-card rounded-[20px] p-8">
          {/* Tab switcher */}
          <div className="neo-inset flex gap-1 p-1 rounded-xl mb-7">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all"
                style={{
                  background: tab === t ? "#e8edf2" : "transparent",
                  color: tab === t ? "#6c63ff" : "#a0aec0",
                  boxShadow: tab === t
                    ? "4px 4px 10px #c4c9ce, -4px -4px 10px #ffffff"
                    : "none",
                  border: "none",
                  cursor: "pointer",
                }}
                id={`tab-${t}`}
              >
                {t === "login" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <h1
            className="font-extrabold text-2xl mb-1"
            style={{ color: "#1a202c", letterSpacing: "-0.02em" }}
          >
            {tab === "login" ? "Welcome back 👋" : "Create account 🎉"}
          </h1>
          <p className="text-sm mb-6" style={{ color: "#a0aec0" }}>
            {tab === "login"
              ? "Sign in to manage your bookings and saved listings."
              : "Join thousands of travellers on Restiqa."}
          </p>

          {/* ── SIGN IN form ── */}
          {tab === "login" && (
            <form action={signInAction} className="flex flex-col gap-4">
              <SignInFields showPass={showPass} setShowPass={setShowPass} />

              {signInState?.error && (
                <div
                  className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{ background: "rgba(255,80,80,0.08)", color: "#e53e3e", border: "1px solid rgba(255,80,80,0.2)" }}
                  role="alert"
                >
                  ⚠️ {signInState.error}
                </div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="neo-btn neo-btn-primary w-full py-3 rounded-xl text-sm font-bold mt-1"
                id="auth-signin-btn"
              >
                {signInPending ? "Signing in…" : "Sign In"}
              </button>
            </form>
          )}

          {/* ── SIGN UP form ── */}
          {tab === "signup" && (
            <form action={signUpAction} className="flex flex-col gap-4">
              <SignUpFields showPass={showPass} setShowPass={setShowPass} />

              {signUpState?.error && (
                <div
                  className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{ background: "rgba(255,80,80,0.08)", color: "#e53e3e", border: "1px solid rgba(255,80,80,0.2)" }}
                  role="alert"
                >
                  ⚠️ {signUpState.error}
                </div>
              )}

              {signUpState?.success && (
                <div
                  className="rounded-xl px-4 py-3 text-sm font-medium"
                  style={{ background: "rgba(72,187,120,0.08)", color: "#276749", border: "1px solid rgba(72,187,120,0.3)" }}
                  role="status"
                >
                  ✅ {signUpState.success}
                </div>
              )}

              {!signUpState?.success && (
                <button
                  type="submit"
                  disabled={isPending}
                  className="neo-btn neo-btn-primary w-full py-3 rounded-xl text-sm font-bold mt-1"
                  id="auth-signup-btn"
                >
                  {signUpPending ? "Creating account…" : "Create Account"}
                </button>
              )}
            </form>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px" style={{ background: "#dde2e7" }} />
            <span className="text-xs font-medium" style={{ color: "#a0aec0" }}>
              or continue with
            </span>
            <div className="flex-1 h-px" style={{ background: "#dde2e7" }} />
          </div>

          {/* Social (UI only — wire via Supabase OAuth later) */}
          <div className="flex gap-3">
            {[
              { id: "google", label: "Google", icon: "G", color: "#4285F4" },
              { id: "apple", label: "Apple", icon: "🍎", color: "#1a202c" },
            ].map(({ id, label, icon, color }) => (
              <button
                key={id}
                type="button"
                className="neo-btn flex-1 py-2.5 rounded-xl text-sm font-semibold gap-2"
                id={`social-${id}`}
                style={{ color: "#2d3748" }}
              >
                <span style={{ fontWeight: 700, color }}>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom toggle */}
        <p className="text-center mt-5 text-sm" style={{ color: "#a0aec0" }}>
          {tab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setTab(tab === "login" ? "signup" : "login")}
            className="font-bold"
            style={{ background: "none", border: "none", color: "#6c63ff", cursor: "pointer" }}
          >
            {tab === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

/* ── Sub-components (keep JSX readable) ──────────── */
function SignInFields({
  showPass,
  setShowPass,
}: {
  showPass: boolean;
  setShowPass: (v: boolean) => void;
}) {
  return (
    <>
      <FormField label="Email Address" htmlFor="si-email">
        <input
          className="neo-input"
          id="si-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </FormField>

      <FormField
        label="Password"
        htmlFor="si-password"
        right={
          <Link href="#" className="text-xs font-semibold" style={{ color: "#6c63ff", textDecoration: "none" }}>
            Forgot?
          </Link>
        }
      >
        <PasswordInput id="si-password" name="password" show={showPass} onToggle={() => setShowPass(!showPass)} autoComplete="current-password" />
      </FormField>
    </>
  );
}

function SignUpFields({
  showPass,
  setShowPass,
}: {
  showPass: boolean;
  setShowPass: (v: boolean) => void;
}) {
  return (
    <>
      <FormField label="Full Name" htmlFor="su-name">
        <input
          className="neo-input"
          id="su-name"
          name="fullName"
          type="text"
          placeholder="Jane Doe"
          autoComplete="name"
        />
      </FormField>

      <FormField label="Email Address" htmlFor="su-email">
        <input
          className="neo-input"
          id="su-email"
          name="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          required
        />
      </FormField>

      <FormField label="Password" htmlFor="su-password">
        <PasswordInput id="su-password" name="password" show={showPass} onToggle={() => setShowPass(!showPass)} autoComplete="new-password" />
      </FormField>
    </>
  );
}

function FormField({
  label,
  htmlFor,
  right,
  children,
}: {
  label: string;
  htmlFor: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex justify-between mb-1.5">
        <label
          htmlFor={htmlFor}
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: "#a0aec0" }}
        >
          {label}
        </label>
        {right}
      </div>
      {children}
    </div>
  );
}

function PasswordInput({
  id,
  name,
  show,
  onToggle,
  autoComplete,
}: {
  id: string;
  name: string;
  show: boolean;
  onToggle: () => void;
  autoComplete: string;
}) {
  return (
    <div className="relative">
      <input
        className="neo-input pr-10"
        id={id}
        name={name}
        type={show ? "text" : "password"}
        placeholder="••••••••"
        autoComplete={autoComplete}
        required
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-base"
        style={{ background: "none", border: "none", cursor: "pointer", color: "#a0aec0" }}
        aria-label="Toggle password visibility"
      >
        {show ? "🙈" : "👁"}
      </button>
    </div>
  );
}
