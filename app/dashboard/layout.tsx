import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

/**
 * Dashboard layout — secondary auth guard on top of middleware.
 * Shows a setup prompt when Supabase is not yet configured.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // If Supabase isn't configured yet, show a setup screen instead of crashing
  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <div className="neo-card rounded-[20px] p-10">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-5"
            style={{ background: "linear-gradient(135deg,#6c63ff,#ff6584)", boxShadow: "4px 4px 14px rgba(108,99,255,0.3)" }}
          >
            🔑
          </div>
          <h1 className="font-extrabold text-2xl mb-3" style={{ color: "#1a202c" }}>
            Supabase Not Configured
          </h1>
          <p className="text-sm mb-4" style={{ color: "#718096", lineHeight: 1.7 }}>
            To enable authentication, copy <code className="font-mono bg-gray-100 px-1 rounded">.env.local.example</code> to{" "}
            <code className="font-mono bg-gray-100 px-1 rounded">.env.local</code> and add your Supabase credentials.
          </p>
          <div
            className="neo-inset rounded-xl p-4 text-left text-sm font-mono mb-6"
            style={{ color: "#4a5568" }}
          >
            <p>NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co</p>
            <p>NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key</p>
          </div>
          <p className="text-xs" style={{ color: "#a0aec0" }}>
            Find these values in your Supabase project under{" "}
            <strong>Settings → API</strong>.
          </p>
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return <>{children}</>;
}
