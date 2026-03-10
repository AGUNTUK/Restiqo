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
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    Platform Fee Configuration
                </h2>
                <div className="flex items-center gap-4">
                    <div className="flex items-center">
                        <span className="text-gray-700 mr-2">Platform Fee:</span>
                        <input
                            type="number"
                            value={platformFee}
                            onChange={(e) => setPlatformFee(Number(e.target.value))}
                            className="w-24 px-3 py-2 border border-gray-200 rounded-lg text-center"
                            min={0}
                            max={100}
                        />
                        <span className="ml-2 text-gray-600">%</span>
                    </div>
                    <button onClick={savePlatformFee} className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90">Save</button>
                </div>
                <p className="text-sm text-gray-500 mt-2">This fee is charged on each booking transaction</p>
            </div>

            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    Payment Gateway Configuration
                </h2>
                <div className="space-y-3">
                    {[
                        { key: 'stripe_enabled', label: 'Stripe' },
                        { key: 'paypal_enabled', label: 'PayPal' },
                        { key: 'razorpay_enabled', label: 'Razorpay' },
                    ].map(({ key, label }) => (
                        <label key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={(paymentGateway as any)[key]}
                                    onChange={(e) => setPaymentGateway({ ...paymentGateway, [key]: e.target.checked })}
                                    className="w-4 h-4 text-brand-primary"
                                />
                                <span className="font-medium text-gray-900">{label}</span>
                            </div>
                            <span className={(paymentGateway as any)[key] ? 'text-sm text-green-600' : 'text-sm text-gray-400'}>
                                {(paymentGateway as any)[key] ? 'Enabled' : 'Disabled'}
                            </span>
                        </label>
                    ))}
                </div>
                <button onClick={savePaymentGateway} className="mt-4 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90">Save Gateway Settings</button>
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
