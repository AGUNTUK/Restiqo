'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/AuthContext';
import { getFirestoreDB } from '@/lib/firebase/database';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Booking, Property } from '@/types/database';

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, profile } = useAuth();
    const bookingId = searchParams.get('bookingId');

    const [booking, setBooking] = useState<Booking | null>(null);
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);

    useEffect(() => {
        if (!bookingId) {
            router.push('/');
            return;
        }

        const fetchBookingDetails = async () => {
            try {
                const db = getFirestoreDB();
                const bookingData = await db.getBooking(bookingId);

                if (!bookingData) {
                    toast.error('Booking not found');
                    router.push('/');
                    return;
                }

                setBooking(bookingData as Booking);

                if ((bookingData as any).propertyId || (bookingData as any).property_id) {
                    const propertyData = await db.getProperty((bookingData as any).propertyId || (bookingData as any).property_id);
                    setProperty(propertyData as Property);
                }
            } catch (error) {
                console.error('Error fetching checkout details:', error);
                toast.error('Failed to load checkout details');
            } finally {
                setLoading(false);
            }
        };

        fetchBookingDetails();
    }, [bookingId, router]);

    const handlePayment = async () => {
        if (!booking) return;

        setPaymentLoading(true);
        try {
            // Default to profile info or user info, otherwise fallback
            const fullName = profile?.full_name || user?.displayName || 'Guest User';
            const email = profile?.email || user?.email || 'guest@restiqa.com';

            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    amount: (booking as any).totalPrice || (booking as any).total_price, // handle both cases based on db schema naming
                    booking_id: booking.id,
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Payment initialization failed');
            }

            if (data.payment_url) {
                window.location.href = data.payment_url;
            } else {
                throw new Error('No payment URL received');
            }
        } catch (error: any) {
            console.error('Payment Error:', error);
            toast.error(error.message || 'Something went wrong while initiating payment.');
            setPaymentLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-20 flex items-center justify-center">
                <div className="animate-spin w-10 h-10 border-4 border-brand-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!booking) {
        return null;
    }

    const amountToPay = (booking as any).totalPrice || (booking as any).total_price;

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full mx-auto p-6 md:p-8 space-y-8 bg-white rounded-3xl shadow-xl shadow-brand-primary/5"
            >
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Checkout</h1>
                    <p className="text-gray-500">Review your booking and complete payment.</p>
                </div>

                <div className="space-y-4">
                    <div className="neu-card p-5 space-y-4">
                        {property && (
                            <div className="border-b border-gray-100 pb-4">
                                <h3 className="font-semibold text-lg text-gray-900">{property.title}</h3>
                                <p className="text-sm text-gray-500">{property.city}, {property.country}</p>
                            </div>
                        )}

                        <div className="flex justify-between text-gray-600">
                            <span>Booking ID</span>
                            <span className="font-medium">{booking.id.slice(0, 8).toUpperCase()}</span>
                        </div>

                        <div className="flex justify-between text-gray-600">
                            <span>Dates</span>
                            <span className="font-medium">
                                {new Date((booking as any).checkIn || (booking as any).check_in).toLocaleDateString()} &rarr; {new Date((booking as any).checkOut || (booking as any).check_out).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-gray-100 text-lg font-bold text-gray-900">
                            <span>Total Amount</span>
                            <span>BDT {amountToPay?.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                <Button
                    variant="primary"
                    className="w-full text-lg py-4"
                    onClick={handlePayment}
                    disabled={paymentLoading}
                >
                    {paymentLoading ? 'Processing...' : 'Pay Now'}
                </Button>
            </motion.div>
        </div>
    );
}
