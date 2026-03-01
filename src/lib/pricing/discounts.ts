/**
 * Long-Stay Discount Utilities
 * Provides automatic discounts for extended bookings
 */

export interface DiscountTier {
    minNights: number
    maxNights: number
    discountPercent: number
    label: string
}

export interface DiscountResult {
    originalPrice: number
    discountPercent: number
    discountAmount: number
    finalPrice: number
    appliedTier: DiscountTier | null
}

// Default discount tiers (can be customized per property)
export const DEFAULT_DISCOUNT_TIERS: DiscountTier[] = [
    { minNights: 7, maxNights: 13, discountPercent: 10, label: 'Weekly Discount' },
    { minNights: 14, maxNights: 29, discountPercent: 15, label: 'Bi-weekly Discount' },
    { minNights: 30, maxNights: Infinity, discountPercent: 20, label: 'Monthly Discount' },
]

/**
 * Calculate discount for a given number of nights
 */
export function calculateLongStayDiscount(
    basePricePerNight: number,
    nights: number,
    customTiers?: DiscountTier[]
): DiscountResult {
    const tiers = customTiers || DEFAULT_DISCOUNT_TIERS

    // Find applicable tier
    const applicableTier = tiers.find(
        (tier) => nights >= tier.minNights && nights <= tier.maxNights
    ) || null

    const originalPrice = basePricePerNight * nights

    if (!applicableTier) {
        return {
            originalPrice,
            discountPercent: 0,
            discountAmount: 0,
            finalPrice: originalPrice,
            appliedTier: null,
        }
    }

    const discountAmount = originalPrice * (applicableTier.discountPercent / 100)
    const finalPrice = originalPrice - discountAmount

    return {
        originalPrice,
        discountPercent: applicableTier.discountPercent,
        discountAmount,
        finalPrice,
        appliedTier: applicableTier,
    }
}

/**
 * Get the best available discount tier for a property
 */
export function getBestDiscountTier(
    customTiers?: DiscountTier[]
): DiscountTier | null {
    const tiers = customTiers || DEFAULT_DISCOUNT_TIERS
    return tiers.reduce<DiscountTier | null>((best, tier) => {
        if (!best || tier.discountPercent > best.discountPercent) {
            return tier
        }
        return best
    }, null)
}

/**
 * Calculate effective nightly rate after discount
 */
export function getEffectiveNightlyRate(
    basePricePerNight: number,
    nights: number,
    customTiers?: DiscountTier[]
): number {
    const result = calculateLongStayDiscount(basePricePerNight, nights, customTiers)
    return result.finalPrice / nights
}

/**
 * Format discount for display
 */
export function formatDiscount(discount: DiscountResult): string {
    if (!discount.appliedTier) return ''
    return `${discount.appliedTier.label} (${discount.discountPercent}% off)`
}

/**
 * Get savings message for UI
 */
export function getSavingsMessage(discount: DiscountResult): string | null {
    if (!discount.appliedTier || discount.discountAmount === 0) return null
    return `You're saving ৳${discount.discountAmount.toLocaleString()} with ${discount.appliedTier.label}!`
}

/**
 * Check if a stay qualifies for any discount
 */
export function qualifiesForDiscount(
    nights: number,
    customTiers?: DiscountTier[]
): boolean {
    const tiers = customTiers || DEFAULT_DISCOUNT_TIERS
    return tiers.some(
        (tier) => nights >= tier.minNights && nights <= tier.maxNights
    )
}

/**
 * Get next discount tier for a given number of nights
 * (useful for showing "stay X more nights for Y% off")
 */
export function getNextDiscountTier(
    nights: number,
    customTiers?: DiscountTier[]
): { tier: DiscountTier; nightsNeeded: number } | null {
    const tiers = customTiers || DEFAULT_DISCOUNT_TIERS

    // Find the next tier the user doesn't qualify for yet
    const nextTier = tiers.find((tier) => nights < tier.minNights)

    if (!nextTier) return null

    return {
        tier: nextTier,
        nightsNeeded: nextTier.minNights - nights,
    }
}

/**
 * Get incentive message for extending stay
 */
export function getStayExtensionIncentive(
    nights: number,
    customTiers?: DiscountTier[]
): string | null {
    const nextTier = getNextDiscountTier(nights, customTiers)

    if (!nextTier) return null

    return `Stay ${nextTier.nightsNeeded} more night${nextTier.nightsNeeded > 1 ? 's' : ''} for ${nextTier.tier.discountPercent}% off!`
}

/**
 * Calculate price breakdown for a booking
 */
export interface PriceBreakdown {
    nights: number
    basePricePerNight: number
    subtotal: number
    discount: {
        percent: number
        amount: number
        label: string
    } | null
    cleaningFee: number
    serviceFee: number
    taxes: number
    total: number
}

export function calculatePriceBreakdown(
    basePricePerNight: number,
    nights: number,
    options?: {
        cleaningFee?: number
        serviceFeePercent?: number
        taxPercent?: number
        customDiscountTiers?: DiscountTier[]
    }
): PriceBreakdown {
    const {
        cleaningFee = 0,
        serviceFeePercent = 10, // 10% service fee
        taxPercent = 5, // 5% tax
        customDiscountTiers,
    } = options || {}

    const discountResult = calculateLongStayDiscount(
        basePricePerNight,
        nights,
        customDiscountTiers
    )

    const discountedSubtotal = discountResult.finalPrice
    const serviceFee = discountedSubtotal * (serviceFeePercent / 100)
    const taxableAmount = discountedSubtotal + serviceFee + cleaningFee
    const taxes = taxableAmount * (taxPercent / 100)

    return {
        nights,
        basePricePerNight,
        subtotal: discountResult.originalPrice,
        discount: discountResult.appliedTier
            ? {
                percent: discountResult.discountPercent,
                amount: discountResult.discountAmount,
                label: discountResult.appliedTier.label,
            }
            : null,
        cleaningFee,
        serviceFee,
        taxes,
        total: taxableAmount + taxes,
    }
}

/**
 * React hook for price calculations
 */
import { useMemo } from 'react'

export function usePriceCalculation(
    basePricePerNight: number,
    nights: number,
    options?: {
        cleaningFee?: number
        serviceFeePercent?: number
        taxPercent?: number
        customDiscountTiers?: DiscountTier[]
    }
) {
    return useMemo(
        () => calculatePriceBreakdown(basePricePerNight, nights, options),
        [basePricePerNight, nights, options]
    )
}

export function useLongStayDiscount(
    basePricePerNight: number,
    nights: number,
    customTiers?: DiscountTier[]
) {
    return useMemo(
        () => calculateLongStayDiscount(basePricePerNight, nights, customTiers),
        [basePricePerNight, nights, customTiers]
    )
}
