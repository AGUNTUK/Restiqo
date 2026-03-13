-- Create payments table
create table if not exists payments (
  id uuid primary key default uuid_generate_v4(),
  booking_id uuid references bookings(id) on delete cascade,
  amount numeric not null,
  currency text default 'BDT',
  gateway text,
  transaction_id text,
  status text,
  created_at timestamp with time zone default now()
);

-- Create payment_logs table for audit trail
create table if not exists payment_logs (
  id uuid primary key default uuid_generate_v4(),
  payload jsonb not null,
  created_at timestamp with time zone default now()
);
