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
            <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filters:</span>
                    </div>
                    <select
                        value={propertyFilter.status}
                        onChange={(e) => setPropertyFilter({ ...propertyFilter, status: e.target.value as typeof propertyFilter.status })}
                        className="px-3 py-1 text-sm border border-gray-200 rounded-lg"
                    >
                        <option value="all">All Status</option>
                        <option value="approved">Approved</option>
                        <option value="pending">Pending</option>
                    </select>
                    <input
                        type="text"
                        placeholder="Search by city..."
                        value={propertyFilter.city}
                        onChange={(e) => setPropertyFilter({ ...propertyFilter, city: e.target.value })}
                        className="px-3 py-1 text-sm border border-gray-200 rounded-lg w-40"
                    />
                    <select
                        value={propertyFilter.type}
                        onChange={(e) => setPropertyFilter({ ...propertyFilter, type: e.target.value })}
                        className="px-3 py-1 text-sm border border-gray-200 rounded-lg"
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
                        className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                    >
                        Load All Properties
                    </button>
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
                                <div key={property.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                            {property.images && property.images[0] ? (
                                                <Image
                                                    src={property.images[0]}
                                                    alt={property.title}
                                                    width={64}
                                                    height={64}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Building className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-medium text-gray-900">{property.title}</h3>
                                            <p className="text-sm text-gray-600">{property.location}</p>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${property.is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                    }`}>
                                                    {property.is_approved ? 'Approved' : 'Pending'}
                                                </span>
                                                <span className={`px-2 py-0.5 text-xs rounded-full ${property.is_available ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    {property.is_available ? 'Available' : 'Unavailable'}
                                                </span>
                                                {property.property_type && (
                                                    <span className="px-2 py-0.5 text-xs rounded-full bg-purple-100 text-purple-700">
                                                        {property.property_type}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <p className="text-lg font-bold text-green-600">
                                            ৳{property.price_per_night}/night
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => togglePropertyAvailability(property.id, property.is_available || false)}
                                                className={`px-3 py-1 text-sm rounded-lg transition-colors ${property.is_available
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                                    : 'bg-green-50 text-green-600 hover:bg-green-100'
                                                    }`}
                                            >
                                                {property.is_available ? 'Mark Unavailable' : 'Mark Available'}
                                            </button>
                                            {!property.is_approved && (
                                                <>
                                                    <button
                                                        onClick={() => approveProperty(property.id)}
                                                        className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                                    >
                                                        Approve
                                                    </button>
                                                    <button
                                                        onClick={() => rejectProperty(property.id)}
                                                        className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                                    >
                                                        Reject
                                                    </button>
                                                </>
                                            )}
                                            <Link
                                                href={`/property/${property.id}`}
                                                className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
                                            >
                                                View
                                            </Link>
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
