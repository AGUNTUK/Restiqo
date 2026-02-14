'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  Hotel,
  Home,
  Compass,
  X,
  Plus,
  Minus
} from 'lucide-react'

// Police stations and popular locations in Bangladesh
const policeStations = [
  // Dhaka Division
  'Gulshan', 'Banani', 'Dhanmondi', 'Uttara', 'Mirpur', 'Mohammadpur', 
  'Tejgaon', 'Ramna', 'Motijheel', 'Paltan', 'Shahbag', 'Lalbagh',
  'Old Dhaka', 'Wari', 'Kotwali', 'Hazrat Shahjalal Airport Area',
  'Badda', 'Bashundhara', 'Baridhara', 'Cantonment', 'Kafrul',
  // Chittagong Division
  'Chittagong City', 'GEC Circle', 'Agrabad', 'Nasirabad', 'Pahartali',
  // Cox's Bazar
  'Cox\'s Bazar Sadar', 'Marine Drive', 'Kolatoli', 'Inani Beach',
  // Sylhet Division
  'Sylhet City', 'Zindabazar', 'Sreemangal', 'Jaflong', 'Ratargul',
  // Rajshahi Division
  'Rajshahi City', 'Bogra', 'Pabna',
  // Khulna Division
  'Khulna City', 'Sundarbans', 'Bagerhat',
  // Rangamati & Bandarban
  'Rangamati', 'Bandarban', 'Nilgiri', 'Kaptai',
  // Other Popular Destinations
  'Sundarbans', 'Saint Martin\'s Island', 'Kuakata', 'Bichanakandi'
]

const searchTypes = [
  { id: 'apartments', label: 'Apartments', icon: Home, path: '/properties' },
  { id: 'hotels', label: 'Hotels', icon: Hotel, path: '/hotels' },
  { id: 'tours', label: 'Tours', icon: Compass, path: '/tours' },
]

