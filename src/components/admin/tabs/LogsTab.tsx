import { Filter, Mail, CreditCard, Phone, Shield } from 'lucide-react'

interface LogsTabProps {
    emailLogs: any[]
    paymentLogs: any[]
    phoneLogs: any[]
    auditLogs: any[]
    logFilter: 'all' | 'email' | 'payment' | 'phone' | 'audit'
    setLogFilter: (filter: 'all' | 'email' | 'payment' | 'phone' | 'audit') => void
    exportLogs: (type: string) => void
}

export function LogsTab({ emailLogs, paymentLogs, phoneLogs, auditLogs, logFilter, setLogFilter, exportLogs }: LogsTabProps) {
    return (
        <div className="space-y-6">
            <div className="clay p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                    </div>
                    <div className="flex gap-2">
                        {[
                            { id: 'all', label: 'All Logs' },
                            { id: 'email', label: 'Email' },
                            { id: 'payment', label: 'Payment' },
                            { id: 'phone', label: 'Phone' },
                            { id: 'audit', label: 'Audit' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setLogFilter(filter.id as typeof logFilter)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${logFilter === filter.id ? 'bg-brand-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {(logFilter === 'all' || logFilter === 'email') && (
                <div className="clay p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-blue-600" />
                            Email Logs
                        </h2>
                        <button onClick={() => exportLogs('email')} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Export</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-3">To</th>
                                    <th className="pb-3">Subject</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Sent At</th>
                                    <th className="pb-3">Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {emailLogs.map((log: any) => (
                                    <tr key={log.id} className="border-b last:border-0">
                                        <td className="py-3 text-gray-900">{log.to}</td>
                                        <td className="py-3 text-gray-600">{log.subject}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                                        </td>
                                        <td className="py-3 text-gray-600">{new Date(log.sent_at).toLocaleString()}</td>
                                        <td className="py-3 text-red-600">{log.error || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {(logFilter === 'all' || logFilter === 'payment') && (
                <div className="clay p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-green-600" />
                            Payment Logs
                        </h2>
                        <button onClick={() => exportLogs('payment')} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Export</button>
                    </div>
                    {paymentLogs.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No payment logs available</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="text-left text-sm text-gray-500 border-b">
                                        <th className="pb-3">ID</th>
                                        <th className="pb-3">Amount</th>
                                        <th className="pb-3">Status</th>
                                        <th className="pb-3">Method</th>
                                        <th className="pb-3">Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paymentLogs.map((log: any) => (
                                        <tr key={log.id} className="border-b last:border-0">
                                            <td className="py-3 text-gray-900 font-mono text-sm">{log.id}</td>
                                            <td className="py-3 text-gray-900">৳{log.amount?.toLocaleString()}</td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 text-xs rounded-full ${log.status === 'completed' ? 'bg-green-100 text-green-700' : log.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{log.status}</span>
                                            </td>
                                            <td className="py-3 text-gray-600">{log.payment_method || 'N/A'}</td>
                                            <td className="py-3 text-gray-600">{log.created_at ? new Date(log.created_at).toLocaleString() : 'N/A'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {(logFilter === 'all' || logFilter === 'phone') && (
                <div className="clay p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Phone className="w-5 h-5 text-purple-600" />
                            Phone Verification Logs
                        </h2>
                        <button onClick={() => exportLogs('phone')} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Export</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-3">Phone</th>
                                    <th className="pb-3">Type</th>
                                    <th className="pb-3">Status</th>
                                    <th className="pb-3">Timestamp</th>
                                    <th className="pb-3">Error</th>
                                </tr>
                            </thead>
                            <tbody>
                                {phoneLogs.map((log: any) => (
                                    <tr key={log.id} className="border-b last:border-0">
                                        <td className="py-3 text-gray-900">{log.phone}</td>
                                        <td className="py-3 text-gray-600">{log.type}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 text-xs rounded-full ${log.status === 'verified' || log.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{log.status}</span>
                                        </td>
                                        <td className="py-3 text-gray-600">{new Date(log.sent_at).toLocaleString()}</td>
                                        <td className="py-3 text-red-600">{log.error || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {(logFilter === 'all' || logFilter === 'audit') && (
                <div className="clay p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-orange-600" />
                            Audit Logs
                        </h2>
                        <button onClick={() => exportLogs('audit')} className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Export</button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-sm text-gray-500 border-b">
                                    <th className="pb-3">Action</th>
                                    <th className="pb-3">Target</th>
                                    <th className="pb-3">Admin</th>
                                    <th className="pb-3">Reason</th>
                                    <th className="pb-3">Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {auditLogs.map((log: any) => (
                                    <tr key={log.id} className="border-b last:border-0">
                                        <td className="py-3"><span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">{log.action.replace('_', ' ')}</span></td>
                                        <td className="py-3 text-gray-900">{log.target}</td>
                                        <td className="py-3 text-gray-600">{log.admin}</td>
                                        <td className="py-3 text-gray-600">{log.reason || '-'}</td>
                                        <td className="py-3 text-gray-600">{new Date(log.timestamp).toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
