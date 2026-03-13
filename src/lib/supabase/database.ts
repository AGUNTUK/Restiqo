import { createClient } from './client'
import { Database, UserRole, BookingStatus, PaymentStatus, PropertyType } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

// FirestoreDB equivalent using Supabase Postgres
export class SupabaseDBService {
  private supabase: SupabaseClient<Database>

  constructor() {
    this.supabase = createClient()
  }

  // Users
  async getUser(userId: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) console.error('Error fetching user:', error)
    return data
  }

  async updateUser(userId: string, data: any) {
    const { error } = await this.supabase
      .from('users')
      .update(data as never)
      .eq('id', userId)
    
    if (error) throw error
  }

  // Properties
  async getProperties(
    filters: {
      propertyType?: PropertyType
      city?: string
      minPrice?: number
      maxPrice?: number
      guests?: number
      isApproved?: boolean
    } = {},
    pageSize: number = 20,
    page: number = 0 // Using page instead of lastDoc for Supabase pagination
  ) {
    let query = this.supabase.from('properties').select('*, users!host_id(*)', { count: 'exact' })

    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType)
    }
    if (filters.city) {
      query = query.ilike('city', `%${filters.city}%`)
    }
    if (filters.isApproved !== undefined) {
      query = query.eq('is_approved', filters.isApproved)
    }
    if (filters.guests) {
      query = query.gte('max_guests', filters.guests)
    }
    if (filters.minPrice !== undefined) {
      query = query.gte('price_per_night', filters.minPrice)
    }
     if (filters.maxPrice !== undefined) {
      query = query.lte('price_per_night', filters.maxPrice)
    }

    const { data, count, error } = await query
      .order('rating', { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1)

    if (error) throw error

    return {
      properties: data,
      hasMore: count ? (page + 1) * pageSize < count : false,
      totalCount: count
    }
  }

  async getProperty(propertyId: string) {
    const { data, error } = await this.supabase
      .from('properties')
      .select('*, users!host_id(*)')
      .eq('id', propertyId)
      .single()
    
    if (error) return null
    return data
  }

  async createProperty(data: any) {
    const { data: inserted, error } = await this.supabase
      .from('properties')
      .insert({
          ...data,
          rating: 0,
          review_count: 0,
          is_available: true,
          is_approved: false
      })
      .select('id')
      .single()
      
    if (error) throw error
    return (inserted as any).id
  }

  async updateProperty(propertyId: string, data: any) {
    const { error } = await this.supabase
      .from('properties')
      .update(data as never)
      .eq('id', propertyId)
      
    if (error) throw error
  }

  async deleteProperty(propertyId: string) {
    const { error } = await this.supabase
      .from('properties')
      .delete()
      .eq('id', propertyId)
      
    if (error) throw error
  }

  // Bookings
  async getBookings(userId: string, status?: BookingStatus) {
    let query = this.supabase
        .from('bookings')
        .select('*, properties(*)')
        .eq('guest_id', userId)

    if (status) query = query.eq('status', status)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error
    return data
  }

  async getBooking(bookingId: string) {
    const { data, error } = await this.supabase
        .from('bookings')
        .select('*, properties(*)')
        .eq('id', bookingId)
        .single()
    if (error) return null
    return data
  }

  async createBooking(data: any) {
    const { data: inserted, error } = await this.supabase
      .from('bookings')
      .insert({
          ...data,
          status: 'pending',
          payment_status: 'pending'
      })
      .select('id')
      .single()
      
    if (error) throw error
    return (inserted as any).id
  }

  async updateBooking(bookingId: string, data: any) {
    const { error } = await this.supabase
      .from('bookings')
      .update(data as never)
      .eq('id', bookingId)
      
    if (error) throw error
  }

  async cancelBooking(bookingId: string) {
    const { error } = await this.supabase
      .from('bookings')
      .update({ status: 'cancelled' } as never)
      .eq('id', bookingId)
      
    if (error) throw error
  }

  // Reviews
  async getReviews(propertyId: string) {
     const { data, error } = await this.supabase
        .from('reviews')
        .select('*, users!user_id(id, full_name, avatar_url)')
        .eq('property_id', propertyId)
        .order('created_at', { ascending: false })
        
     if (error) throw error
     return data
  }

  async createReview(data: any) {
    const { data: inserted, error } = await this.supabase
      .from('reviews')
      .insert({
          ...data,
          is_approved: true
      } as any)
      .select('id')
      .single()
      
    if (error) throw error
    return (inserted as any).id
  }

  // Wishlist
  async getWishlist(userId: string) {
      const { data, error } = await this.supabase
          .from('wishlists')
          .select('id, property_id, created_at, properties(*)')
          .eq('user_id', userId)
          
      if (error) throw error
      return data
  }

  async addToWishlist(userId: string, propertyId: string) {
    const { data, error } = await this.supabase
      .from('wishlists')
      .insert({ user_id: userId, property_id: propertyId } as any)
      .select('id')
      .single()
      
    if (error) throw error
    return (data as any).id
  }

  async removeFromWishlist(wishlistId: string) {
      const { error } = await this.supabase
        .from('wishlists')
        .delete()
        .eq('id', wishlistId)
      
      if (error) throw error
  }

  async isInWishlist(userId: string, propertyId: string) {
      const { data, error } = await this.supabase
        .from('wishlists')
        .select('id')
      if (error) throw error
    return (data as any)?.id || null
  }

  // Search properties
  async searchProperties(searchQuery: string, filters: {
    propertyType?: PropertyType
    minPrice?: number
    maxPrice?: number
    guests?: number
  } = {}) {
     let query = this.supabase
        .from('properties')
        .select('*')
        .eq('is_approved', true)
        .eq('is_available', true)

    if (searchQuery) {
        // Simple search using OR conditions for common text fields
        query = query.or(`title.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

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

    const { data, error } = await query
          .order('rating', { ascending: false })
          .limit(50)

    if (error) throw error
    return data
  }
}

// Singleton instance
let supabaseDBInstance: SupabaseDBService | null = null

export function getDatabaseService(): SupabaseDBService {
  if (!supabaseDBInstance) {
    supabaseDBInstance = new SupabaseDBService()
  }
  return supabaseDBInstance
}
