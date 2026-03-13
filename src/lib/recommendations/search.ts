'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Property } from '@/types/database'

export interface SearchFilters {
  location?: string
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  guests?: number
  bedrooms?: number
  amenities?: string[]
  checkIn?: string
  checkOut?: string
}

export interface SearchResult {
  property: Property
  score: number
  reason: string
}

export interface AIRecommendation {
  id: string
  type: 'similar' | 'trending' | 'popular' | 'personalized' | 'location_based'
  properties: SearchResult[]
}

// Weight configuration for recommendations
const weights = {
  exactMatch: 100,
  priceRange: 50,
  amenities: 30,
  rating: 20,
  recency: 15,
  popularity: 10
}

interface WishlistRow {
  property_id: string
}

export class SearchRecommendationEngine {
  private supabase: ReturnType<typeof createClient>
  
  constructor() {
    this.supabase = createClient()
  }

  // Log search to history for future recommendations
  async logSearch(
    userId: string | null,
    query: string,
    filters: SearchFilters,
    resultsCount: number,
    clickedPropertyIds: string[] = [],
    sessionId?: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('search_history')
        .insert({
          user_id: userId,
          search_query: query,
          filters: JSON.stringify(filters),
          results_count: resultsCount,
          clicked_property_ids: clickedPropertyIds,
          session_id: sessionId,
          created_at: new Date().toISOString()
        } as any)
    } catch (error) {
      console.error('Error logging search:', error)
    }
  }

  // Get user's search history for personalization
  async getUserSearchHistory(userId: string, limit: number = 10): Promise<string[]> {
    try {
      const { data } = await this.supabase
        .from('search_history')
        .select('search_query')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      return data?.map((item: { search_query: string }) => item.search_query) || []
    } catch (error) {
      console.error('Error getting search history:', error)
      return []
    }
  }

  // Get user's clicked properties for similarity matching
  async getUserClickedProperties(userId: string, limit: number = 20): Promise<Property[]> {
    try {
      const { data } = await this.supabase
        .from('search_history')
        .select('clicked_property_ids')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      const propertyIds = data?.flatMap((item: { clicked_property_ids: string[] }) => item.clicked_property_ids || []) || []
      
      if (propertyIds.length === 0) return []

      // Get unique property IDs
      const uniqueIds = [...new Set(propertyIds)]
      
      const { data: properties } = await this.supabase
        .from('properties')
        .select('*')
        .in('id', uniqueIds)
        .eq('is_approved', true)
        .eq('is_available', true)

      return properties || []
    } catch (error) {
      console.error('Error getting clicked properties:', error)
      return []
    }
  }

  // Get trending properties (based on recent searches and bookings)
  async getTrendingProperties(limit: number = 10): Promise<Property[]> {
    try {
      // Get properties with most searches in last 7 days
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const { data: searchData } = await this.supabase
        .from('search_history')
        .select('filters')
        .gte('created_at', sevenDaysAgo.toISOString())

      // Aggregate property types and locations from searches
      const locationCounts: Record<string, number> = {}
      const typeCounts: Record<string, number> = {}

      searchData?.forEach((item: { filters: unknown }) => {
        const filters = typeof item.filters === 'string' ? JSON.parse(item.filters) : item.filters as SearchFilters
        if (filters?.location) {
          locationCounts[filters.location] = (locationCounts[filters.location] || 0) + 1
        }
        if (filters?.propertyType) {
          typeCounts[filters.propertyType] = (typeCounts[filters.propertyType] || 0) + 1
        }
      })

      // Find most popular location and type
      const popularLocation = Object.entries(locationCounts)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || ''
      // Query properties matching trending criteria
      let query = this.supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .eq('is_available', true)
        .order('rating', { ascending: false })
        .order('review_count', { ascending: false })
        .limit(limit)

      if (popularLocation) {
        query = query.ilike('location', `%${popularLocation}%`)
      }

      const { data: properties } = await query

      return properties || []
    } catch (error) {
      console.error('Error getting trending properties:', error)
      // Fallback to top-rated properties
      const { data } = await this.supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .eq('is_available', true)
        .order('rating', { ascending: false })
        .order('review_count', { ascending: false })
        .limit(limit)

      return data || []
    }
  }

  // Get similar properties based on a reference property
  async getSimilarProperties(propertyId: string, limit: number = 6): Promise<SearchResult[]> {
    try {
      // Get the reference property
      const { data: referencePropertyRaw } = await this.supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single()
      const referenceProperty = referencePropertyRaw as any

      if (!referenceProperty) return []

      // Find similar properties
      const { data: similarProperties } = await this.supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .eq('is_available', true)
        .neq('id', propertyId)
        .eq('property_type', (referenceProperty as any).property_type)
        .limit(limit * 3)

      if (!similarProperties) return []

      // Score each property
      const scored = similarProperties.map((property: Property) => {
        let score = 0
        const reasons: string[] = []

        // Same city (high weight)
        if (property.city === referenceProperty.city) {
          score += weights.exactMatch
          reasons.push(`Same city (${property.city})`)
        }

        // Price similarity (within 30%)
        const priceDiff = Math.abs(property.price_per_night - referenceProperty.price_per_night)
        const pricePercentDiff = priceDiff / referenceProperty.price_per_night
        if (pricePercentDiff < 0.3) {
          score += weights.priceRange * (1 - pricePercentDiff)
          reasons.push('Similar price')
        }

        // Same category
        if (property.category === referenceProperty.category) {
          score += weights.amenities
          reasons.push('Same category')
        }

        // Amenities overlap
        const refAmenities = referenceProperty.amenities || []
        const propAmenities = property.amenities || []
        const overlap = refAmenities.filter((a: string) => propAmenities.includes(a)).length
        if (overlap > 0) {
          score += weights.amenities * (overlap / Math.max(refAmenities.length, 1))
          reasons.push(`${overlap} similar amenities`)
        }

        // Rating similarity
        const ratingDiff = Math.abs(property.rating - referenceProperty.rating)
        if (ratingDiff < 0.5) {
          score += weights.rating * (1 - ratingDiff)
          reasons.push('Similar rating')
        }

        return {
          property,
          score,
          reason: reasons.join(', ') || 'Recommended for you'
        }
      })

      // Sort by score and return top results
      const sortedResults = scored.sort((a: SearchResult, b: SearchResult) => b.score - a.score)
      return sortedResults.slice(0, limit)
    } catch (error) {
      console.error('Error getting similar properties:', error)
      return []
    }
  }

  // Get personalized recommendations for a user
  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<SearchResult[]> {
    try {
      // Get user's search history
      const searchHistory = await this.getUserSearchHistory(userId, 20)
      
      // Get user's clicked/liked properties
      const clickedProperties = await this.getUserClickedProperties(userId, 10)

      // Get user's wishlist
      const { data: wishlist } = await this.supabase
        .from('wishlists')
        .select('property_id')
        .eq('user_id', userId)

      const wishlistIds = wishlist?.map((w: WishlistRow) => w.property_id) || []

      // Build query for properties not in wishlist
      const excludeIds = [ ...wishlistIds, ...clickedProperties.map(p => p.id) ]

      let query = this.supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .eq('is_available', true)

      if (excludeIds.length > 0) {
        query = query.not('id', 'in', `(${excludeIds.join(',')})`)
      }

      const { data: candidateProperties } = await query.limit(limit * 5)

      if (!candidateProperties || candidateProperties.length === 0) {
        // Fallback to trending
        const trending = await this.getTrendingProperties(limit)
        return trending.map(property => ({
          property,
          score: weights.popularity,
          reason: 'Trending in your area'
        }))
      }

      // Score based on search history
      const scored = candidateProperties.map((property: Property) => {
        let score = 0
        const reasons: string[] = []

        // Check against search history keywords
        searchHistory.forEach(query => {
          const lowerQuery = query.toLowerCase()
          if (property.title?.toLowerCase().includes(lowerQuery) ||
              property.location?.toLowerCase().includes(lowerQuery) ||
              property.city?.toLowerCase().includes(lowerQuery)) {
            score += weights.exactMatch * 0.5
            reasons.push(`Matches "${query}"`)
          }
        })

        // Check similarity to clicked properties
        clickedProperties.forEach(clicked => {
          // Same city
          if (property.city === clicked.city) {
            score += weights.recency * 0.5
          }
          // Similar price range
          const priceDiff = Math.abs(property.price_per_night - clicked.price_per_night)
          const pricePercentDiff = priceDiff / clicked.price_per_night
          if (pricePercentDiff < 0.5) {
            score += weights.priceRange * 0.3
          }
          // Same property type
          if (property.property_type === clicked.property_type) {
            score += weights.amenities
          }
        })

        // Boost high-rated properties
        if (property.rating >= 4.5) {
          score += weights.rating
          reasons.push('Highly rated')
        }

        return {
          property,
          score,
          reason: reasons[0] || 'Recommended for you'
        }
      })

      const sortedResults = scored.sort((a: SearchResult, b: SearchResult) => b.score - a.score)
      return sortedResults.slice(0, limit)
    } catch (error) {
      console.error('Error getting personalized recommendations:', error)
      return []
    }
  }

  // Location-based recommendations
  async getLocationBasedRecommendations(
    location: string,
    filters: SearchFilters = {},
    limit: number = 10
  ): Promise<SearchResult[]> {
    try {
      let query = this.supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .eq('is_available', true)
        .ilike('location', `%${location}%`)
        .order('rating', { ascending: false })
        .order('review_count', { ascending: false })
        .limit(limit * 2)

      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType)
      }

      if (filters.minPrice) {
        query = query.gte('price_per_night', filters.minPrice)
      }

      if (filters.maxPrice) {
        query = query.lte('price_per_night', filters.maxPrice)
      }

      if (filters.guests) {
        query = query.gte('max_guests', filters.guests)
      }

      if (filters.bedrooms) {
        query = query.gte('bedrooms', filters.bedrooms)
      }

      const { data: properties } = await query

      if (!properties) return []

      return properties.map((property: Property) => ({
        property,
        score: Number(property.rating) * 10 + (property.review_count || 0),
        reason: `In ${property.city || location}`
      })).slice(0, limit)
    } catch (error) {
      console.error('Error getting location recommendations:', error)
      return []
    }
  }

  // Main recommendation method - gets all types
  async getAllRecommendations(
    userId: string | null,
    currentPropertyId?: string,
    searchLocation?: string,
    limit: number = 6
  ): Promise<AIRecommendation[]> {
    const recommendations: AIRecommendation[] = []

    // Personalized for logged-in users
    if (userId) {
      const personalized = await this.getPersonalizedRecommendations(userId, limit)
      if (personalized.length > 0) {
        recommendations.push({
          id: 'personalized',
          type: 'personalized',
          properties: personalized
        })
      }
    }

    // Similar to current property
    if (currentPropertyId) {
      const similar = await this.getSimilarProperties(currentPropertyId, limit)
      if (similar.length > 0) {
        recommendations.push({
          id: 'similar',
          type: 'similar',
          properties: similar
        })
      }
    }

    // Trending
    const trending = await this.getTrendingProperties(limit)
    if (trending.length > 0) {
      recommendations.push({
        id: 'trending',
        type: 'trending',
        properties: trending.map(property => ({
          property,
          score: Number(property.rating) * 10 + (property.review_count || 0),
          reason: 'Trending now'
        }))
      })
    }

    // Location-based
    if (searchLocation) {
      const locationBased = await this.getLocationBasedRecommendations(searchLocation, {}, limit)
      if (locationBased.length > 0) {
        recommendations.push({
          id: 'location',
          type: 'location_based',
          properties: locationBased
        })
      }
    }

    return recommendations
  }

  // Smart search - enhanced search with AI ranking
  async smartSearch(
    userId: string | null,
    query: string,
    filters: SearchFilters = {},
    limit: number = 20,
    sessionId?: string
  ): Promise<{ properties: SearchResult[]; recommendations: AIRecommendation | null }> {
    try {
      // Build base query
      let dbQuery = this.supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .eq('is_available', true)

      // Apply text search
      if (query) {
        dbQuery = dbQuery.or(`title.ilike.%${query}%,location.ilike.%${query}%,city.ilike.%${query}%`)
      }

      // Apply filters
      if (filters.propertyType) {
        dbQuery = dbQuery.eq('property_type', filters.propertyType)
      }

      if (filters.minPrice) {
        dbQuery = dbQuery.gte('price_per_night', filters.minPrice)
      }

      if (filters.maxPrice) {
        dbQuery = dbQuery.lte('price_per_night', filters.maxPrice)
      }

      if (filters.guests) {
        dbQuery = dbQuery.gte('max_guests', filters.guests)
      }

      if (filters.bedrooms) {
        dbQuery = dbQuery.gte('bedrooms', filters.bedrooms)
      }

      if (filters.amenities && filters.amenities.length > 0) {
        filters.amenities.forEach(amenity => {
          dbQuery = dbQuery.contains('amenities', [amenity])
        })
      }

      // Order by rating and reviews
      dbQuery = dbQuery.order('rating', { ascending: false })
        .order('review_count', { ascending: false })

      const { data: properties, count } = await dbQuery.limit(limit)

      // Log search if there's a query
      if (query) {
        await this.logSearch(userId, query, filters, count || 0, [], sessionId)
      }

      // Get personalized recommendations based on this search
      let recommendations: AIRecommendation | null = null
      if (userId && query) {
        const personalized = await this.getPersonalizedRecommendations(userId, limit)
        recommendations = {
          id: 'smart_search',
          type: 'personalized',
          properties: personalized
        }
      }

      // Score and add reasons
      const scoredResults: SearchResult[] = (properties || []).map((property: Property) => {
        let score = 0
        const reasons: string[] = []

        // Exact query match
        if (query) {
          const lowerQuery = query.toLowerCase()
          if (property.title?.toLowerCase().includes(lowerQuery)) {
            score += weights.exactMatch
            reasons.push('Matches your search')
          } else if (property.city?.toLowerCase().includes(lowerQuery)) {
            score += weights.exactMatch * 0.7
            reasons.push(`In ${property.city}`)
          }
        }

        // Rating boost
        if (property.rating >= 4.8) {
          score += weights.rating
          reasons.push('Excellent rating')
        } else if (property.rating >= 4.5) {
          score += weights.rating * 0.7
          reasons.push('Very good rating')
        }

        // Popularity boost
        if ((property.review_count || 0) > 20) {
          score += weights.popularity
          reasons.push('Popular choice')
        }

        return {
          property,
          score,
          reason: reasons[0] || 'Recommended'
        }
      })

      return {
        properties: scoredResults,
        recommendations
      }
    } catch (error) {
      console.error('Error in smart search:', error)
      return { properties: [], recommendations: null }
    }
  }
}

// Singleton instance
let recommendationEngineInstance: SearchRecommendationEngine | null = null

export function getRecommendationEngine(): SearchRecommendationEngine {
  if (!recommendationEngineInstance) {
    recommendationEngineInstance = new SearchRecommendationEngine()
  }
  return recommendationEngineInstance
}

// React hook for recommendations
export function useSearchRecommendations(userId: string | null = null) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const engine = getRecommendationEngine()

  const fetchRecommendations = async (propertyId?: string, location?: string) => {
    setIsLoading(true)
    try {
      const results = await engine.getAllRecommendations(userId, propertyId, location)
      setRecommendations(results)
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
    setIsLoading(false)
  }

  const search = async (query: string, filters: SearchFilters = {}) => {
    setIsLoading(true)
    try {
      const results = await engine.smartSearch(userId, query, filters)
      return results
    } catch (error) {
      console.error('Error searching:', error)
      return { properties: [], recommendations: null }
    }
    finally {
      setIsLoading(false)
    }
  }

  return {
    recommendations,
    isLoading,
    fetchRecommendations,
    search
  }
}

