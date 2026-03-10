import { NextResponse } from 'next/server';
import { getFirestoreDB } from '@/lib/firebase/database';

const UDDOKTAPAY_API_KEY = process.env.UDDOKTAPAY_API_KEY || 'xNI7FRQFfQjginovEKO4j0M6ubG6CkgY9vx9Ppm8';
const UDDOKTAPAY_BASE_URL = 'https://restiqa4u.paymently.io/api';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { full_name, email, amount, booking_id } = body;

        if (!full_name || !email || !amount || !booking_id) {
            return NextResponse.json(
                { error: 'Missing required parameters' },
                { status: 400 }
            );
        }

        const payload = {
            full_name,
            email,
            amount,
            metadata: {
                booking_id,
            },
            redirect_url: `${APP_URL}/payment-success`,
            cancel_url: `${APP_URL}/payment-cancel`,
            signature_key: UDDOKTAPAY_API_KEY // Optional depending on verification, but safe to include standard fields
        };

        const response = await fetch(`${UDDOKTAPAY_BASE_URL}/checkout-v2`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY,
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();

        if (!response.ok || !data.status) {
            console.error('UddoktaPay Error:', data);
            return NextResponse.json(
                { error: 'Failed to initiate payment', details: data },
                { status: response.status || 500 }
            );
        }

        return NextResponse.json({ payment_url: data.payment_url });
    } catch (error: any) {
        console.error('Create Payment Error:', error);
        return NextResponse.json(
            { error: 'Server error processing payment request' },
            { status: 500 }
        );
    }
}
