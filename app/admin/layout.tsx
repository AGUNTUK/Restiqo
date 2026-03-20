import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ReactNode } from "react";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const links = [
    { name: "Overview", href: "/admin", icon: "📊" },
    { name: "Users", href: "/admin/users", icon: "👥" },
    { name: "Listings", href: "/admin/listings", icon: "🏡" },
    { name: "Bookings", href: "/admin/bookings", icon: "📆" },
    { name: "Payouts", href: "/admin/payouts", icon: "💸" },
    { name: "Transactions", href: "/admin/transactions", icon: "🧾" },
  ];

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col md:flex-row">
      <aside className="w-full md:w-64 neo-card shrink-0 p-6 flex flex-col gap-8 rounded-none md:min-h-screen border-r border-white/50 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6c63ff] to-[#ff6584] flex items-center justify-center text-white font-extrabold shadow-[2px_2px_8px_rgba(108,99,255,0.4)]">
            A
          </div>
          <div>
            <h2 className="font-extrabold text-[#1a202c] text-lg">Admin</h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#a0aec0]">Restiqa Ops</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {links.map(link => (
            <Link key={link.name} href={link.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/50 transition-colors text-sm font-bold text-[#4a5568]">
              <span className="text-xl">{link.icon}</span>
              {link.name}
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto hidden md:block">
          <Link href="/dashboard" className="flex items-center justify-center w-full py-3 neo-inset rounded-xl text-xs font-bold text-[#a0aec0] bg-transparent hover:text-[#6c63ff] transition-colors">
            Exit Hub
          </Link>
        </div>
      </aside>
      
      <main className="flex-1 w-full max-w-[100vw] overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
