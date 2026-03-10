interface NotificationsTabProps {
    notificationType: 'email' | 'push' | 'both'
    setNotificationType: (type: 'email' | 'push' | 'both') => void
    notificationTitle: string
    setNotificationTitle: (title: string) => void
    notificationMessage: string
    setNotificationMessage: (msg: string) => void
    targetAudience: 'all' | 'hosts' | 'guests' | 'specific'
    setTargetAudience: (audience: 'all' | 'hosts' | 'guests' | 'specific') => void
    targetUserQuery: string
    setTargetUserQuery: (query: string) => void
    scheduledDate: string
    setScheduledDate: (date: string) => void
    notificationHistory: any[]
    sendNotification: () => void
    scheduleNotification: () => void
}

export function NotificationsTab({
    notificationType, setNotificationType,
    notificationTitle, setNotificationTitle,
    notificationMessage, setNotificationMessage,
    targetAudience, setTargetAudience,
    targetUserQuery, setTargetUserQuery,
    scheduledDate, setScheduledDate,
    notificationHistory,
    sendNotification, scheduleNotification,
}: NotificationsTabProps) {
    return (
        <div className="space-y-6">
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Send Notification</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input type="text" value={notificationTitle} onChange={(e) => setNotificationTitle(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="Notification title" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Channel</label>
                        <select value={notificationType} onChange={(e) => setNotificationType(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                            <option value="email">Email</option>
                            <option value="push">Push</option>
                            <option value="both">Email + Push</option>
                        </select>
                    </div>
                </div>
                <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea value={notificationMessage} onChange={(e) => setNotificationMessage(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm h-28" placeholder="Write your message..." />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                        <select value={targetAudience} onChange={(e) => setTargetAudience(e.target.value as any)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm">
                            <option value="all">All Users</option>
                            <option value="hosts">Hosts</option>
                            <option value="guests">Guests</option>
                            <option value="specific">Specific User</option>
                        </select>
                    </div>
                    {targetAudience === 'specific' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User ID or Email</label>
                            <input type="text" value={targetUserQuery} onChange={(e) => setTargetUserQuery(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" placeholder="user-id or email" />
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Schedule</label>
                        <input type="datetime-local" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
                    </div>
                    <div className="flex items-end gap-2">
                        <button onClick={sendNotification} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90">Send Now</button>
                        <button onClick={scheduleNotification} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Schedule</button>
                    </div>
                </div>
            </div>

            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification History</h2>
                {notificationHistory.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No notifications sent yet</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-3">Title</th>
                                    <th className="pb-3">Audience</th>
                                    <th className="pb-3">Channel</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">When</th>
                                </tr>
                            </thead>
                            <tbody>
                                {notificationHistory.map((item: any) => (
                                    <tr key={item.id} className="border-b last:border-0">
                                        <td className="py-3 text-gray-900">
                                            <div className="font-medium">{item.title}</div>
                                            <div className="text-xs text-gray-500">{item.message}</div>
                                        </td>
                                        <td className="py-3 text-gray-600">{item.target}{item.target_user ? ` (${item.target_user})` : ''}</td>
                                        <td className="py-3 text-gray-600">{item.type}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${item.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{item.status}</span>
                                        </td>
                                        <td className="py-3 text-gray-600">{new Date(item.sent_at || item.scheduled_for || item.created_at).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}
