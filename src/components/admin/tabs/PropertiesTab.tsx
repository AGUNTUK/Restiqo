import { Filter, Building } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Property } from '@/types/database'

interface PropertyFilter {
    status: 'all' | 'approved' | 'pending'
    city: string
    type: string
}

interface PropertiesTabProps {
    propertyFilter: PropertyFilter
    setPropertyFilter: (filter: PropertyFilter) => void
    allProperties: Property[]
    pendingProperties: Property[]
    loadAllProperties: () => Promise<void>
    togglePropertyAvailability: (id: string, currentStatus: boolean) => Promise<void>
    approveProperty: (id: string) => Promise<void>
    rejectProperty: (id: string) => Promise<void>
}

export function PropertiesTab({
    propertyFilter,
    setPropertyFilter,
    allProperties,
    pendingProperties,
    loadAllProperties,
    togglePropertyAvailability,
    approveProperty,
    rejectProperty,
}: PropertiesTabProps) {
    const propertiesToDisplay = allProperties.length > 0 ? allProperties : pendingProperties

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
                            value={propertyFilter.status}
                            onChange={(e) => setPropertyFilter({ ...propertyFilter, status: e.target.value as typeof propertyFilter.status })}
                            className="bg-white/50 dark:bg-slate-800/50 px-4 py-2 text-sm font-semibold border border-white/20 dark:border-slate-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer"
                        >
                            <option value="all">All Status</option>
                            <option value="approved">Approved</option>
                            <option value="pending">Pending</option>
                        </select>
                        <div className="relative flex-1 max-w-[200px]">
                            <input
                                type="text"
                                placeholder="Search by city..."
                                value={propertyFilter.city}
                                onChange={(e) => setPropertyFilter({ ...propertyFilter, city: e.target.value })}
                                className="w-full bg-white/50 dark:bg-slate-800/50 px-4 py-2 text-sm font-semibold border border-white/20 dark:border-slate-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all"
                            />
                        </div>
                        <select
                            value={propertyFilter.type}
                            onChange={(e) => setPropertyFilter({ ...propertyFilter, type: e.target.value })}
                            className="bg-white/50 dark:bg-slate-800/50 px-4 py-2 text-sm font-semibold border border-white/20 dark:border-slate-700/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-primary/20 transition-all cursor-pointer"
                        >
                            <option value="">All Types</option>
                            <option value="apartment">Apartment</option>
                            <option value="hotel">Hotel</option>
                            <option value="tour">Tour</option>
                            <option value="villa">Villa</option>
                            <option value="resort">Resort</option>
                        </select>
                        <button
                            onClick={loadAllProperties}
                            className="ml-auto px-4 py-2 bg-brand-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-brand-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Refresh All
                        </button>
                    </div>
                </div>
            </div>

            {/* Properties List */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Management</h2>
                {propertiesToDisplay.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No properties found</p>
                ) : (
                    <div className="space-y-4">
                        {propertiesToDisplay
                            .filter(p => {
                                if (propertyFilter.status === 'approved' && !p.is_approved) return false
                                if (propertyFilter.status === 'pending' && p.is_approved) return false
                                if (propertyFilter.city && !p.city?.toLowerCase().includes(propertyFilter.city.toLowerCase())) return false
                                if (propertyFilter.type && p.property_type !== propertyFilter.type) return false
                                return true
                            })
                            .map((property) => (
                                <div key={property.id} className="flex items-center justify-between p-5 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-white/20 dark:border-slate-700/30 shadow-sm hover:shadow-md transition-all duration-300">
                                    <div className="flex items-center gap-5">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-slate-700/50 flex-shrink-0 border border-white/20 dark:border-slate-700/30 shadow-inner">
                                            {property.images && property.images[0] ? (
                                                <Image
                                                    src={property.images[0]}
                                                    alt={property.title}
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Building className="w-8 h-8 text-gray-300 dark:text-slate-600" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 dark:text-white text-lg">{property.title}</h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{property.location}</p>
                                            <div className="flex items-center gap-3 mt-2">
                                                <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border ${property.is_approved
                                                    ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                                    : 'bg-amber-100 text-amber-700 border-amber-200'
                                                    }`}>
                                                    {property.is_approved ? 'Approved' : 'Pending'}
                                                </span>
                                                <span className={`px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-lg border ${property.is_available
                                                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                                                    : 'bg-rose-100 text-rose-700 border-rose-200'
                                                    }`}>
                                                    {property.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                                {property.property_type && (
                                                    <span className="px-2.5 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-lg bg-purple-100 text-purple-700 border border-purple-200">
                                                        {property.property_type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <p className="text-xl font-black text-brand-primary">
                                                ৳{property.price_per_night}
                                            </p>
                                            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mt-1">/ Night</p>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => togglePropertyAvailability(property.id, property.is_available || false)}
                                                    className={`px-4 py-1.5 text-xs font-bold rounded-xl transition-all duration-200 border ${property.is_available
                                                        ? 'bg-rose-500/10 text-rose-600 border-rose-500/20 hover:bg-rose-500 hover:text-white'
                                                        : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                                        }`}
                                                >
                                                    {property.is_available ? 'Deactivate' : 'Activate'}
                                                </button>
                                                <Link
                                                    href={`/property/${property.id}`}
                                                    className="px-4 py-1.5 text-xs font-bold bg-white/50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 rounded-xl border border-white/20 dark:border-slate-700/30 hover:bg-brand-primary hover:text-white hover:border-brand-primary transition-all"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                            {!property.is_approved && (
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => approveProperty(property.id)}
                                                        className="flex-1 px-4 py-1.5 text-xs font-bold bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-500/20 hover:bg-emerald-600 transition-all"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => rejectProperty(property.id)}
                                                        className="px-4 py-1.5 text-xs font-bold bg-rose-500 text-white rounded-xl shadow-md shadow-rose-500/20 hover:bg-rose-600 transition-all"
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}
