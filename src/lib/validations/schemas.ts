import { z } from 'zod'

// ============================================
// User & Auth Schemas
// ============================================

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
})

export const signupSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Please enter a valid email address'),
    password: z
        .string()
        .min(8, 'Password must be at least 8 characters')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number'),
    full_name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name is too long'),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^[\d\s\-+()]+$/.test(val), {
            message: 'Please enter a valid phone number',
        }),
})

export const profileUpdateSchema = z.object({
    full_name: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name is too long'),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^[\d\s\-+()]+$/.test(val), {
            message: 'Please enter a valid phone number',
        }),
    avatar_url: z.string().url('Invalid avatar URL').optional().or(z.literal('')),
    bio: z.string().max(500, 'Bio is too long').optional(),
})

// ============================================
// Property Schemas
// ============================================

export const propertyTypeSchema = z.enum(['apartment', 'hotel', 'tour'])
export const bookingStatusSchema = z.enum(['pending', 'confirmed', 'cancelled', 'completed'])

export const propertySchema = z.object({
    title: z
        .string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title is too long'),
    description: z
        .string()
        .min(20, 'Description must be at least 20 characters')
        .max(5000, 'Description is too long'),
    property_type: propertyTypeSchema,
    category: z.string().min(1, 'Category is required'),
    price_per_night: z
        .number()
        .positive('Price must be positive')
        .min(100, 'Minimum price is 100 BDT'),
    price_per_tour: z.number().positive('Price must be positive').optional().nullable(),
    location: z.string().min(2, 'Location is required'),
    address: z.string().min(5, 'Address is required'),
    city: z.string().min(2, 'City is required'),
    country: z.string().min(2, 'Country is required'),
    latitude: z.number().min(-90).max(90).optional().nullable(),
    longitude: z.number().min(-180).max(180).optional().nullable(),
    bedrooms: z.number().int().min(0).max(50).optional().nullable(),
    bathrooms: z.number().int().min(0).max(50).optional().nullable(),
    max_guests: z.number().int().min(1, 'At least 1 guest required').max(100),
    amenities: z.array(z.string()).min(1, 'Select at least one amenity'),
    images: z.array(z.string().url()).min(1, 'At least one image is required'),
    is_available: z.boolean(),
})

export const propertyUpdateSchema = propertySchema.partial()

// ============================================
// Booking Schemas
// ============================================

export const bookingSchema = z.object({
    property_id: z.string().uuid('Invalid property ID'),
    check_in: z
        .date({ message: 'Invalid date format' })
        .min(new Date(), 'Check-in date must be in the future'),
    check_out: z
        .date({ message: 'Invalid date format' }),
    guests: z
        .number()
        .int('Number of guests must be a whole number')
        .min(1, 'At least 1 guest required'),
    special_requests: z.string().max(1000, 'Special requests too long').optional(),
}).refine(
    (data) => data.check_out > data.check_in,
    {
        message: 'Check-out date must be after check-in date',
        path: ['check_out'],
    }
)

export const bookingUpdateSchema = z.object({
    check_in: z.date().min(new Date(), 'Check-in date must be in the future').optional(),
    check_out: z.date().optional(),
    guests: z.number().int().min(1).optional(),
    status: bookingStatusSchema.optional(),
    special_requests: z.string().max(1000).optional(),
}).refine(
    (data) => {
        if (data.check_in && data.check_out) {
            return data.check_out > data.check_in
        }
        return true
    },
    {
        message: 'Check-out date must be after check-in date',
        path: ['check_out'],
    }
)

// ============================================
// Review Schemas
// ============================================

export const reviewSchema = z.object({
    property_id: z.string().uuid('Invalid property ID'),
    booking_id: z.string().uuid('Invalid booking ID'),
    rating: z
        .number()
        .int()
        .min(1, 'Rating must be at least 1')
        .max(5, 'Rating cannot exceed 5'),
    rating_breakdown: z.object({
        cleanliness: z.number().int().min(1).max(5),
        location: z.number().int().min(1).max(5),
        value: z.number().int().min(1).max(5),
        communication: z.number().int().min(1).max(5),
        check_in: z.number().int().min(1).max(5),
        accuracy: z.number().int().min(1).max(5),
    }).optional(),
    comment: z
        .string()
        .min(10, 'Review must be at least 10 characters')
        .max(2000, 'Review is too long'),
    photos: z.array(z.string().url()).max(5, 'Maximum 5 photos allowed').optional(),
})

// ============================================
// Wishlist Schemas
// ============================================

export const wishlistCreateSchema = z.object({
    name: z
        .string()
        .min(1, 'Wishlist name is required')
        .max(50, 'Name is too long'),
    is_public: z.boolean().default(false),
})

export const wishlistUpdateSchema = z.object({
    name: z.string().min(1).max(50).optional(),
    is_public: z.boolean().optional(),
})

export const wishlistAddPropertySchema = z.object({
    wishlist_id: z.string().uuid('Invalid wishlist ID'),
    property_id: z.string().uuid('Invalid property ID'),
})

// ============================================
// Message Schemas
// ============================================

export const messageSchema = z.object({
    conversation_id: z.string().uuid().optional(),
    recipient_id: z.string().uuid('Invalid recipient'),
    property_id: z.string().uuid().optional(),
    content: z
        .string()
        .min(1, 'Message cannot be empty')
        .max(5000, 'Message is too long'),
})

// ============================================
// Search & Filter Schemas
// ============================================

export const searchSchema = z.object({
    query: z.string().optional(),
    location: z.string().optional(),
    check_in: z.coerce.date().optional(),
    check_out: z.coerce.date().optional(),
    guests: z.coerce.number().int().min(1).optional(),
    min_price: z.coerce.number().min(0).optional(),
    max_price: z.coerce.number().min(0).optional(),
    property_type: z.enum(['apartment', 'hotel', 'tour']).optional(),
    amenities: z.array(z.string()).optional(),
    sort_by: z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(50).default(12),
})

// ============================================
// Host Registration Schemas
// ============================================

export const hostRegistrationSchema = z.object({
    business_name: z.string().min(2, 'Business name is required').max(100),
    business_type: z.enum(['individual', 'company']),
    tax_id: z.string().optional(),
    description: z.string().max(1000).optional(),
    website: z.string().url('Invalid website URL').optional().or(z.literal('')),
    documents: z.array(z.string().url()).min(1, 'At least one document is required'),
})

// ============================================
// Type exports
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type SignupInput = z.infer<typeof signupSchema>
export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>
export type PropertyInput = z.infer<typeof propertySchema>
export type PropertyUpdateInput = z.infer<typeof propertyUpdateSchema>
export type BookingInput = z.infer<typeof bookingSchema>
export type BookingUpdateInput = z.infer<typeof bookingUpdateSchema>
export type ReviewInput = z.infer<typeof reviewSchema>
export type WishlistCreateInput = z.infer<typeof wishlistCreateSchema>
export type WishlistUpdateInput = z.infer<typeof wishlistUpdateSchema>
export type MessageInput = z.infer<typeof messageSchema>
export type SearchInput = z.infer<typeof searchSchema>
export type HostRegistrationInput = z.infer<typeof hostRegistrationSchema>
