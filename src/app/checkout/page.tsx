'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth/AuthContext';
import { SupabaseDBService } from '@/lib/supabase/database';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { Booking, Property } from '@/types/database';
import { Clock, AlertTriangle } from 'lucide-react';

export default function CheckoutPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, profile } = useAuth();
    const bookingId = searchParams.get('bookingId');

    const [booking, setBooking] = useState<any | null>(null);
    const [property, setProperty] = useState<Property | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState<string>('');
    const [isExpired, setIsExpired] = useState(false);

    useEffect(() => {
        if (!bookingId) {
            router.push('/');
            return;
        }

        const fetchBookingDetails = async () => {
            try {
                const db = new SupabaseDBService();
                const bookingData = await db.getBooking(bookingId);

                if (!bookingData) {
                    toast.error('Booking not found');
                    router.push('/');
                    return;
                }

                setBooking(bookingData);

                const pid = (bookingData as any).propertyId || (bookingData as any).property_id;
                if (pid) {
                    const propertyData = await db.getProperty(pid);
                    setProperty(propertyData as any as Property);
                }

                // Check initial expiry
                if ((bookingData as any).payment_expires_at) {
                    const now = new Date().getTime();
                    const expiry = new Date((bookingData as any).payment_expires_at).getTime();
                    if (expiry - now <= 0) {
                        setIsExpired(true);
                        setTimeLeft('Expired');
                    }
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

    useEffect(() => {
        if (!booking?.payment_expires_at || isExpired) return;

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const expiry = new Date(booking.payment_expires_at).getTime();
            const difference = expiry - now;

            if (difference <= 0) {
                clearInterval(timer);
                setTimeLeft('Expired');
                setIsExpired(true);
                return;
            }

            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((difference % (1000 * 60)) / 1000);
            setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
        }, 1000);

        return () => clearInterval(timer);
    }, [booking?.payment_expires_at, isExpired]);

    const handlePayment = async () => {
        if (!booking || isExpired) return;

        setPaymentLoading(true);
        try {
            const fullName = profile?.full_name || user?.user_metadata?.full_name || 'Guest User';
            const email = profile?.email || user?.email || 'guest@restiqa.com';

            const response = await fetch('/api/create-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: fullName,
                    email: email,
                    amount: booking.totalPrice || booking.total_price,
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

    if (!booking) return null;

    const amountToPay = booking.totalPrice || booking.total_price;

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
                                {new Date(booking.checkIn || booking.check_in).toLocaleDateString()} &rarr; {new Date(booking.checkOut || booking.check_out).toLocaleDateString()}
                            </span>
                        </div>

                        <div className="flex justify-between pt-4 border-t border-gray-100 text-lg font-bold text-gray-900">
                            <span>Total Amount</span>
                            <span>BDT {amountToPay?.toLocaleString()}</span>
                        </div>
                    </div>

                    {booking.payment_expires_at && !isExpired && (
                        <div className="flex items-center justify-center gap-2 py-3 bg-amber-50 rounded-2xl text-amber-700 font-bold border border-amber-100 animate-pulse">
                            <Clock className="w-5 h-5" />
                            <span>Payment expires in: {timeLeft}</span>
                        </div>
                    )}

                    {isExpired && (
                        <div className="flex items-center justify-center gap-2 py-3 bg-red-50 rounded-2xl text-red-600 font-bold border border-red-100">
                            <AlertTriangle className="w-5 h-5" />
                            <span>This booking has expired.</span>
                        </div>
                    )}
                </div>

                <Button
                    variant="primary"
                    className="w-full text-lg py-4"
                    onClick={handlePayment}
                    disabled={paymentLoading || isExpired}
                >
                    {paymentLoading ? 'Processing...' : isExpired ? 'Booking Expired' : 'Pay Now'}
                </Button>
                
                {isExpired && (
                    <p className="text-center text-sm text-gray-500 mt-4">
                        Please go back to the property page to start a new booking.
                    </p>
                )}
            </motion.div>
        </div>
    );
}
