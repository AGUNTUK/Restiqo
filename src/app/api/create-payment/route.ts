import { NextResponse } from 'next/server';
import { getFirestoreDB } from '@/lib/firebase/database';

const UDDOKTAPAY_API_KEY = process.env.UDDOKTAPAY_API_KEY;
const UDDOKTAPAY_BASE_URL = process.env.UDDOKTAPAY_BASE_URL;

function getBaseUrl(request: Request) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (siteUrl && siteUrl !== 'http://localhost:3000') return siteUrl;

    const host = request.headers.get('host');
    const protocol = host?.includes('localhost') ? 'http' : 'https';
    return `${protocol}://${host}`;
}

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

        const siteUrl = getBaseUrl(request);

        const payload = {
            full_name,
            email,
            amount,
            metadata: {
                booking_id,
            },
            redirect_url: `${siteUrl}/payment-success`,
            cancel_url: `${siteUrl}/payment-cancel`,
            webhook_url: `${siteUrl}/api/webhook/uddoktapay`
        };

        const response = await fetch(`${UDDOKTAPAY_BASE_URL}/checkout-v2`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY as string,
                'accept': 'application/json'
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
