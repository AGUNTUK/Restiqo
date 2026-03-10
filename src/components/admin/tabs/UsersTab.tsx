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
            <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>
                    <select
                        value={userFilter.role}
                        onChange={(e) => setUserFilter({ ...userFilter, role: e.target.value as typeof userFilter.role })}
                        className="px-3 py-1 text-sm border border-gray-200 rounded-lg"
                    >
                        <option value="all">All Roles</option>
                        <option value="guest">Guest</option>
                        <option value="host">Host</option>
                        <option value="admin">Admin</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={userFilter.search}
                        onChange={(e) => setUserFilter({ ...userFilter, search: e.target.value })}
                        className="px-3 py-1 text-sm border border-gray-200 rounded-lg w-48"
                    />
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
                            <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                        <span className="text-lg font-medium text-brand-primary">
                                            {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                                        <p className="text-sm text-gray-600">{user.email}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            Requested {user.host_requested_at ? new Date(user.host_requested_at).toLocaleDateString() : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => approveHostRequest(user.id)}
                                        className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => rejectHostRequest(user.id)}
                                        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
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
                                <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center">
                                            <span className="text-lg font-medium text-brand-primary">
                                                {user.full_name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{user.full_name || 'No name'}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                                                        user.role === 'host' ? 'bg-blue-100 text-blue-700' :
                                                            'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                                {user.is_verified && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-700">Verified</span>
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Joined {new Date(user.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={user.role}
                                            onChange={(e) => updateUserRole(user.id, e.target.value as 'guest' | 'host' | 'admin')}
                                            className="px-3 py-1 text-sm border border-gray-200 rounded-lg focus:border-brand-primary focus:ring-1 focus:ring-brand-primary"
                                        >
                                            <option value="guest">Guest</option>
                                            <option value="host">Host</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button
                                            onClick={() => banUser(user.id, (user as any).is_banned || false)}
                                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${(user as any).is_banned
                                                    ? 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    : 'bg-red-50 text-red-600 hover:bg-red-100'
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
