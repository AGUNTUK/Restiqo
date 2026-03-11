import { DollarSign, CreditCard, Shield, Users, X } from 'lucide-react'

interface SettingsTabProps {
    platformFee: number
    setPlatformFee: (fee: number) => void
    paymentGateway: { stripe_enabled: boolean; paypal_enabled: boolean; razorpay_enabled: boolean }
    setPaymentGateway: (gw: any) => void
    termsContent: string
    setTermsContent: (content: string) => void
    privacyContent: string
    setPrivacyContent: (content: string) => void
    adminRoles: any[]
    newRoleName: string
    setNewRoleName: (name: string) => void
    newRolePermissions: string[]
    setNewRolePermissions: (perms: string[]) => void
    savePlatformFee: () => void
    savePaymentGateway: () => void
    saveTermsContent: () => void
    savePrivacyContent: () => void
    addAdminRole: () => void
    deleteAdminRole: (id: string) => void
}

export function SettingsTab({
    platformFee, setPlatformFee,
    paymentGateway, setPaymentGateway,
    termsContent, setTermsContent,
    privacyContent, setPrivacyContent,
    adminRoles,
    newRoleName, setNewRoleName,
    newRolePermissions, setNewRolePermissions,
    savePlatformFee, savePaymentGateway,
    saveTermsContent, savePrivacyContent,
    addAdminRole, deleteAdminRole,
}: SettingsTabProps) {
    return (
        <div className="space-y-6">
            <div className="clay p-6 hover:shadow-lg transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="p-2 bg-green-500/10 rounded-lg">
                        <DollarSign className="w-5 h-5 text-green-500" />
                    </div>
                    Platform Fee Configuration
                </h2>
                <div className="flex items-center gap-6">
                    <div className="flex items-center bg-white/50 dark:bg-slate-800/50 px-4 py-2 rounded-xl border border-white/20 dark:border-slate-700/30 shadow-inner">
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 mr-3 uppercase tracking-wider">Fee:</span>
                        <input
                            type="number"
                            value={platformFee}
                            onChange={(e) => setPlatformFee(Number(e.target.value))}
                            className="w-20 bg-transparent text-xl font-bold text-gray-900 dark:text-white text-right focus:outline-none"
                            min={0}
                            max={100}
                        />
                        <span className="ml-2 text-lg font-bold text-gray-400">%</span>
                    </div>
                    <button
                        onClick={savePlatformFee}
                        className="px-6 py-2.5 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:bg-brand-primary-dark hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
                    >
                        Save Settings
                    </button>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-4 flex items-center gap-2 italic">
                    <span className="w-1.5 h-1.5 bg-brand-primary rounded-full"></span>
                    This fee is charged on each booking transaction automatically.
                </p>
            </div>

            <div className="clay p-6 hover:shadow-lg transition-all duration-300">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                        <CreditCard className="w-5 h-5 text-blue-500" />
                    </div>
                    Payment Gateways
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { key: 'stripe_enabled', label: 'Stripe', color: 'blue' },
                        { key: 'paypal_enabled', label: 'PayPal', color: 'indigo' },
                        { key: 'razorpay_enabled', label: 'Razorpay', color: 'orange' },
                    ].map(({ key, label, color }) => (
                        <label key={key} className={`flex flex-col gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-300 border ${(paymentGateway as any)[key]
                                ? 'bg-white/80 dark:bg-slate-800/80 border-brand-primary shadow-md'
                                : 'bg-gray-50/50 dark:bg-slate-900/50 border-transparent hover:bg-white/50 dark:hover:bg-slate-800/50'
                            }`}>
                            <div className="flex items-center justify-between">
                                <span className={`font-bold text-lg ${(paymentGateway as any)[key] ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                                    {label}
                                </span>
                                <input
                                    type="checkbox"
                                    checked={(paymentGateway as any)[key]}
                                    onChange={(e) => setPaymentGateway({ ...paymentGateway, [key]: e.target.checked })}
                                    className="w-5 h-5 rounded-full text-brand-primary focus:ring-brand-primary border-gray-300 transition-all"
                                />
                            </div>
                            <div className="mt-auto">
                                <span className={`text-xs font-bold uppercase tracking-widest px-2 py-1 rounded-md ${(paymentGateway as any)[key] ? 'bg-green-500/10 text-green-500' : 'bg-gray-200/50 text-gray-400'
                                    }`}>
                                    {(paymentGateway as any)[key] ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        </label>
                    ))}
                </div>
                <button
                    onClick={savePaymentGateway}
                    className="mt-8 w-full md:w-auto px-6 py-3 bg-brand-primary text-white font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:bg-brand-primary-dark hover:scale-[1.01] active:scale-[0.99] transition-all duration-200"
                >
                    Update Payment Methods
                </button>
            </div>

            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-purple-600" />
                    Terms & Conditions
                </h2>
                <textarea value={termsContent} onChange={(e) => setTermsContent(e.target.value)} rows={6} className="w-full px-4 py-2 border border-gray-200 rounded-lg resize-none" placeholder="Enter terms and conditions..." />
                <button onClick={saveTermsContent} className="mt-3 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90">Save Terms</button>
            </div>

            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-600" />
                    Privacy Policy
                </h2>
                <textarea value={privacyContent} onChange={(e) => setPrivacyContent(e.target.value)} rows={6} className="w-full px-4 py-2 border border-gray-200 rounded-lg resize-none" placeholder="Enter privacy policy..." />
                <button onClick={savePrivacyContent} className="mt-3 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90">Save Privacy Policy</button>
            </div>

            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-orange-600" />
                    Admin Roles & Permissions
                </h2>
                <div className="space-y-3 mb-6">
                    {adminRoles.map((role) => (
                        <div key={role.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div>
                                <p className="font-medium text-gray-900">{role.name}</p>
                                <p className="text-sm text-gray-500">Permissions: {role.permissions.join(', ')}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-sm text-gray-500">{role.users} users</span>
                                <button onClick={() => deleteAdminRole(role.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="border-t pt-4">
                    <h3 className="font-medium text-gray-900 mb-3">Add New Role</h3>
                    <div className="flex flex-col md:flex-row gap-3">
                        <input type="text" placeholder="Role name" value={newRoleName} onChange={(e) => setNewRoleName(e.target.value)} className="flex-1 px-4 py-2 border border-gray-200 rounded-lg" />
                        <select
                            multiple
                            value={newRolePermissions}
                            onChange={(e) => setNewRolePermissions(Array.from(e.target.selectedOptions, option => option.value))}
                            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg"
                        >
                            <option value="properties">Properties</option>
                            <option value="users">Users</option>
                            <option value="bookings">Bookings</option>
                            <option value="reviews">Reviews</option>
                            <option value="earnings">Earnings</option>
                            <option value="payments">Payments</option>
                            <option value="analytics">Analytics</option>
                        </select>
                        <button onClick={addAdminRole} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add Role</button>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Hold Ctrl/Cmd to select multiple permissions</p>
                </div>
            </div>
        </div>
    )
}
