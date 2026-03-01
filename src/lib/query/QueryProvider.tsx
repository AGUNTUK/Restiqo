'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactNode, useState } from 'react'

interface QueryProviderProps {
    children: ReactNode
}

export function QueryProvider({ children }: QueryProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        // Stale time: 5 minutes
                        staleTime: 5 * 60 * 1000,
                        // Cache time: 30 minutes
                        gcTime: 30 * 60 * 1000,
                        // Retry failed requests up to 3 times
                        retry: 3,
                        // Retry delay with exponential backoff
                        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
                        // Refetch on window focus
                        refetchOnWindowFocus: true,
                        // Don't refetch on mount if data is fresh
                        refetchOnMount: true,
                    },
                    mutations: {
                        // Retry mutations once
                        retry: 1,
                    },
                },
            })
    )

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    )
}

// Query keys factory for consistent key management
export const queryKeys = {
    // Properties
    properties: {
        all: ['properties'] as const,
        lists: () => [...queryKeys.properties.all, 'list'] as const,
        list: (filters: Record<string, unknown>) =>
            [...queryKeys.properties.lists(), filters] as const,
        details: () => [...queryKeys.properties.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.properties.details(), id] as const,
        byHost: (hostId: string) => [...queryKeys.properties.all, 'host', hostId] as const,
    },

    // Bookings
    bookings: {
        all: ['bookings'] as const,
        lists: () => [...queryKeys.bookings.all, 'list'] as const,
        list: (userId: string) => [...queryKeys.bookings.lists(), userId] as const,
        details: () => [...queryKeys.bookings.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.bookings.details(), id] as const,
        byProperty: (propertyId: string) =>
            [...queryKeys.bookings.all, 'property', propertyId] as const,
    },

    // Reviews
    reviews: {
        all: ['reviews'] as const,
        lists: () => [...queryKeys.reviews.all, 'list'] as const,
        list: (propertyId: string) => [...queryKeys.reviews.lists(), propertyId] as const,
        byUser: (userId: string) => [...queryKeys.reviews.all, 'user', userId] as const,
    },

    // Wishlist
    wishlist: {
        all: ['wishlist'] as const,
        list: (userId: string) => [...queryKeys.wishlist.all, userId] as const,
    },

    // User
    user: {
        all: ['user'] as const,
        profile: (userId: string) => [...queryKeys.user.all, 'profile', userId] as const,
        notifications: (userId: string) =>
            [...queryKeys.user.all, 'notifications', userId] as const,
    },

    // Analytics (for hosts)
    analytics: {
        all: ['analytics'] as const,
        host: (hostId: string) => [...queryKeys.analytics.all, 'host', hostId] as const,
        property: (propertyId: string) =>
            [...queryKeys.analytics.all, 'property', propertyId] as const,
    },

    // Messages
    messages: {
        all: ['messages'] as const,
        conversation: (conversationId: string) =>
            [...queryKeys.messages.all, 'conversation', conversationId] as const,
    },
}

