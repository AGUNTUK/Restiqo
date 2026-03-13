create table bookings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  property_id uuid,
  total_price numeric,
  status text default 'pending',
  payment_id text,
  created_at timestamp default now()
);
