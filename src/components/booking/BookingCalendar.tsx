'use client'

import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Info } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isBefore, isAfter, addDays, differenceInDays } from 'date-fns'

interface BlockedDate {
    date: Date
    reason: 'booked' | 'blocked' | 'unavailable'
}

interface PricingTier {
    date: Date
    price: number
    isSpecial: boolean
}

interface BookingCalendarProps {
    basePrice: number
    blockedDates?: BlockedDate[]
    pricingTiers?: PricingTier[]
    minStay?: number
    maxStay?: number
    checkIn?: Date
    checkOut?: Date
    onDateSelect: (checkIn: Date | null, checkOut: Date | null) => void
    maxGuests?: number
    className?: string
}

export default function BookingCalendar({
    basePrice,
    blockedDates = [],
    pricingTiers = [],
    minStay = 1,
    checkIn: selectedCheckIn,
    checkOut: selectedCheckOut,
    onDateSelect,
    className = '',
}: BookingCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [hoverDate, setHoverDate] = useState<Date | null>(null)
    const [selectingCheckout, setSelectingCheckout] = useState(false)

    // Get pricing for a specific date
    const getPriceForDate = useCallback((date: Date): number => {
        const tier = pricingTiers.find((t) => isSameDay(t.date, date))
        return tier?.price ?? basePrice
    }, [basePrice, pricingTiers])

    // Check if date is blocked
    const isDateBlocked = useCallback((date: Date): boolean => {
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        // Past dates are blocked
        if (isBefore(date, today)) return true

        // Check blocked dates list
        return blockedDates.some(
            (blocked) => isSameDay(blocked.date, date)
        )
    }, [blockedDates])

    // Get blocked reason for a date
    const getBlockedReason = useCallback((date: Date): string | null => {
        const blocked = blockedDates.find((b) => isSameDay(b.date, date))
        return blocked?.reason ?? null
    }, [blockedDates])

    // Generate calendar days
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth)
        const monthEnd = endOfMonth(currentMonth)
        const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

        // Add padding days from previous month
        const startPadding = monthStart.getDay()
        const paddingStart = Array(startPadding).fill(null)

        return [...paddingStart, ...days]
    }, [currentMonth])

    // Handle date click
    const handleDateClick = useCallback((date: Date) => {
        if (isDateBlocked(date)) return

        if (!selectingCheckout && !selectedCheckIn) {
            // Selecting check-in
            onDateSelect(date, null)
            setSelectingCheckout(true)
        } else if (selectingCheckout && selectedCheckIn) {
            // Selecting check-out
            if (isBefore(date, selectedCheckIn)) {
                // If clicked date is before check-in, start over
                onDateSelect(date, null)
            } else {
                // Validate minimum stay
                const nights = differenceInDays(date, selectedCheckIn)
                if (nights < minStay) {
                    return // Don't allow selection shorter than min stay
                }
                onDateSelect(selectedCheckIn, date)
                setSelectingCheckout(false)
            }
        } else if (selectedCheckIn && !selectedCheckOut) {
            // Already have check-in, selecting check-out
            if (isBefore(date, selectedCheckIn)) {
                onDateSelect(date, null)
            } else {
                const nights = differenceInDays(date, selectedCheckIn)
                if (nights >= minStay) {
                    onDateSelect(selectedCheckIn, date)
                    setSelectingCheckout(false)
                }
            }
        }
    }, [isDateBlocked, selectingCheckout, selectedCheckIn, selectedCheckOut, onDateSelect, minStay])

    // Check if date is in selected range
    const isInRange = useCallback((date: Date): boolean => {
        if (!selectedCheckIn) return false

        const end = selectedCheckOut ?? hoverDate
        if (!end) return false

        return isAfter(date, selectedCheckIn) && isBefore(date, end)
    }, [selectedCheckIn, selectedCheckOut, hoverDate])

    // Check if date is the start or end of range
    const isRangeStart = useCallback((date: Date): boolean => {
        return selectedCheckIn ? isSameDay(date, selectedCheckIn) : false
    }, [selectedCheckIn])

    const isRangeEnd = useCallback((date: Date): boolean => {
        return selectedCheckOut ? isSameDay(date, selectedCheckOut) : false
    }, [selectedCheckOut])

    // Calculate total price for selected dates
    const calculateTotal = useCallback((): { nights: number; total: number; discount: number } => {
        if (!selectedCheckIn || !selectedCheckOut) {
            return { nights: 0, total: 0, discount: 0 }
        }

        const nights = differenceInDays(selectedCheckOut, selectedCheckIn)
        let total = 0

        // Sum up pricing for each night
        for (let i = 0; i < nights; i++) {
            const date = addDays(selectedCheckIn, i)
            total += getPriceForDate(date)
        }

        // Apply long-stay discounts
        let discount = 0
        if (nights >= 30) {
            discount = total * 0.20 // 20% off for 30+ nights
        } else if (nights >= 7) {
            discount = total * 0.10 // 10% off for 7+ nights
        }

        return { nights, total: total - discount, discount }
    }, [selectedCheckIn, selectedCheckOut, getPriceForDate])

    const { nights, total, discount } = calculateTotal()

    // Navigate months
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className={`neu-xl p-4 sm:p-6 ${className}`}>
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl neu-button hover:scale-105 transition-transform"
                    aria-label="Previous month"
                >
                    <ChevronLeft className="w-5 h-5 text-[#64748B]" />
                </button>
                <h3 className="text-lg font-semibold text-[#1E293B]">
                    {format(currentMonth, 'MMMM yyyy')}
                </h3>
                <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl neu-button hover:scale-105 transition-transform"
                    aria-label="Next month"
                >
                    <ChevronRight className="w-5 h-5 text-[#64748B]" />
                </button>
            </div>

            {/* Week Days Header */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                    <div key={day} className="text-center text-xs font-medium text-[#64748B] py-2">
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                    if (!date) {
                        return <div key={`empty-${index}`} className="aspect-square" />
                    }

                    const blocked = isDateBlocked(date)
                    const blockedReason = getBlockedReason(date)
                    const rangeStart = isRangeStart(date)
                    const rangeEnd = isRangeEnd(date)
                    const inRange = isInRange(date)
                    const price = getPriceForDate(date)
                    const isToday = isSameDay(date, new Date())
                    const isCurrentMonth = isSameMonth(date, currentMonth)

                    return (
                        <motion.button
                            key={date.toISOString()}
                            onClick={() => handleDateClick(date)}
                            onMouseEnter={() => setHoverDate(date)}
                            onMouseLeave={() => setHoverDate(null)}
                            disabled={blocked}
                            className={`
                relative aspect-square rounded-xl flex flex-col items-center justify-center
                transition-all duration-200 text-sm
                ${!isCurrentMonth ? 'opacity-30' : ''}
                ${blocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-105'}
                ${rangeStart || rangeEnd ? 'bg-brand-primary text-white neu-button-primary' : ''}
                ${inRange ? 'bg-brand-primary/20' : ''}
                ${!blocked && !rangeStart && !rangeEnd && !inRange ? 'neu-button' : ''}
                ${isToday && !rangeStart && !rangeEnd ? 'ring-2 ring-brand-primary' : ''}
              `}
                            whileTap={!blocked ? { scale: 0.95 } : {}}
                        >
                            <span className="font-medium">{format(date, 'd')}</span>
                            {isCurrentMonth && !blocked && (
                                <span className={`text-[10px] ${rangeStart || rangeEnd ? 'text-white/80' : 'text-[#64748B]'}`}>
                                    ৳{price.toLocaleString()}
                                </span>
                            )}
                            {blocked && blockedReason === 'booked' && (
                                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-red-500" />
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap gap-4 text-xs text-[#64748B]">
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-brand-primary" />
                    <span>Selected</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-brand-primary/20" />
                    <span>In Range</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded bg-gray-300" />
                    <span>Unavailable</span>
                </div>
            </div>

            {/* Minimum Stay Info */}
            {minStay > 1 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-[#64748B]">
                    <Info className="w-4 h-4" />
                    <span>Minimum stay: {minStay} nights</span>
                </div>
            )}

            {/* Price Summary */}
            <AnimatePresence>
                {selectedCheckIn && selectedCheckOut && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-4 pt-4 border-t border-[#E2E8F0]"
                    >
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between text-[#64748B]">
                                <span>৳{basePrice.toLocaleString()} × {nights} nights</span>
                                <span>৳{(basePrice * nights).toLocaleString()}</span>
                            </div>

                            {discount > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>
                                        {nights >= 30 ? 'Monthly discount (20%)' : 'Weekly discount (10%)'}
                                    </span>
                                    <span>-৳{discount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between font-semibold text-[#1E293B] pt-2 border-t border-[#E2E8F0]">
                                <span>Total</span>
                                <span>৳{total.toLocaleString()}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Clear Selection Button */}
            {(selectedCheckIn || selectedCheckOut) && (
                <button
                    onClick={() => {
                        onDateSelect(null, null)
                        setSelectingCheckout(false)
                    }}
                    className="mt-3 w-full py-2 text-sm text-[#64748B] hover:text-brand-primary transition-colors"
                >
                    Clear dates
                </button>
            )}
        </div>
    )
}