export default function HeroSearchBar() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('apartments')
  const [location, setLocation] = useState('')
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [guests, setGuests] = useState(1)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [showGuestDropdown, setShowGuestDropdown] = useState(false)
  
  const locationRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const guestDropdownRef = useRef<HTMLDivElement>(null)

  // Filter locations based on input
  const filteredLocations = policeStations.filter(loc => 
    loc.toLowerCase().includes(location.toLowerCase())
  )

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
      if (guestDropdownRef.current && !guestDropdownRef.current.contains(event.target as Node)) {
        setShowGuestDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = () => {
    const selectedType = searchTypes.find(t => t.id === activeTab)
    const params = new URLSearchParams()
    
    if (location) params.set('location', location)
    if (checkIn) params.set('checkIn', checkIn)
    if (checkOut) params.set('checkOut', checkOut)
    if (guests > 1) params.set('guests', guests.toString())
    
    const queryString = params.toString()
    router.push(`${selectedType?.path}${queryString ? `?${queryString}` : ''}`)
  }

  const handleLocationSelect = (loc: string) => {
    setLocation(loc)
    setShowSuggestions(false)
  }

  const guestOptions = [
    { value: 1, label: '1 Guest' },
    { value: 2, label: '2 Guests' },
    { value: 3, label: '3 Guests' },
    { value: 4, label: '4 Guests' },
    { value: 5, label: '5 Guests' },
    { value: 6, label: '6 Guests' },
  ]

  return (
    <div className="w-full max-w-full md:max-w-4xl mx-auto px-4">
      {/* Search Type Tabs */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-center mb-4"
      >
        <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex gap-1">
          {searchTypes.map((type) => {
            const Icon = type.icon
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveTab(type.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeTab === type.id
                    ? 'bg-primary text-white shadow-lg'
                    : 'text-white hover:bg-white/10'
                }`}
                style={activeTab === type.id ? { backgroundColor: '#14B8A6' } : {}}
              >
                <Icon className="w-4 h-4" />
                {type.label}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Main Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="bg-white rounded-2xl sm:rounded-full shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row items-stretch divide-y divide-gray-200 sm:divide-y-0 sm:divide-x">
          {/* Location Input */}
          <div className="relative flex-1 min-w-0">
            <div className="px-4 sm:px-6 py-4">
              <label className="block text-xs font-semibold text-gray-500 mb-1">
                Where
              </label>
              <div className="relative">
                <MapPin className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  ref={locationRef}
                  type="text"
                  placeholder="Search destinations"
                  value={location}
                  onChange={(e) => {
                    setLocation(e.target.value)
                    setShowSuggestions(true)
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  className="w-full pl-5 pr-8 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                />
                {location && (
                  <button
                    onClick={() => setLocation('')}
                    className="absolute right-0 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Location Suggestions Dropdown */}
            <AnimatePresence>
              {showSuggestions && filteredLocations.length > 0 && (
                <motion.div
                  ref={suggestionsRef}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 mt-2 w-full bg-white rounded-2xl shadow-xl border border-gray-100 max-h-80 overflow-y-auto z-50"
                >
                  <div className="p-2">
                    <p className="text-xs font-semibold text-gray-500 px-3 py-2">
                      Popular Destinations
                    </p>
                    {filteredLocations.slice(0, 8).map((loc) => (
                      <motion.button
                        key={loc}
                        whileHover={{ backgroundColor: '#f3f4f6' }}
                        onClick={() => handleLocationSelect(loc)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left"
                      >
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-teal-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-700">{loc}</span>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Check In */}
          <div className="px-4 sm:px-6 py-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Check In
            </label>
            <div className="relative">
              <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full pl-5 text-sm text-gray-800 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Check Out */}
          <div className="px-4 sm:px-6 py-4">
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Check Out
            </label>
            <div className="relative">
              <Calendar className="absolute left-0 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                min={checkIn || new Date().toISOString().split('T')[0]}
                className="w-full pl-5 text-sm text-gray-800 outline-none bg-transparent"
              />
            </div>
          </div>

          {/* Guests */}
          <div className="relative px-4 sm:px-6 py-4" ref={guestDropdownRef}>
            <label className="block text-xs font-semibold text-gray-500 mb-1">
              Guests
            </label>
            <button
              type="button"
              onClick={() => setShowGuestDropdown(!showGuestDropdown)}
              className="flex items-center gap-2 w-full text-left"
            >
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-800">
                {guests === 1 ? '1 Guest' : `${guests} Guests`}
              </span>
            </button>

            {/* Guest Dropdown with Scrolling */}
            <AnimatePresence>
              {showGuestDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[100]"
                >
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Guests</span>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (guests > 1) setGuests(guests - 1)
                          }}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-teal-500 hover:text-teal-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={guests <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center font-semibold text-gray-800">{guests}</span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (guests < 6) setGuests(guests + 1)
                          }}
                          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-teal-500 hover:text-teal-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={guests >= 6}
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">Max 6 guests</p>
                  </div>
                  <div className="border-t border-gray-100 p-2">
                    <button
                      type="button"
                      onClick={() => setShowGuestDropdown(false)}
                      className="w-full py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Search Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSearch}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white px-6 sm:px-8 py-4 sm:my-2 sm:mr-2 rounded-none sm:rounded-full transition-all duration-200 font-semibold shadow-lg w-full sm:w-auto"
          >
            <Search className="w-5 h-5" />
            <span>Search</span>
          </motion.button>
        </div>
      </motion.div>

      {/* Quick Search Tags */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="flex flex-wrap justify-center gap-2 mt-4"
      >
        {['Cox\'s Bazar', 'Sundarbans', 'Sylhet', 'Saint Martin\'s'].map((dest) => (
          <motion.button
            key={dest}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setLocation(dest)
              handleSearch()
            }}
            className="px-4 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full hover:bg-white/30 transition-colors"
          >
            {dest}
          </motion.button>
        ))}
      </motion.div>
    </div>
  )
}
