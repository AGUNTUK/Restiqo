import { Filter } from 'lucide-react'
import { User } from '@/types/database'

interface UserFilter {
    role: 'all' | 'guest' | 'host' | 'admin'
    search: string
}

interface UsersTabProps {
    userFilter: UserFilter
    setUserFilter: (filter: UserFilter) => void
    recentUsers: User[]
    pendingHostRequests: User[]
    approveHostRequest: (id: string) => Promise<void>
    rejectHostRequest: (id: string) => Promise<void>
    updateUserRole: (id: string, role: 'guest' | 'host' | 'admin') => Promise<void>
    banUser: (id: string, isBanned: boolean) => Promise<void>
}

export function UsersTab({
    userFilter,
    setUserFilter,
    recentUsers,
    pendingHostRequests,
    approveHostRequest,
    rejectHostRequest,
    updateUserRole,
    banUser,
}: UsersTabProps) {
    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="clay p-5">
                <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-gray-400" />
                        <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filters</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 flex-1">
                        <select
                            value={userFilter.role}
                            onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value as typeof userFilter.role })}
                            className="bg-white/50 dark:bg-slate-800/50 px-4 py-2 text-sm font-semibold border border-white/20 dark:border-slate-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                        >
                            <option value="all">All Roles</option>
                            <option value="guest">Guest</option>
                            <option value="host">Host</option>
                            <option value="admin">Admin</option>
                        </select>
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={userFilter.search}
                                onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                                className="w-full bg-white/50 dark:bg-slate-800/50 px-4 py-2 text-sm font-semibold border border-white/20 dark:border-slate-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Host Applications */}
            <div className="clay p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-gray-900">Host Applications</h2>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-sm rounded-full">
                        {pendingHostRequests.length} pending
                    </span>
                </div>
                {pendingHostRequests.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No host applications</p>
                ) : (
                    <div className="space-y-4">
                        {pendingHostRequests.map((user) => (
                            <div key={user.id} className="flex items-center justify-between p-5 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-sm hover:shadow-md transition-all duration-300">
                                <div className="flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20">
                                        <span className="text-xl font-bold text-brand-primary">
                                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white text-lg">{user.full_name || 'No name'}</p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
                                        <p className="text-xs text-gray-400 mt-1 italic">
                                            Requested {user.host_requested_at ? new Date(user.host_requested_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => approveHostRequest(user.id)}
                                        className="px-4 py-2 text-sm font-bold bg-green-500/10 text-green-600 rounded-xl hover:bg-green-500 hover:text-white transition-all duration-200 border border-green-500/20"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => rejectHostRequest(user.id)}
                                        className="px-4 py-2 text-sm font-bold bg-red-500/10 text-red-600 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-200 border border-red-500/20"
                                    >
                                        Reject
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Users List */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">User Management</h2>
                {recentUsers.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No users found</p>
                ) : (
                    <div className="space-y-4">
                        {recentUsers
                            .filter(u => {
                                if (userFilter.role !== 'all' && u.role !== userFilter.role) return false
                                if (userFilter.search) {
                                    const searchLower = userFilter.search.toLowerCase()
                                    const nameMatch = u.full_name?.toLowerCase().includes(searchLower)
                                    const emailMatch = u.email.toLowerCase().includes(searchLower)
                                    if (!nameMatch && !emailMatch) return false
                                }
                                return true
                            })
                            .map((user) => (
                                <div key={user.id} className="flex items-center justify-between p-5 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-brand-primary/10 flex items-center justify-center border border-brand-primary/20 shadow-inner">
                                            <span className="text-xl font-bold text-brand-primary">
                                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 dark:text-white text-lg">{user.full_name || 'No name'}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 border-purple-200' :
                                                    user.role === 'host' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                                        'bg-gray-100 text-gray-600 border-gray-200'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                                {user.is_verified && (
                                                    <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-emerald-100 text-emerald-700 border border-emerald-200">Verified</span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-2 font-medium uppercase tracking-tight">
                                                Joined {new Date(user.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUserRole(user.id, e.target.value as 'guest' | 'host' | 'admin')}
                                            className="bg-white/50 dark:bg-slate-800/50 px-3 py-1.5 text-xs font-bold border border-white/20 dark:border-slate-700/30 rounded-xl focus:outline-none transition-all"
                                        >
                                            <option value="guest">Guest</option>
                                            <option value="host">Host</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button
                                            onClick={() => banUser(user.id, (user as any).is_banned || false)}
                                            className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 border ${(user as any).is_banned
                                                ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                                : 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500 hover:text-white'
                                                }`}
                                        >
                                            {(user as any).is_banned ? 'Unban' : 'Ban'}
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}
