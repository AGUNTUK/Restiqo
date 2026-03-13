-- Add advanced fields to bookings table
alter table bookings 
add column if not exists payment_expires_at timestamp with time zone,
add column if not exists host_earning numeric,
add column if not exists platform_fee numeric,
add column if not exists commission_rate numeric default 10;

-- Ensure transaction_id in payments is unique for idempotency
-- First, make transaction_id not null if there are no existing nulls or handle them
alter table payments alter column transaction_id set not null;
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'unique_transaction_id') THEN
        alter table payments add constraint unique_transaction_id unique (transaction_id);
    END IF;
END $$;

-- Add index for performance on transaction searches
create index if not exists idx_payments_transaction_id on payments(transaction_id);
create index if not exists idx_bookings_payment_expiry on bookings(payment_expires_at) where status = 'pending';
