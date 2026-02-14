import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/hotels/[id] - Get a single hotel
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const hotel = await prisma.property.findUnique({
      where: { 
        id,
        type: 'HOTEL'
      },
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
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!hotel) {
      return NextResponse.json(
        { error: 'Hotel not found' },
        { status: 404 }
      )
    }

    // Transform the data to match the expected format
    const transformedHotel = {
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
    }

    return NextResponse.json(transformedHotel)
  } catch (error) {
    console.error('Error fetching hotel:', error)
    return NextResponse.json(
      { error: 'Failed to fetch hotel' },
      { status: 500 }
    )
  }
}

// PUT /api/hotels/[id] - Update a hotel
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const hotel = await prisma.property.update({
      where: { id },
      data: {
        name: body.name,
        description: body.description,
        city: body.city,
        location: body.location,
        address: body.address,
        price: body.price ? Number(body.price) : undefined,
        images: body.images ? JSON.stringify(body.images) : undefined,
        amenities: body.amenities ? JSON.stringify(body.amenities) : undefined,
        latitude: body.latitude ? Number(body.latitude) : undefined,
        longitude: body.longitude ? Number(body.longitude) : undefined,
      }
    })

    return NextResponse.json(hotel)
  } catch (error) {
    console.error('Error updating hotel:', error)
    return NextResponse.json(
      { error: 'Failed to update hotel' },
      { status: 500 }
    )
  }
}

// DELETE /api/hotels/[id] - Delete a hotel
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.property.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting hotel:', error)
    return NextResponse.json(
      { error: 'Failed to delete hotel' },
      { status: 500 }
    )
  }
}
