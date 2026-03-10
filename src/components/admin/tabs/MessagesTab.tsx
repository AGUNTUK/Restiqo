import { Filter, MessageSquare, X } from 'lucide-react'

interface MessagesTabProps {
    chats: any[]
    selectedChat: any | null
    setSelectedChat: (chat: any | null) => void
    messageFilter: 'all' | 'flagged'
    setMessageFilter: (filter: 'all' | 'flagged') => void
    flagConversation: (id: string, reason: string) => Promise<void>
    unflagConversation: (id: string) => Promise<void>
    sendAdminMessage: (id: string, message: string) => Promise<void>
}

export function MessagesTab({
    chats,
    selectedChat,
    setSelectedChat,
    messageFilter,
    setMessageFilter,
    flagConversation,
    unflagConversation,
    sendAdminMessage,
}: MessagesTabProps) {
    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                    </div>
                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: 'All Messages' },
                            { id: 'flagged', label: 'Flagged' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setMessageFilter(filter.id as typeof messageFilter)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${messageFilter === filter.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chats List */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Message Moderation</h2>
                {chats.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No messages found</p>
                ) : (
                    <div className="space-y-4">
                        {chats
                            .filter(c => messageFilter === 'all' || (c as any).is_flagged)
                            .map((chat) => (
                                <div key={chat.id} className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <MessageSquare className="w-5 h-5 text-blue-600" />
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Conversation {chat.id.slice(0, 8)}</p>
                                                <p className="text-sm text-gray-500">Last updated: {new Date(chat.updated_at).toLocaleString()}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {(chat as any).is_flagged && (
                                                <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Flagged</span>
                                            )}
                                            <button
                                                onClick={() => setSelectedChat(chat)}
                                                className="px-3 py-1 text-sm bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                                            >
                                                View
                                            </button>
                                            {(chat as any).is_flagged ? (
                                                <button
                                                    onClick={() => unflagConversation(chat.id)}
                                                    className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                                >
                                                    Unflag
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        const reason = prompt('Enter reason for flagging:')
                                                        if (reason) flagConversation(chat.id, reason)
                                                    }}
                                                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                                >
                                                    Flag
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>

            {/* Chat Detail Modal */}
            {selectedChat && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Conversation {selectedChat.id.slice(0, 8)}</h3>
                            <button onClick={() => setSelectedChat(null)} className="text-gray-500 hover:text-gray-700">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4 mb-6">
                            <p className="text-gray-500 text-center py-8">Chat messages would be displayed here</p>
                        </div>
                        <div className="flex gap-3">
                            <input type="text" placeholder="Type a response..." className="flex-1 px-3 py-2 border border-gray-200 rounded-lg" />
                            <button
                                onClick={() => sendAdminMessage(selectedChat.id, 'Sample response')}
                                className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
