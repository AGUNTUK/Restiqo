import { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function HostLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch user profile to check role
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== 'host' && profile.role !== 'admin')) {
    redirect("/");
  }

  const navItems = [
    { name: "Overview", href: "/host", icon: "📊" },
    { name: "My Listings", href: "/host/listings", icon: "🏠" },
    { name: "Bookings", href: "/host/bookings", icon: "📅" },
    { name: "Earnings", href: "/host/earnings", icon: "💰" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#e8edf2] font-inter">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white/40 backdrop-blur-md border-r border-white/60 p-6 flex flex-col gap-8 transition-all">
        <div className="flex flex-col gap-1">
          <Link href="/" className="text-2xl font-black text-[#6c63ff] mb-6 tracking-tighter">RESTIQA</Link>
          <div className="px-3 py-2 bg-[#6c63ff]/10 rounded-xl mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#6c63ff]">Host Control Panel</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#718096] hover:bg-white hover:text-[#6c63ff] hover:shadow-md transition-all group"
            >
              <span className="text-lg group-hover:scale-125 transition-transform">{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-white/60">
          <Link 
            href="/profile" 
            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-[#718096] hover:bg-white transition-all"
          >
            👤 Profile Settings
          </Link>
          <form action="/auth/sign-out" method="post" className="w-full">
            <button 
              type="submit" 
              className="w-full mt-2 text-left flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500/70 hover:bg-red-50 transition-all"
            >
              🚪 Sign Out
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-[#e8edf2] to-[#f0f4f8]">
        {children}
      </main>
    </div>
  );
}
