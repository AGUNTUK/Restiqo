'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import toast from 'react-hot-toast';

export default function PaymentSuccessPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const invoiceId = searchParams.get('invoice_id');

    const [verifying, setVerifying] = useState(true);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (!invoiceId) {
            router.push('/');
            return;
        }

        const verifyPayment = async () => {
            try {
                const response = await fetch('/api/verify-payment', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ invoice_id: invoiceId }),
                });

                const data = await response.json();

                if (response.ok && data.isPaid) {
                    setSuccess(true);
                    toast.success('Payment verified successfully!');
                } else {
                    toast.error('Payment verification failed. If you were charged, contact support.');
                    setSuccess(false);
                }
            } catch (error) {
                console.error('Verify error:', error);
                toast.error('Something went wrong during verification.');
                setSuccess(false);
            } finally {
                setVerifying(false);
            }
        };

        verifyPayment();
    }, [invoiceId, router]);

    if (verifying) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <div className="animate-spin w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full" />
                <p className="text-gray-500 font-medium">Verifying your payment...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full mx-auto p-8 text-center space-y-6 bg-white rounded-3xl shadow-xl shadow-green-500/10"
            >
                <div className="flex justify-center">
                    {success ? (
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                    ) : (
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-4xl text-red-500">&times;</span>
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">
                        {success ? 'Payment Successful!' : 'Payment Failed'}
                    </h1>
                    <p className="text-gray-500">
                        {success
                            ? 'Your booking has been confirmed.'
                            : 'We could not verify your payment. Please try again or check your bookings.'}
                    </p>
                </div>

                {invoiceId && (
                    <div className="inline-block px-4 py-2 bg-gray-50 rounded-lg text-sm text-gray-500 font-medium my-4 border border-gray-100">
                        Invoice ID: {invoiceId}
                    </div>
                )}

                <div className="pt-6">
                    <Button
                        variant="primary"
                        className="w-full justify-center group"
                        onClick={() => router.push('/bookings')}
                    >
                        <span>View My Bookings</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
