"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/app/actions/auth";
import LanguageToggle from "./LanguageToggle";

type NavUser = { email: string; name: string | null } | null;
type NavDict = { home: string; listings: string; login: string; dashboard: string; findStay: string; signOut: string; becomeHost: string };

export default function NavbarClient({ 
  user,
  dict,
  locale
}: { 
  user: NavUser;
  dict: NavDict;
  locale: string;
}) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayInitial = user?.name?.charAt(0).toUpperCase() ?? user?.email?.charAt(0).toUpperCase() ?? "?";

  return (
    <header
      style={{
        background: "#e8edf2",
        boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <nav
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          height: 68,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        {/* Logo */}
        <Link
          href="/"
          style={{
            fontWeight: 800,
            fontSize: "1.4rem",
            letterSpacing: "-0.03em",
            color: "#6c63ff",
            textDecoration: "none",
            display: "flex",
            alignItems: "center",
            gap: "0.4rem",
          }}
        >
          <span
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg,#6c63ff,#ff6584)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1rem",
            }}
          >
            🏠
          </span>
          Restiqa
        </Link>

        {/* Desktop nav links */}
        <ul
          className="desktop-nav"
          style={{
            display: "flex",
            gap: "0.4rem",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          {[
            { href: "/", label: dict.home },
            { href: "/listings", label: dict.listings },
            { href: "/become-a-host", label: dict.becomeHost }
          ].map(({ href, label }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  style={{
                    display: "inline-block",
                    padding: "0.45rem 1.1rem",
                    borderRadius: 10,
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    color: isActive ? "#6c63ff" : "#718096",
                    boxShadow: isActive
                      ? "4px 4px 10px #c4c9ce, -4px -4px 10px #ffffff"
                      : "none",
                    background: isActive ? "#e8edf2" : "transparent",
                    transition: "all 0.2s ease",
                  }}
                >
                  {label}
                </Link>
              </li>
            );
          })}

          {/* Dashboard link for authenticated users */}
          {user && (
            <li>
              <Link
                href="/dashboard"
                style={{
                  display: "inline-block",
                  padding: "0.45rem 1.1rem",
                  borderRadius: 10,
                  fontWeight: 600,
                  fontSize: "0.9rem",
                  textDecoration: "none",
                  color: pathname === "/dashboard" ? "#6c63ff" : "#718096",
                  boxShadow: pathname === "/dashboard"
                    ? "4px 4px 10px #c4c9ce, -4px -4px 10px #ffffff"
                    : "none",
                  background: pathname === "/dashboard" ? "#e8edf2" : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {dict.dashboard}
              </Link>
            </li>
          )}
        </ul>

        {/* Right side — user avatar, toggle, auth CTA */}
        <div className="desktop-nav" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <LanguageToggle currentLocale={locale} />
          {user ? (
            /* Authenticated: avatar + sign out */
            <>
              <Link
                href="/dashboard"
                title={user.email}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "linear-gradient(135deg,#6c63ff,#ff6584)",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "0.9rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  boxShadow: "3px 3px 8px rgba(108,99,255,0.4)",
                }}
              >
                {displayInitial}
              </Link>
              <form action={signOut} style={{ margin: 0 }}>
                <button
                  type="submit"
                  className="neo-btn"
                  style={{
                    padding: "0.4rem 1rem",
                    fontSize: "0.85rem",
                    borderRadius: 10,
                    color: "#718096",
                  }}
                >
                  {dict.signOut}
                </button>
              </form>
            </>
          ) : (
            /* Unauthenticated: Find a Stay + Login */
            <>
              <Link
                href="/login"
                style={{
                  padding: "0.45rem 1rem",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  color: "#718096",
                  textDecoration: "none",
                  borderRadius: 10,
                }}
              >
                {dict.login}
              </Link>
              <Link
                href="/listings"
                className="neo-btn neo-btn-primary"
                id="navbar-cta"
                style={{
                  padding: "0.45rem 1.2rem",
                  fontSize: "0.88rem",
                  borderRadius: 10,
                  textDecoration: "none",
                }}
              >
                {dict.findStay}
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="mobile-menu-btn"
          aria-label="Toggle menu"
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            display: "none",
            flexDirection: "column",
            gap: 5,
            padding: 4,
          }}
        >
            {[0, 1, 2].map((i) => (
              <span key={i} className="transition-all duration-300" style={{ width: i === 1 && menuOpen ? 18 : 22, height: 2, background: "#6c63ff", display: "block", borderRadius: 2 }} />
            ))}
        </button>
      </nav>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="neo-inset mx-4 my-2 rounded-3xl overflow-hidden animate-in slide-in-from-top duration-300"
          style={{
            background: "#e8edf2",
            padding: "0.5rem",
            border: "1px solid rgba(255,255,255,0.8)",
          }}
        >
          {[
            { href: "/", label: dict.home, icon: "🏠" },
            { href: "/listings", label: dict.listings, icon: "🔍" },
            { href: "/become-a-host", label: dict.becomeHost, icon: "🤝" }
          ].map(({ href, label, icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-4 px-5 py-5 rounded-2xl transition-all active:scale-95 border border-transparent active:border-[#6c63ff]/20"
              style={{
                fontWeight: 700,
                textDecoration: "none",
                minHeight: "64px",
                color: pathname === href ? "#6c63ff" : "#4a5568",
                background: pathname === href ? "rgba(108, 99, 255, 0.08)" : "transparent",
                marginBottom: "0.4rem",
              }}
            >
              <span className="text-2xl">{icon}</span>
              <span className="text-[1.1rem]">{label}</span>
            </Link>
          ))}
          {user && (
            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-4 px-5 py-5 rounded-2xl transition-all active:scale-95 border border-transparent active:border-[#6c63ff]/20"
              style={{ 
                fontWeight: 700, 
                textDecoration: "none", 
                minHeight: "64px",
                color: pathname === "/dashboard" ? "#6c63ff" : "#4a5568",
                background: pathname === "/dashboard" ? "rgba(108, 99, 255, 0.08)" : "transparent",
                marginBottom: "0.4rem",
              }}
            >
              <span className="text-2xl">📊</span>
              <span className="text-[1.1rem]">{dict.dashboard}</span>
            </Link>
          )}
          <div className="px-4 py-4 border-t border-b border-[#d1d9e0]/50 my-2">
            <LanguageToggle currentLocale={locale} />
          </div>
          {user ? (
            <form action={signOut}>
              <button 
                type="submit" 
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-[#e53e3e] active:scale-95 text-left"
              >
                <span className="text-xl">🚪</span>
                {dict.signOut}
              </button>
            </form>
          ) : (
            <Link 
              href="/login" 
              onClick={() => setMenuOpen(false)} 
              className="flex items-center gap-3 px-4 py-4 rounded-2xl font-bold text-[#6c63ff] active:scale-95 no-underline"
            >
              <span className="text-xl">👤</span>
              {dict.login}
            </Link>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
      `}</style>
    </header>
  );
}
