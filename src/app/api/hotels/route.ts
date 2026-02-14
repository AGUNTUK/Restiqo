import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET /api/hotels - Get all hotels
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minRating = searchParams.get('minRating')
    const featured = searchParams.get('featured')
    const limit = searchParams.get('limit')

    const where: any = {
      type: 'HOTEL',
      status: 'ACTIVE',
    }

    if (city) {
      where.city = { contains: city, mode: 'insensitive' }
    }

    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price.gte = Number(minPrice)
      if (maxPrice) where.price.lte = Number(maxPrice)
    }

    if (minRating) {
      where.rating = { gte: Number(minRating) }
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    const hotels = await prisma.property.findMany({
      where,
      include: {
        host: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              }
            }
          }
        },
        reviews: {
          include: {
            user: {
              select: { id: true, name: true }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' }
      ],
      take: limit ? Number(limit) : undefined
    })

    // Transform the data to match the expected format
    const transformedHotels = hotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      description: hotel.description,
      city: hotel.city,
      location: hotel.location,
      address: hotel.address,
      pricePerNight: hotel.price,
      rating: hotel.rating,
      reviewCount: hotel.reviewCount,
      images: JSON.parse(hotel.images || '[]'),
      amenities: JSON.parse(hotel.amenities || '[]'),
      starRating: 4, // Default star rating
      roomTypes: ['Standard', 'Deluxe', 'Suite'],
      featured: hotel.isFeatured,
      verified: hotel.isVerified,
      host: {
        id: hotel.host.id,
        name: hotel.host.user.name,
        email: hotel.host.user.email,
        phone: hotel.host.user.phone || '',
        vendorType: hotel.host.hostType
      },
      reviews: hotel.reviews.map((review: any) => ({
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        createdAt: review.createdAt.toISOString(),
        user: { name: review.user.name },
        response: review.hostResponse
      }))
    }))

    return NextResponse.json(transformedHotels)
  } catch (error) {
    console.error('Error fetching hotels:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hotels' },
      { status: 500 }
    )
  }
}

// POST /api/hotels - Create a new hotel
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const hostProfile = await prisma.hostProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!hostProfile || hostProfile.status !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved hosts can create hotels' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const {
      name,
      description,
      city,
      location,
      address,
      price,
      images,
      amenities,
      capacity,
      bedrooms,
      beds,
      bathrooms,
      latitude,
      longitude
    } = body

    const hotel = await prisma.property.create({
      data: {
        name,
        description,
        type: 'HOTEL',
        city,
        location,
        address,
        price: Number(price),
        capacity: capacity || 100,
        bedrooms: bedrooms || 50,
        beds: beds || 100,
        bathrooms: bathrooms || 50,
        images: JSON.stringify(images || []),
        amenities: JSON.stringify(amenities || []),
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        hostId: hostProfile.id,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json(hotel, { status: 201 })
  } catch (error) {
    console.error('Error creating hotel:', error)
    return NextResponse.json(
      { error: 'Failed to create hotel' },
      { status: 500 }
    )
  }
}
