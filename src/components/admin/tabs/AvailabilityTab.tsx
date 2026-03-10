import { useState } from 'react'
import Image from 'next/image'
import { Building, X } from 'lucide-react'
import { Property } from '@/types/database'

interface AvailabilityTabProps {
    availabilityProperties: Property[]
    selectedProperty: Property | null
    setSelectedProperty: (property: Property | null) => void
    overridePrice: string
    setOverridePrice: (price: string) => void
    bulkPropertyIds: string[]
    setBulkPropertyIds: (ids: string[]) => void
    updatePropertyAvailability: (id: string, isAvailable: boolean) => Promise<void>
    bulkUpdateAvailability: (ids: string[], isAvailable: boolean) => Promise<void>
    setDateOverride: (id: string, start: string, end: string, price: number) => Promise<void>
}

export function AvailabilityTab({
    availabilityProperties,
    selectedProperty,
    setSelectedProperty,
    overridePrice,
    setOverridePrice,
    bulkPropertyIds,
    setBulkPropertyIds,
    updatePropertyAvailability,
    bulkUpdateAvailability,
    setDateOverride,
}: AvailabilityTabProps) {
    return (
        <div className="space-y-6">
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="clay p-4">
                    <p className="text-sm text-gray-600">Total Properties</p>
                    <p className="text-2xl font-bold text-gray-900">{availabilityProperties.length}</p>
                </div>
                <div className="clay p-4">
                    <p className="text-sm text-gray-600">Available</p>
                    <p className="text-2xl font-bold text-green-600">
                        {availabilityProperties.filter(p => p.is_available).length}
                    </p>
                </div>
                <div className="clay p-4">
                    <p className="text-sm text-gray-600">Unavailable</p>
                    <p className="text-2xl font-bold text-red-600">
                        {availabilityProperties.filter(p => !p.is_available).length}
                    </p>
                </div>
            </div>

            {/* Bulk Actions */}
            <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Bulk Actions:</span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => bulkUpdateAvailability(bulkPropertyIds, true)}
                            disabled={bulkPropertyIds.length === 0}
                            className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 disabled:opacity-50"
                        >
                            Mark Available
                        </button>
                        <button
                            onClick={() => bulkUpdateAvailability(bulkPropertyIds, false)}
                            disabled={bulkPropertyIds.length === 0}
                            className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 disabled:opacity-50"
                        >
                            Mark Unavailable
                        </button>
                    </div>
                    <span className="text-sm text-gray-500">{bulkPropertyIds.length} selected</span>
                </div>
            </div>

            {/* Properties List */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Property Availability</h2>
                {availabilityProperties.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No properties found</p>
                ) : (
                    <div className="space-y-4">
                        {availabilityProperties.map((property) => (
                            <div key={property.id} className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="checkbox"
                                            checked={bulkPropertyIds.includes(property.id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setBulkPropertyIds([...bulkPropertyIds, property.id])
                                                } else {
                                                    setBulkPropertyIds(bulkPropertyIds.filter(id => id !== property.id))
                                                }
                                            }}
                                            className="w-4 h-4 rounded"
                                        />
                                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                                            {property.images && property.images[0] ? (
                                                <Image src={property.images[0]} alt={property.title} width={48} height={48} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Building className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">{property.title}</p>
                                            <p className="text-sm text-gray-600">{property.location}</p>
                                            <p className="text-sm text-brand-primary font-medium">৳{property.price_per_night}/night</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 text-sm rounded-lg font-medium ${property.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {property.is_available ? 'Available' : 'Unavailable'}
                                        </span>
                                        <button
                                            onClick={() => updatePropertyAvailability(property.id, !property.is_available)}
                                            className={`px-3 py-1 text-sm rounded-lg transition-colors ${property.is_available ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                                        >
                                            {property.is_available ? 'Make Unavailable' : 'Make Available'}
                                        </button>
                                        <button
                                            onClick={() => { setSelectedProperty(property); setOverridePrice('') }}
                                            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                        >
                                            Set Override Price
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Override Price Modal */}
            {selectedProperty && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Set Override Price for {selectedProperty.title}
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Override Price (BDT)</label>
                                <input
                                    type="number"
                                    value={overridePrice}
                                    onChange={(e) => setOverridePrice(e.target.value)}
                                    placeholder={`Current: ৳${selectedProperty.price_per_night}`}
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                <input type="date" className="w-full px-3 py-2 border border-gray-200 rounded-lg" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setSelectedProperty(null); setOverridePrice('') }}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (overridePrice) {
                                        setDateOverride(selectedProperty.id, '', '', parseFloat(overridePrice))
                                        setSelectedProperty(null)
                                        setOverridePrice('')
                                    }
                                }}
                                className="flex-1 px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-primary/90"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
