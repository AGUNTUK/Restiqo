import Link from 'next/link'
import { Filter, Star } from 'lucide-react'

interface ReviewsTabProps {
    reviews: any[]
    reviewFilter: 'all' | 'pending' | 'approved' | 'rejected'
    setReviewFilter: (filter: 'all' | 'pending' | 'approved' | 'rejected') => void
    updateReviewStatus: (id: string, status: 'approved' | 'rejected') => Promise<void>
    respondToReview: (id: string, response: string) => Promise<void>
}

export function ReviewsTab({
    reviews,
    reviewFilter,
    setReviewFilter,
    updateReviewStatus,
    respondToReview,
}: ReviewsTabProps) {
    return (
        <div className="space-y-6">
            {/* Filter Bar */}
            <div className="clay p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {[
                            { id: 'all', label: 'All' },
                            { id: 'pending', label: 'Pending' },
                            { id: 'approved', label: 'Approved' },
                            { id: 'rejected', label: 'Rejected' },
                        ].map((filter) => (
                            <button
                                key={filter.id}
                                onClick={() => setReviewFilter(filter.id as typeof reviewFilter)}
                                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${reviewFilter === filter.id
                                    ? 'bg-brand-primary text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Reviews List */}
            <div className="clay p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Review Moderation</h2>
                {reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">No reviews found</p>
                ) : (
                    <div className="space-y-4">
                        {reviews
                            .filter(r => {
                                if (reviewFilter === 'pending') return !(r as any).is_approved
                                if (reviewFilter === 'approved') return (r as any).is_approved
                                if (reviewFilter === 'rejected') return (r as any).is_approved === false && r.host_response
                                return true
                            })
                            .map((review) => (
                                <div key={review.id} className="p-4 bg-gray-50 rounded-xl">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <Star
                                                        key={star}
                                                        className={`w-4 h-4 ${star <= review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                                                    />
                                                ))}
                                            </div>
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${(review as any).is_approved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                {(review as any).is_approved ? 'Approved' : 'Pending'}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <p className="text-gray-700 mb-3">{review.comment}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                        <span>By: {review.guest_name || 'Guest'}</span>
                                        {review.property_id && (
                                            <Link href={`/property/${review.property_id}`} className="text-brand-primary hover:underline">
                                                View Property
                                            </Link>
                                        )}
                                    </div>
                                    {(review as any).host_response && (
                                        <div className="p-3 bg-blue-50 rounded-lg mb-3">
                                            <p className="text-sm font-medium text-blue-700 mb-1">Host Response:</p>
                                            <p className="text-sm text-blue-800">{(review as any).host_response}</p>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        {!(review as any).is_approved && (
                                            <>
                                                <button
                                                    onClick={() => updateReviewStatus(review.id, 'approved')}
                                                    className="px-3 py-1 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => updateReviewStatus(review.id, 'rejected')}
                                                    className="px-3 py-1 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}
                                        {!review.host_response && (
                                            <button
                                                onClick={() => {
                                                    const response = prompt('Enter your response to this review:')
                                                    if (response) respondToReview(review.id, response)
                                                }}
                                                className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                                            >
                                                Respond
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}
