import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { toggleUserStatus } from "@/app/actions/admin";

export const metadata: Metadata = {
  title: "Admin - Users",
  description: "User Management Console",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const { data: users } = await supabase.from("users").select("*").order("created_at", { ascending: false });

  if (!users) return <div className="p-8">No users found.</div>;

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 p-6 md:p-0">
        <h1 className="text-3xl font-extrabold text-[#1a202c] mb-2">Users</h1>
        <p className="text-[#a0aec0] font-bold text-sm tracking-wide uppercase">Manage platform members</p>
      </div>

      <div className="neo-card rounded-[24px] overflow-hidden mx-6 md:mx-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-white/40 border-b border-white/60">
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Member</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Role</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Joined</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0]">Status</th>
                <th className="p-5 text-xs font-bold uppercase tracking-widest text-[#a0aec0] text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-white/40 hover:bg-white/20 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center font-extrabold text-[#4a5568] shrink-0 overflow-hidden shadow-sm">
                        {user.avatar_url ? (
                           <img src={user.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                        ) : (
                           user.full_name?.charAt(0) || "U"
                        )}
                      </div>
                      <div>
                        <p className="font-extrabold text-sm text-[#1a202c]">{user.full_name || "Unknown"}</p>
                        <p className="text-xs font-bold text-[#a0aec0] mt-1 hidden sm:block">{user.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${user.role === 'admin' ? 'bg-gradient-to-r from-[#ff6584] to-[#ff849b] text-white' : user.role === 'host' ? 'bg-[#6c63ff]/10 text-[#6c63ff] border border-[#6c63ff]/20' : 'bg-gray-100 text-gray-500'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 text-sm font-bold text-[#4a5568]">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-[10px] font-extrabold uppercase shadow-sm ${user.is_active ? 'bg-[#43e97b]/20 text-[#28a745]' : 'bg-red-100 text-red-600'}`}>
                      {user.is_active ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    {user.role !== 'admin' && (
                      <form action={toggleUserStatus}>
                         <input type="hidden" name="userId" value={user.id} />
                         <input type="hidden" name="currentStatus" value={String(user.is_active)} />
                         <button type="submit" className={`text-xs font-bold px-4 py-2 rounded-xl transition-all ${user.is_active ? "text-amber-600 hover:bg-amber-50" : "text-[#28a745] hover:bg-green-50"}`}>
                           {user.is_active ? "Suspend" : "Activate"}
                         </button>
                      </form>
                    )}
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
