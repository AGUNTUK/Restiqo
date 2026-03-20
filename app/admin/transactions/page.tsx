import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin - Transactions",
  description: "Platform Financial Ledger",
};

export default async function AdminTransactionsPage() {
  const supabase = await createClient();
  const { data: transactions } = await supabase
    .from("transactions")
    .select("*, users!transactions_user_id_fkey(full_name)")
    .order("created_at", { ascending: false });

  if (!transactions) return <div className="p-8">No transactions found.</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-0">
        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Transactions Ledger</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">All Platform Financial Movements</p>
      </div>

      <div className="neo-card rounded-[24px] overflow-hidden mx-6 md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Trans ID / Date</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">User</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Booking Ref</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Type</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-white/40 hover:bg-white/20 transition-colors">
                  <td className="p-5">
                    <p className="text-sm font-extrabold text-[#1a202c] mb-1">{tx.id.split("-")[0]}</p>
                    <p className="text-xs font-bold text-[#718096]">{new Date(tx.created_at).toLocaleString()}</p>
                  </td>
                  <td className="p-5 text-sm font-bold text-[#4a5568]">
                    {(tx.users as any)?.full_name || "System"}
                  </td>
                  <td className="p-5 text-xs font-bold text-[#a0aec0]">
                    {tx.booking_id?.split("-")[0] || "N/A"}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${tx.type === 'commission' ? 'bg-gradient-to-r from-[#6c63ff] to-[#ff6584] text-white' : tx.type === 'payment' ? 'bg-[#43e97b]/20 text-[#28a745]' : tx.type === 'refund' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="p-5 text-sm font-extrabold text-[#6c63ff] text-right">
                    {tx.type === 'refund' || tx.type === 'payout' ? "-" : "+"} ৳{Math.round(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
