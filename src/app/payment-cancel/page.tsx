'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { XCircle, ArrowRight, RefreshCcw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function PaymentCancelPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen pt-24 pb-12 bg-gray-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full mx-auto p-8 text-center space-y-6 bg-white rounded-3xl shadow-xl shadow-red-500/10"
            >
                <div className="flex justify-center">
                    <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-500" />
                    </div>
                </div>

                <div className="space-y-2">
                    <h1 className="text-3xl font-bold text-gray-900">Payment Canceled</h1>
                    <p className="text-gray-500">
                        You have canceled the payment process. No charges were made to your account.
                    </p>
                </div>

                <div className="pt-6 space-y-3">
                    <Button
                        variant="primary"
                        className="w-full justify-center group"
                        onClick={() => router.push('/bookings')} // or redirect them somewhere sensible
                    >
                        <span>View My Bookings</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <Button
                        variant="outline"
                        className="w-full justify-center"
                        onClick={() => router.push('/')}
                    >
                        <RefreshCcw className="w-4 h-4 mr-2" />
                        <span>Return to Home</span>
                    </Button>
                </div>
            </motion.div>
        </div>
    );
}
