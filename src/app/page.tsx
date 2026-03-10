'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  MapPin,
  Calendar,
  Users,
  ArrowRight,
  Building2,
  Home,
  Compass,
  Minus,
  Plus,
  ChevronDown,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Carousel from '@/components/ui/Carousel'

// Mock data for featured properties
const featuredApartments = [
  {
    id: '1',
    title: 'Luxury Downtown Apartment',
    description: 'Modern apartment with stunning city views in the heart of Dhaka',
    property_type: 'apartment' as const,
    category: 'luxury',
    price_per_night: 8500,
    price_per_tour: null,
    location: 'Gulshan',
    address: '123 Gulshan Avenue',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: 3,
    bathrooms: 2,
    max_guests: 6,
    rating: 4.9,
    review_count: 128,
    is_available: true,
    is_approved: true,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Parking'],
    images: ['https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'],
    host_id: 'host1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    title: 'Cozy Studio Near Lake',
    description: 'Peaceful studio apartment with beautiful lake views',
    property_type: 'apartment' as const,
    category: 'budget',
    price_per_night: 3500,
    price_per_tour: null,
    location: 'Dhanmondi',
    address: '45 Lake Road',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: 1,
    bathrooms: 1,
    max_guests: 2,
    rating: 4.7,
    review_count: 89,
    is_available: true,
    is_approved: true,
    amenities: ['WiFi', 'AC', 'Kitchen'],
    images: ['https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800'],
    host_id: 'host2',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    title: 'Spacious Family Apartment',
    description: 'Perfect for families with kids, close to schools and parks',
    property_type: 'apartment' as const,
    category: 'family',
    price_per_night: 6500,
    price_per_tour: null,
    location: 'Banani',
    address: '78 Block F',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: 4,
    bathrooms: 3,
    max_guests: 8,
    rating: 4.8,
    review_count: 156,
    is_available: true,
    is_approved: true,
    amenities: ['WiFi', 'AC', 'Kitchen', 'Parking', 'Washer'],
    images: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800'],
    host_id: 'host3',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const popularHotels = [
  {
    id: '4',
    title: 'Grand Palace Hotel',
    description: '5-star luxury hotel with world-class amenities and service. Secure your stay for 25,000 BDT per night.',
    property_type: 'hotel' as const,
    category: 'luxury',
    price_per_night: 25000,
    price_per_tour: null,
    location: 'Gulshan',
    address: '100 Gulshan Tower',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 4,
    rating: 4.9,
    review_count: 342,
    is_available: true,
    is_approved: true,
    amenities: ['Pool', 'Spa', 'Restaurant', 'Gym', 'WiFi'],
    images: ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800'],
    host_id: 'host4',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    title: 'Seaside Resort',
    description: 'Beachfront resort with private beach access and water sports. Available for instant booking at 18,000 BDT per night.',
    property_type: 'hotel' as const,
    category: 'resort',
    price_per_night: 18000,
    price_per_tour: null,
    location: 'Cox\'s Bazar',
    address: 'Beach Road',
    city: 'Cox\'s Bazar',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 6,
    rating: 4.8,
    review_count: 278,
    is_available: true,
    is_approved: true,
    amenities: ['Beach Access', 'Pool', 'Restaurant', 'WiFi'],
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
    host_id: 'host5',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    title: 'Boutique Inn',
    description: 'Charming boutique hotel with personalized service. Breakfast included. Starting at 12,000 BDT per night.',
    property_type: 'hotel' as const,
    category: 'boutique',
    price_per_night: 12000,
    price_per_tour: null,
    location: 'Old Dhaka',
    address: '50 Heritage Street',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 3,
    rating: 4.6,
    review_count: 145,
    is_available: true,
    is_approved: true,
    amenities: ['Restaurant', 'WiFi', 'Room Service'],
    images: ['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800'],
    host_id: 'host6',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

const trendingTours = [
  {
    id: '7',
    title: 'Sundarbans Adventure',
    description: 'Explore the world\'s largest mangrove forest and spot Royal Bengal Tigers. 3-day guided tour for 15,000 BDT per person.',
    property_type: 'tour' as const,
    category: 'adventure',
    price_per_night: 0,
    price_per_tour: 15000,
    location: 'Sundarbans',
    address: 'Sundarbans National Park',
    city: 'Khulna',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 12,
    rating: 4.9,
    review_count: 89,
    is_available: true,
    is_approved: true,
    amenities: ['Guide', 'Meals', 'Boat', 'Photography'],
    images: ['https://images.unsplash.com/photo-1504618223053-559bdef9dd5a?w=800'],
    host_id: 'host7',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    title: 'Tea Garden Experience',
    description: 'Visit the beautiful tea gardens of Sylhet and learn about tea production. Full-day trip starting at 8,000 BDT.',
    property_type: 'tour' as const,
    category: 'cultural',
    price_per_night: 0,
    price_per_tour: 8000,
    location: 'Sylhet',
    address: 'Sreemangal',
    city: 'Sylhet',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 20,
    rating: 4.7,
    review_count: 156,
    is_available: true,
    is_approved: true,
    amenities: ['Guide', 'Transport', 'Meals', 'Tea Tasting'],
    images: ['https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800'],
    host_id: 'host8',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '9',
    title: 'River Cruise Dhaka',
    description: 'Scenic river cruise along the Buriganga with traditional Bengali cuisine. Evening package for 5,000 BDT.',
    property_type: 'tour' as const,
    category: 'leisure',
    price_per_night: 0,
    price_per_tour: 5000,
    location: 'Buriganga River',
    address: 'Sadarghat Terminal',
    city: 'Dhaka',
    country: 'Bangladesh',
    latitude: null,
    longitude: null,
    bedrooms: null,
    bathrooms: null,
    max_guests: 30,
    rating: 4.5,
    review_count: 234,
    is_available: true,
    is_approved: true,
    amenities: ['Meals', 'Music', 'Photography'],
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800'],
    host_id: 'host9',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'apartments' | 'hotels' | 'tours'>('apartments')
  const [isGuestDropdownOpen, setIsGuestDropdownOpen] = useState(false)
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false)
  const [guestCounts, setGuestCounts] = useState({
    adults: 1,
    children: 0,
  })
  const [searchData, setSearchData] = useState({
    location: '',
    checkIn: '',
    checkOut: '',
    guests: 1,
    type: 'apartments',
  })
  const guestDropdownRef = useRef<HTMLDivElement>(null)
  const locationDropdownRef = useRef<HTMLDivElement>(null)

  // Bangladesh locations data
  const bangladeshLocations = [
    // Major Cities
    { name: 'Dhaka', type: 'city', region: 'Dhaka Division' },
    { name: 'Chittagong', type: 'city', region: 'Chittagong Division' },
    { name: 'Khulna', type: 'city', region: 'Khulna Division' },
    { name: 'Rajshahi', type: 'city', region: 'Rajshahi Division' },
    { name: 'Sylhet', type: 'city', region: 'Sylhet Division' },
    { name: 'Rangpur', type: 'city', region: 'Rangpur Division' },
    { name: 'Barisal', type: 'city', region: 'Barisal Division' },
    { name: 'Comilla', type: 'city', region: 'Chittagong Division' },
    { name: 'Gazipur', type: 'city', region: 'Dhaka Division' },
    { name: 'Narayanganj', type: 'city', region: 'Dhaka Division' },
    { name: 'Mymensingh', type: 'city', region: 'Mymensingh Division' },
    { name: 'Bogra', type: 'city', region: 'Rajshahi Division' },
    { name: 'Cox\'s Bazar', type: 'city', region: 'Chittagong Division' },
    { name: 'Savar', type: 'city', region: 'Dhaka Division' },

    // Dhaka Police Stations
    { name: 'Dhanmondi', type: 'area', region: 'Dhaka' },
    { name: 'Gulshan', type: 'area', region: 'Dhaka' },
    { name: 'Banani', type: 'area', region: 'Dhaka' },
    { name: 'Uttara', type: 'area', region: 'Dhaka' },
    { name: 'Mirpur', type: 'area', region: 'Dhaka' },
    { name: 'Mohammadpur', type: 'area', region: 'Dhaka' },
    { name: 'Pallabi', type: 'area', region: 'Dhaka' },
    { name: 'Kafrul', type: 'area', region: 'Dhaka' },
    { name: 'Tejgaon', type: 'area', region: 'Dhaka' },
    { name: 'Tejgaon Industrial', type: 'area', region: 'Dhaka' },
    { name: 'Ramna', type: 'area', region: 'Dhaka' },
    { name: 'Motijheel', type: 'area', region: 'Dhaka' },
    { name: 'Paltan', type: 'area', region: 'Dhaka' },
    { name: 'Shahbagh', type: 'area', region: 'Dhaka' },
    { name: 'Sabujbagh', type: 'area', region: 'Dhaka' },
    { name: 'Khilgaon', type: 'area', region: 'Dhaka' },
    { name: 'Mugda', type: 'area', region: 'Dhaka' },
    { name: 'Demra', type: 'area', region: 'Dhaka' },
    { name: 'Shyampur', type: 'area', region: 'Dhaka' },
    { name: 'Kotwali', type: 'area', region: 'Dhaka' },
    { name: 'Wari', type: 'area', region: 'Dhaka' },
    { name: 'Sutrapur', type: 'area', region: 'Dhaka' },
    { name: 'Bangshal', type: 'area', region: 'Dhaka' },
    { name: 'Hazaribagh', type: 'area', region: 'Dhaka' },
    { name: 'Lalbagh', type: 'area', region: 'Dhaka' },
    { name: 'Chawkbazar', type: 'area', region: 'Dhaka' },
    { name: 'Kamrangirchar', type: 'area', region: 'Dhaka' },
    { name: 'Cantonment', type: 'area', region: 'Dhaka' },
    { name: 'Badda', type: 'area', region: 'Dhaka' },
    { name: 'Vatara', type: 'area', region: 'Dhaka' },
    { name: 'Khilkhet', type: 'area', region: 'Dhaka' },
    { name: 'Turag', type: 'area', region: 'Dhaka' },
    { name: 'Dakshin Khan', type: 'area', region: 'Dhaka' },
    { name: 'Uttar Khan', type: 'area', region: 'Dhaka' },
    { name: 'Biman Bandar', type: 'area', region: 'Dhaka' },
    { name: 'Keraniganj', type: 'area', region: 'Dhaka' },
    { name: 'Savar Model', type: 'area', region: 'Dhaka' },
    { name: 'Dohar', type: 'area', region: 'Dhaka' },
    { name: 'Nawabganj', type: 'area', region: 'Dhaka' },
    { name: 'Jatrabari', type: 'area', region: 'Dhaka' },
    { name: 'Shyamoli', type: 'area', region: 'Dhaka' },
    { name: 'Agargaon', type: 'area', region: 'Dhaka' },
    { name: 'Farmgate', type: 'area', region: 'Dhaka' },
    { name: 'Kawran Bazar', type: 'area', region: 'Dhaka' },
    { name: 'Panthapath', type: 'area', region: 'Dhaka' },
    { name: 'Green Road', type: 'area', region: 'Dhaka' },
    { name: 'Kalabagan', type: 'area', region: 'Dhaka' },
    { name: 'New Market', type: 'area', region: 'Dhaka' },
    { name: 'Old Dhaka', type: 'area', region: 'Dhaka' },

    // Tourist Destinations
    { name: 'Sundarbans', type: 'tourist', region: 'Khulna/Bagerhat' },
    { name: 'Saint Martin\'s Island', type: 'tourist', region: 'Cox\'s Bazar' },
    { name: 'Kuakata', type: 'tourist', region: 'Patuakhali' },
    { name: 'Srimangal', type: 'tourist', region: 'Moulvibazar' },
    { name: 'Ratargul Swamp Forest', type: 'tourist', region: 'Sylhet' },
    { name: 'Jaflong', type: 'tourist', region: 'Sylhet' },
    { name: 'Bisnakandi', type: 'tourist', region: 'Sylhet' },
    { name: 'Lalakhal', type: 'tourist', region: 'Sylhet' },
    { name: 'Madhabkunda Waterfall', type: 'tourist', region: 'Moulvibazar' },
    { name: 'Lawachara National Park', type: 'tourist', region: 'Moulvibazar' },
    { name: 'Inani Beach', type: 'tourist', region: 'Cox\'s Bazar' },
    { name: 'Himchari', type: 'tourist', region: 'Cox\'s Bazar' },
    { name: 'Marine Drive', type: 'tourist', region: 'Cox\'s Bazar' },
    { name: 'Maheshkhali Island', type: 'tourist', region: 'Cox\'s Bazar' },
    { name: 'Sonadia Island', type: 'tourist', region: 'Cox\'s Bazar' },
    { name: 'Teknaf', type: 'tourist', region: 'Cox\'s Bazar' },
    { name: 'Nafa-khum Waterfall', type: 'tourist', region: 'Bandarban' },
    { name: 'Nilgiri', type: 'tourist', region: 'Bandarban' },
    { name: 'Nilachol', type: 'tourist', region: 'Bandarban' },
    { name: 'Meghla Tourist Spot', type: 'tourist', region: 'Bandarban' },
    { name: 'Boga Lake', type: 'tourist', region: 'Bandarban' },
    { name: 'Keokradong', type: 'tourist', region: 'Bandarban' },
    { name: 'Tajingdong', type: 'tourist', region: 'Bandarban' },
    { name: 'Sajek Valley', type: 'tourist', region: 'Rangamati' },
    { name: 'Kaptai Lake', type: 'tourist', region: 'Rangamati' },
    { name: 'Shuvolong Waterfall', type: 'tourist', region: 'Rangamati' },
    { name: 'Hanging Bridge', type: 'tourist', region: 'Rangamati' },
    { name: 'Karnaphuli River', type: 'tourist', region: 'Chittagong' },
    { name: 'Patenga Beach', type: 'tourist', region: 'Chittagong' },
    { name: 'Foy\'s Lake', type: 'tourist', region: 'Chittagong' },
    { name: 'Bhatiari', type: 'tourist', region: 'Chittagong' },
    { name: 'Sitakunda', type: 'tourist', region: 'Chittagong' },
    { name: 'Chandranath Temple', type: 'tourist', region: 'Chittagong' },
    { name: 'Paharpur Buddhist Monastery', type: 'tourist', region: 'Naogaon' },
    { name: 'Mahasthangarh', type: 'tourist', region: 'Bogra' },
    { name: 'Kantajew Temple', type: 'tourist', region: 'Dinajpur' },
    { name: 'Tajhat Palace', type: 'tourist', region: 'Rangpur' },
    { name: 'Sixty Dome Mosque', type: 'tourist', region: 'Bagerhat' },
    { name: 'Sundarban Eco Park', type: 'tourist', region: 'Khulna' },
    { name: 'Rupsha Bridge', type: 'tourist', region: 'Khulna' },
    { name: 'Ahsan Manzil', type: 'tourist', region: 'Dhaka' },
    { name: 'Lalbagh Fort', type: 'tourist', region: 'Dhaka' },
    { name: 'National Parliament', type: 'tourist', region: 'Dhaka' },
    { name: 'Bangladesh National Museum', type: 'tourist', region: 'Dhaka' },
    { name: 'Dhakeshwari Temple', type: 'tourist', region: 'Dhaka' },
    { name: 'Star Mosque', type: 'tourist', region: 'Dhaka' },
    { name: 'Armenian Church', type: 'tourist', region: 'Dhaka' },
    { name: 'Curzon Hall', type: 'tourist', region: 'Dhaka' },
    { name: 'National Martyrs\' Memorial', type: 'tourist', region: 'Savar' },
    { name: 'Bangabandhu Safari Park', type: 'tourist', region: 'Gazipur' },
    { name: 'Bhawal National Park', type: 'tourist', region: 'Gazipur' },
    { name: 'Modhutila Eco Park', type: 'tourist', region: 'Netrokona' },
    { name: 'Birishiri', type: 'tourist', region: 'Netrokona' },
    { name: 'Somapura Mahavihara', type: 'tourist', region: 'Paharpur' },
    { name: 'Chhera Island', type: 'tourist', region: 'Cox\'s Bazar' },
    { name: 'Barisal Beach', type: 'tourist', region: 'Barisal' },
    { name: 'Durga Sagor', type: 'tourist', region: 'Barisal' },
    { name: 'Guthia Mosque', type: 'tourist', region: 'Barisal' },
    { name: 'Oxford Mission Church', type: 'tourist', region: 'Barisal' },
    { name: 'Rajbari National Park', type: 'tourist', region: 'Rajbari' },
    { name: 'Padma River', type: 'tourist', region: 'Multiple' },
    { name: 'Meghna River', type: 'tourist', region: 'Multiple' },
    { name: 'Jamuna River', type: 'tourist', region: 'Multiple' },
    { name: 'Buriganga River', type: 'tourist', region: 'Dhaka' },
    { name: 'Titas River', type: 'tourist', region: 'Comilla' },
    { name: 'Coral Island', type: 'tourist', region: 'Saint Martin\'s' },
  ]

  // Filter locations based on search input
  const filteredLocations = bangladeshLocations.filter(loc =>
    loc.name.toLowerCase().includes(searchData.location.toLowerCase()) ||
    loc.region.toLowerCase().includes(searchData.location.toLowerCase())
  ).slice(0, 10)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target as Node)) {
        setIsGuestDropdownOpen(false)
      }
      if (locationDropdownRef.current && !locationDropdownRef.current.contains(event.target as Node)) {
        setIsLocationDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const totalGuests = guestCounts.adults + guestCounts.children

  const updateGuests = (type: 'adults' | 'children', increment: boolean) => {
    setGuestCounts((prev) => {
      const newValue = increment ? prev[type] + 1 : Math.max(type === 'adults' ? 1 : 0, prev[type] - 1)
      return { ...prev, [type]: newValue }
    })
  }

  const getGuestDisplayText = () => {
    const parts = []
    if (guestCounts.adults > 0) parts.push(`${guestCounts.adults} Adult${guestCounts.adults > 1 ? 's' : ''}`)
    if (guestCounts.children > 0) parts.push(`${guestCounts.children} Child${guestCounts.children > 1 ? 'ren' : ''}`)
    return parts.join(', ') || '1 Adult'
  }

  const handleTabChange = (tab: 'apartments' | 'hotels' | 'tours') => {
    setActiveTab(tab)
    setSearchData({ ...searchData, type: tab })
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search - redirect to search page with params
    const params = new URLSearchParams({
      location: searchData.location,
      checkIn: searchData.checkIn,
      checkOut: searchData.checkOut,
      guests: totalGuests.toString(),
      type: searchData.type,
    })
    window.location.href = `/search?${params.toString()}`
  }

  const serviceTabs = [
    { id: 'apartments' as const, label: 'Apartments', icon: Home },
    { id: 'hotels' as const, label: 'Hotels', icon: Building2 },
    { id: 'tours' as const, label: 'Tours', icon: Compass },
  ]

  return (
    <div className="relative">
      {/* Hero Section with Travel Image Background */}
      <section className="relative min-h-[100vh] overflow-hidden pt-20 sm:pt-28 pb-10 sm:pb-16">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/hero.jpg"
            alt="Beautiful Bangladesh landscape"
            className="w-full h-full object-cover"
          />
          {/* 40% dark gradient overlay at top for text readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/10" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16">
          {/* Headline */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mb-6 sm:mb-8"
          >
            <h1
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold mb-3 sm:mb-4 drop-shadow-md"
              style={{
                fontFamily: 'var(--font-playfair), Playfair Display, serif',
                letterSpacing: '0.02em',
                color: '#d67f00',
                textShadow: '0 2px 10px rgba(0,0,0,0.5)'
              }}
            >
              Find Your Perfect Stay
            </h1>
            <p className="text-sm sm:text-xl text-[#FDFDFD]/90 max-w-2xl mx-auto px-2">
              Search apartments, hotels, and tours in one seamless booking experience.
            </p>
          </motion.div>

          {/* Trust Indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8 sm:mb-10"
          >
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-[10px] text-[#FDFDFD] text-xs sm:text-sm font-medium border border-white/15">
              ⭐ 10,000+ Travelers
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-[10px] text-[#FDFDFD] text-xs sm:text-sm font-medium border border-white/15">
              🏠 1,500+ Properties
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-[10px] text-[#FDFDFD] text-xs sm:text-sm font-medium border border-white/15">
              🔒 Secure Booking
            </span>
          </motion.div>

          {/* Floating Search Card */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="max-w-5xl mx-auto"
          >
            <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-sm border border-white/20 p-3 sm:p-6 md:p-8">
              <div className="mb-3 sm:mb-4 overflow-x-auto scrollbar-hide -mx-1 px-1">
                <div className="flex p-1.5 sm:p-2 gap-1 sm:gap-1.5 min-w-max justify-center rounded-full bg-gray-100/80">
                  {serviceTabs.map((tab) => (
                    <motion.button
                      key={tab.id}
                      type="button"
                      onClick={() => handleTabChange(tab.id)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-center gap-1.5 sm:gap-2 px-5 sm:px-8 py-2.5 sm:py-3 rounded-full font-semibold transition-all duration-200 text-xs sm:text-sm ${activeTab === tab.id
                        ? 'text-white bg-[#d67f00]'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
                        }`}
                    >
                      <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">{tab.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSearch}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-4">
                  <div className="lg:col-span-1 relative" ref={locationDropdownRef}>
                    <label htmlFor="search-location" className="block text-xs sm:text-sm font-medium text-[#1E293B] mb-1.5 sm:mb-2">
                      Location
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#64748B]" aria-hidden="true" />
                      <input
                        id="search-location"
                        name="location"
                        type="text"
                        autoComplete="off"
                        placeholder="Where are you going…"
                        value={searchData.location}
                        onChange={(e) => {
                          setSearchData({ ...searchData, location: e.target.value })
                          setIsLocationDropdownOpen(true)
                        }}
                        onFocus={() => setIsLocationDropdownOpen(true)}
                        className="neu-input w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-[#1E293B] text-xs sm:text-base !rounded-full bg-white/90"
                      />
                    </div>

                    {isLocationDropdownOpen && searchData.location.length > 0 && filteredLocations.length > 0 && (
                      <div className="absolute left-0 right-0 top-full mt-2 neu-dropdown p-2 z-[100] max-h-64 overflow-y-auto" role="listbox">
                        {filteredLocations.map((loc, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setSearchData({ ...searchData, location: loc.name })
                              setIsLocationDropdownOpen(false)
                            }}
                            className="neu-dropdown-item w-full text-left px-3 py-2 sm:py-2.5 rounded-xl flex items-center justify-between"
                            role="option"
                            aria-selected={searchData.location === loc.name}
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-brand-primary" aria-hidden="true" />
                              <span className="font-medium text-[#1E293B] text-xs sm:text-base">{loc.name}</span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-[#64748B]">{loc.region}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div>
                    <label htmlFor="search-checkin" className="block text-xs sm:text-sm font-medium text-[#1E293B] mb-1.5 sm:mb-2">
                      Check In
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#64748B]" aria-hidden="true" />
                      <input
                        id="search-checkin"
                        name="checkIn"
                        type="date"
                        value={searchData.checkIn}
                        onChange={(e) =>
                          setSearchData({ ...searchData, checkIn: e.target.value })
                        }
                        className="neu-input w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-[#1E293B] text-xs sm:text-base !rounded-full bg-white/90"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="search-checkout" className="block text-xs sm:text-sm font-medium text-[#1E293B] mb-1.5 sm:mb-2">
                      Check Out
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#64748B]" aria-hidden="true" />
                      <input
                        id="search-checkout"
                        name="checkOut"
                        type="date"
                        value={searchData.checkOut}
                        onChange={(e) =>
                          setSearchData({ ...searchData, checkOut: e.target.value })
                        }
                        className="neu-input w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-3 text-[#1E293B] text-xs sm:text-base !rounded-full bg-white/90"
                      />
                    </div>
                  </div>

                  <div className="relative z-[60]" ref={guestDropdownRef}>
                    <label id="guests-label" className="block text-xs sm:text-sm font-medium text-[#1E293B] mb-1.5 sm:mb-2">
                      Guests
                    </label>
                    <button
                      type="button"
                      id="search-guests"
                      onClick={() => setIsGuestDropdownOpen(!isGuestDropdownOpen)}
                      aria-expanded={isGuestDropdownOpen}
                      aria-haspopup="listbox"
                      aria-labelledby="guests-label"
                      className="neu-input w-full pl-9 sm:pl-10 pr-8 sm:pr-10 py-2 sm:py-3 text-[#1E293B] text-left flex items-center justify-between text-xs sm:text-base !rounded-full bg-white/90 focus-visible:ring-2 focus-visible:ring-brand-primary"
                    >
                      <span className="truncate">{getGuestDisplayText()}</span>
                      <ChevronDown className={`w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#64748B] transition-transform ${isGuestDropdownOpen ? 'rotate-180' : ''}`} aria-hidden="true" />
                    </button>
                    <Users className="absolute left-3 top-[30px] sm:top-[38px] w-4 h-4 sm:w-5 sm:h-5 text-[#64748B]" aria-hidden="true" />

                    {isGuestDropdownOpen && (
                      <div
                        className="absolute left-0 right-0 top-full mt-2 neu-dropdown p-4 z-[100]"
                        onClick={(e) => e.stopPropagation()}
                        role="listbox"
                        aria-labelledby="guests-label"
                      >
                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-[#1E293B]">Adults</p>
                            <p className="text-sm text-[#64748B]">Ages 13 or above</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateGuests('adults', false)
                              }}
                              aria-label="Decrease adults"
                              className="w-8 h-8 rounded-xl neu-button flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-brand-primary"
                              disabled={guestCounts.adults <= 1}
                            >
                              <Minus className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <div className="w-10 h-8 overflow-hidden relative" aria-live="polite" aria-atomic="true">
                              <motion.span
                                key={guestCounts.adults}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 flex items-center justify-center font-medium text-[#1E293B]"
                              >
                                {guestCounts.adults}
                              </motion.span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateGuests('adults', true)
                              }}
                              aria-label="Increase adults"
                              className="w-8 h-8 rounded-xl neu-button flex items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <Plus className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between py-3">
                          <div>
                            <p className="font-medium text-[#1E293B]">Children</p>
                            <p className="text-sm text-[#64748B]">Ages 2-12</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateGuests('children', false)
                              }}
                              aria-label="Decrease children"
                              className="w-8 h-8 rounded-xl neu-button flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-brand-primary"
                              disabled={guestCounts.children <= 0}
                            >
                              <Minus className="w-4 h-4" aria-hidden="true" />
                            </button>
                            <div className="w-10 h-8 overflow-hidden relative" aria-live="polite" aria-atomic="true">
                              <motion.span
                                key={guestCounts.children}
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 20, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="absolute inset-0 flex items-center justify-center font-medium text-[#1E293B]"
                              >
                                {guestCounts.children}
                              </motion.span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                updateGuests('children', true)
                              }}
                              aria-label="Increase children"
                              className="w-8 h-8 rounded-xl neu-button flex items-center justify-center transition-all duration-200 focus-visible:ring-2 focus-visible:ring-brand-primary"
                            >
                              <Plus className="w-4 h-4" aria-hidden="true" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      variant="primary"
                      className="w-full py-2.5 sm:py-3 text-sm sm:text-base !rounded-full"
                      rightIcon={<Search className="w-4 h-4 sm:w-5 sm:h-5" />}
                    >
                      Search
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>

          {/* Popular Destinations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6 sm:mt-8 text-center"
          >
            <p className="text-white/80 text-xs sm:text-sm mb-3 font-medium">Popular Destinations</p>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {['Cox\'s Bazar', 'Sajek Valley', 'Sylhet', 'Dhaka'].map((destination, index) => (
                <motion.button
                  key={destination}
                  type="button"
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setSearchData({ ...searchData, location: destination })
                    const params = new URLSearchParams({
                      location: destination,
                      checkIn: searchData.checkIn,
                      checkOut: searchData.checkOut,
                      guests: totalGuests.toString(),
                      type: searchData.type,
                    })
                    window.location.href = `/search?${params.toString()}`
                  }}
                  className="px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-xs sm:text-sm font-medium border border-white/30 hover:border-white/50 transition-all duration-200"
                >
                  {destination}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Featured Apartments */}
      <section className="py-2 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-12">
            <div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#1E293B] mb-1 sm:mb-2">
                Featured Apartments
              </h2>
              <p className="text-xs sm:text-base text-[#64748B]">
                Handpicked apartments for your perfect stay
              </p>
            </div>
            <Link href="/apartments" className="self-start sm:self-auto">
              <Button variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} className="text-xs sm:text-sm py-2 sm:py-2.5">
                View All
              </Button>
            </Link>
          </div>

          <Carousel
            items={featuredApartments}
            renderItem={(property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card property={property} />
              </motion.div>
            )}
            itemWidth="w-[280px] sm:w-[320px] lg:w-[380px]"
            gap="gap-4 sm:gap-6"
          />
        </div>
      </section>

      {/* Popular Hotels */}
      <section className="py-2 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-12">
            <div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#1E293B] mb-1 sm:mb-2">
                Popular Hotels
              </h2>
              <p className="text-xs sm:text-base text-[#64748B]">
                Top-rated hotels with exceptional service
              </p>
            </div>
            <Link href="/hotels" className="self-start sm:self-auto">
              <Button variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} className="text-xs sm:text-sm py-2 sm:py-2.5">
                View All
              </Button>
            </Link>
          </div>

          <Carousel
            items={popularHotels}
            renderItem={(property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card property={property} />
              </motion.div>
            )}
            itemWidth="w-[280px] sm:w-[320px] lg:w-[380px]"
            gap="gap-4 sm:gap-6"
          />
        </div>
      </section>

      {/* Trending Tours */}
      <section className="py-2 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-12">
            <div>
              <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#1E293B] mb-1 sm:mb-2">
                Trending Tours
              </h2>
              <p className="text-xs sm:text-base text-[#64748B]">
                Unforgettable experiences across Bangladesh
              </p>
            </div>
            <Link href="/tours" className="self-start sm:self-auto">
              <Button variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />} className="text-xs sm:text-sm py-2 sm:py-2.5">
                View All
              </Button>
            </Link>
          </div>

          <Carousel
            items={trendingTours}
            renderItem={(property, index) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="h-full"
              >
                <Card property={property} />
              </motion.div>
            )}
            itemWidth="w-[280px] sm:w-[320px] lg:w-[380px]"
            gap="gap-4 sm:gap-6"
          />
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-2 sm:py-4 lg:py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-12 lg:mb-16">
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold text-[#1E293B] mb-2 sm:mb-4">
              Why Choose Restiqa?
            </h2>
            <p className="text-xs sm:text-base text-[#64748B] max-w-2xl mx-auto">
              We provide the best travel experience with premium properties,
              secure bookings, and exceptional customer service.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
            {[
              {
                icon: '🏠',
                title: 'Verified Properties',
                description: 'All properties are verified for quality and safety',
              },
              {
                icon: '🔒',
                title: 'Secure Booking',
                description: 'Your payments and data are always protected',
              },
              {
                icon: '💬',
                title: '24/7 Support',
                description: 'Our team is always here to help you',
              },
              {
                icon: '💰',
                title: 'Best Prices',
                description: 'Competitive prices with no hidden fees',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="neu-card p-3 sm:p-6 text-center"
              >
                <div className="text-2xl sm:text-4xl mb-2 sm:mb-4">{feature.icon}</div>
                <h3 className="text-sm sm:text-lg font-semibold text-[#1E293B] mb-1 sm:mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#64748B] text-[10px] sm:text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-4 sm:py-10 px-4 sm:px-6 lg:px-8 mb-6 sm:mb-0">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="neu-primary p-6 sm:p-8 md:p-12 text-center text-white"
          >
            <h2 className="text-xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
              Ready to List Your Property?
            </h2>
            <p className="text-white/90 mb-6 sm:mb-8 max-w-2xl mx-auto text-xs sm:text-base">
              Join thousands of hosts who trust Restiqa to manage their
              properties and connect with travelers from around the world.
            </p>
            <Link href="/host/properties/new">
              <Button
                variant="default"
                size="lg"
                className="bg-white text-brand-primary text-sm sm:text-base"
              >
                Become a Host
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

