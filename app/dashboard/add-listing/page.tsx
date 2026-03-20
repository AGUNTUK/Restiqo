import Link from "next/link";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AddListingForm from "./AddListingForm";

export default async function AddListingPage() {
  if (!isSupabaseConfigured()) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h1 className="text-3xl font-bold mb-4">Supabase Not Configured</h1>
        <p className="text-[#718096]">Check your .env.local file to configure credentials.</p>
        <Link href="/dashboard" className="text-[#6c63ff] font-bold mt-4 inline-block">← Back to dashboard</Link>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-8">
        <Link href="/dashboard" className="text-sm font-bold text-[#a0aec0] hover:text-[#2d3748] transition-colors mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-[#1a202c] tracking-tight mb-2">Host a new place</h1>
        <p className="text-[#718096]">Fill out the details below to publish your property.</p>
      </div>
      <AddListingForm />
    </div>
  );
}
