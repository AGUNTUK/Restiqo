import { NextResponse } from 'next/server';
import { getFirestoreDB } from '@/lib/firebase/database';

const UDDOKTAPAY_API_KEY = process.env.UDDOKTAPAY_API_KEY;
const UDDOKTAPAY_BASE_URL = process.env.UDDOKTAPAY_BASE_URL;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { invoice_id } = body;

        if (!invoice_id) {
            return NextResponse.json(
                { error: 'Missing invoice_id' },
                { status: 400 }
            );
        }

        const response = await fetch(`${UDDOKTAPAY_BASE_URL}/verify-payment`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'RT-UDDOKTAPAY-API-KEY': UDDOKTAPAY_API_KEY as string,
                'accept': 'application/json'
            },
            body: JSON.stringify({ invoice_id }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('UddoktaPay Verify Error:', data);
            return NextResponse.json(
                { error: 'Failed to verify payment', details: data },
                { status: response.status || 500 }
            );
        }

        // Example UddoktaPay Verification Response fields you might expect:
        // status: "COMPLETED" or "PENDING"
        // metadata: { booking_id: "..." }
        // payment_method: "bKash"
        // amount: "100"
        // date: "2023-11-20 12:00:00"

        const isPaid = data.status === 'COMPLETED' || data.status === 'PAID';
        const bookingId = data.metadata?.booking_id;

        if (bookingId) {
            const db = getFirestoreDB();
            const updateData: any = {
                invoiceId: invoice_id,
                paymentStatus: isPaid ? 'paid' : 'pending',
                amount: data.amount,
                paymentMethod: data.payment_method || null,
                transactionTime: data.date || null,
            };

            if (isPaid) {
                updateData.status = 'confirmed';
            }

            await db.updateBooking(bookingId, updateData);
        }

        return NextResponse.json({ ...data, isPaid });
    } catch (error: any) {
        console.error('Verify Payment Error:', error);
        return NextResponse.json(
            { error: 'Server error verifying payment' },
            { status: 500 }
        );
    }
}
