import { NextResponse } from 'next/server';
import { SupabaseDBService } from '@/lib/supabase/database';

export async function POST(request: Request) {
    try {
        const apiKey = process.env.UDDOKTAPAY_API_KEY;
        const headerApiKey = request.headers.get('RT-UDDOKTAPAY-API-KEY');

        // Verify the API key
        if (!headerApiKey || headerApiKey !== apiKey) {
            console.error('Webhook Unauthorized: Invalid API Key');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        console.log('UddoktaPay Webhook Received:', body);

        const { status, invoice_id, metadata, amount, payment_method, date } = body;
        const bookingId = metadata?.booking_id;

        if (bookingId) {
            const isPaid = status === 'COMPLETED' || status === 'PAID';
            const db = new SupabaseDBService();

            const updateData: any = {
                invoiceId: invoice_id,
                paymentStatus: isPaid ? 'paid' : 'pending',
                amount: amount,
                paymentMethod: payment_method || null,
                transactionTime: date || null,
            };

            if (isPaid) {
                updateData.status = 'confirmed';
            }

            await db.updateBooking(bookingId, updateData);
            console.log(`Booking ${bookingId} updated via webhook. Status: ${status}`);
        }

        return NextResponse.json({ message: 'Webhook received successfully' }, { status: 200 });
    } catch (error: any) {
        console.error('Webhook Error:', error);
        if (error.stack) {
            console.error(error.stack);
        }
        return NextResponse.json(
            { error: 'Server error processing webhook', details: error.message },
            { status: 500 }
        );
    }
}
