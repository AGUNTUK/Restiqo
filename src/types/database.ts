export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'guest' | 'host' | 'admin'
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed'
export type PaymentStatus = 'pending' | 'paid' | 'refunded'
export type PropertyType = 'apartment' | 'hotel' | 'tour'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          address: string | null
          bio: string | null
          role: UserRole
          is_verified: boolean
          host_requested_at: string | null
          host_approved_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          bio?: string | null
          role?: UserRole
          is_verified?: boolean
          host_requested_at?: string | null
          host_approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          address?: string | null
          bio?: string | null
          role?: UserRole
          is_verified?: boolean
          host_requested_at?: string | null
          host_approved_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      properties: {
        Row: {
          id: string
          host_id: string
          title: string
          description: string
          property_type: PropertyType
          category: string
          price_per_night: number
          price_per_tour: number | null
          location: string
          address: string
          city: string
          country: string
          latitude: number | null
          longitude: number | null
          bedrooms: number | null
          bathrooms: number | null
          max_guests: number
          rating: number
          review_count: number
          is_available: boolean
          is_approved: boolean
          amenities: string[]
          images: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_id: string
          title: string
          description: string
          property_type: PropertyType
          category: string
          price_per_night: number
          price_per_tour?: number | null
          location: string
          address: string
          city: string
          country?: string
          latitude?: number | null
          longitude?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          max_guests: number
          rating?: number
          review_count?: number
          is_available?: boolean
          is_approved?: boolean
          amenities?: string[]
          images?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          title?: string
          description?: string
          property_type?: PropertyType
          category?: string
          price_per_night?: number
          price_per_tour?: number | null
          location?: string
          address?: string
          city?: string
          country?: string
          latitude?: number | null
          longitude?: number | null
          bedrooms?: number | null
          bathrooms?: number | null
          max_guests?: number
          rating?: number
          review_count?: number
          is_available?: boolean
          is_approved?: boolean
          amenities?: string[]
          images?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          property_id: string
          guest_id: string
          check_in: string
          check_out: string
          guests: number
          total_price: number
          status: BookingStatus
          payment_status: PaymentStatus
          special_requests: string | null
          invoice_id?: string | null
          payment_method?: string | null
          transaction_time?: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          guest_id: string
          check_in: string
          check_out: string
          guests: number
          total_price: number
          status?: BookingStatus
          payment_status?: PaymentStatus
          special_requests?: string | null
          invoice_id?: string | null
          payment_method?: string | null
          transaction_time?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          guest_id?: string
          check_in?: string
          check_out?: string
          guests?: number
          total_price?: number
          status?: BookingStatus
          payment_status?: PaymentStatus
          special_requests?: string | null
          invoice_id?: string | null
          payment_method?: string | null
          transaction_time?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          property_id: string
          user_id: string
          booking_id: string
          rating: number
          comment: string
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          property_id: string
          user_id: string
          booking_id: string
          rating: number
          comment: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          user_id?: string
          booking_id?: string
          rating?: number
          comment?: string
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          property_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          property_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          property_id?: string
          created_at?: string
        }
      }
      amenities: {
        Row: {
          id: string
          name: string
          icon: string
          category: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          icon: string
          category: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          icon?: string
          category?: string
          created_at?: string
        }
      }
      property_images: {
        Row: {
          id: string
          property_id: string
          url: string
          caption: string | null
          is_primary: boolean
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          url: string
          caption?: string | null
          is_primary?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          url?: string
          caption?: string | null
          is_primary?: boolean
          created_at?: string
        }
      }
      tours: {
        Row: {
          id: string
          property_id: string
          duration: string
          included: string[]
          excluded: string[]
          itinerary: Json
          meeting_point: string
          start_time: string
          max_participants: number
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          duration: string
          included?: string[]
          excluded?: string[]
          itinerary?: Json
          meeting_point: string
          start_time: string
          max_participants: number
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          duration?: string
          included?: string[]
          excluded?: string[]
          itinerary?: Json
          meeting_point?: string
          start_time?: string
          max_participants?: number
          created_at?: string
        }
      }
      host_earnings: {
        Row: {
          id: string
          host_id: string
          booking_id: string
          amount: number
          platform_fee: number
          net_amount: number
          status: PaymentStatus
          created_at: string
        }
        Insert: {
          id?: string
          host_id: string
          booking_id: string
          amount: number
          platform_fee?: number
          net_amount: number
          status?: PaymentStatus
          created_at?: string
        }
        Update: {
          id?: string
          host_id?: string
          booking_id?: string
          amount?: number
          platform_fee?: number
          net_amount?: number
          status?: PaymentStatus
          created_at?: string
        }
      }
      property_availability: {
        Row: {
          id: string
          property_id: string
          date: string
          is_available: boolean
          price_override: number | null
          created_at: string
        }
        Insert: {
          id?: string
          property_id: string
          date: string
          is_available?: boolean
          price_override?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          property_id?: string
          date?: string
          is_available?: boolean
          price_override?: number | null
          created_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          entity_type: string
          entity_id: string | null
          details: Json
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          entity_type: string
          entity_id?: string | null
          details?: Json
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          entity_type?: string
          entity_id?: string | null
          details?: Json
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      is_host: {
        Args: Record<string, never>
        Returns: boolean
      }
      get_user_role: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      booking_status: BookingStatus
      payment_status: PaymentStatus
      property_type: PropertyType
    }
  }
}

// Type exports
export type User = Database['public']['Tables']['users']['Row']
export type Property = Database['public']['Tables']['properties']['Row']
export type Booking = Database['public']['Tables']['bookings']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Wishlist = Database['public']['Tables']['wishlists']['Row']
export type Amenity = Database['public']['Tables']['amenities']['Row']
export type PropertyImage = Database['public']['Tables']['property_images']['Row']
export type Tour = Database['public']['Tables']['tours']['Row']
export type HostEarning = Database['public']['Tables']['host_earnings']['Row']
export type PropertyAvailability = Database['public']['Tables']['property_availability']['Row']
export type AdminLog = Database['public']['Tables']['admin_logs']['Row']

// Extended types with relations
export type BookingWithProperty = Booking & {
  property: Property & {
    host: User
  }
}

export type BookingWithGuest = Booking & {
  guest: User
}

export type PropertyWithHost = Property & {
  host: User
}

export type ReviewWithUser = Review & {
  user: Pick<User, 'id' | 'full_name' | 'avatar_url'>
}

export type WishlistWithProperty = Wishlist & {
  property: Property
}

