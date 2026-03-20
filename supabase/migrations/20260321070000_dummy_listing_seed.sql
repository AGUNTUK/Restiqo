-- ============================================================
-- Dummy Listing Seed — Company Verification
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================
-- This inserts a single showcase listing owned by the first admin
-- (or the first user if no admin exists yet).
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING).
-- ============================================================

DO $$
DECLARE
  v_host_id UUID;
  v_listing_id UUID := '00000000-0000-0000-0000-000000000001'; -- fixed UUID so re-runs are idempotent
BEGIN
  -- Pick the first admin user; fall back to any user if no admin exists
  SELECT id INTO v_host_id
  FROM public.users
  WHERE role = 'admin'
  ORDER BY created_at ASC
  LIMIT 1;

  IF v_host_id IS NULL THEN
    SELECT id INTO v_host_id
    FROM public.users
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  IF v_host_id IS NULL THEN
    RAISE NOTICE 'No users found. Please create a user account first, then re-run this script.';
    RETURN;
  END IF;

  INSERT INTO public.listings (
    id,
    host_id,
    title,
    description,
    price,
    location,
    city,
    country,
    latitude,
    longitude,
    type,
    beds,
    baths,
    max_guests,
    amenities,
    images,
    is_available,
    status
  )
  VALUES (
    v_listing_id,
    v_host_id,
    'Restiqa Showcase Suite — Dhaka City View',
    E'Welcome to Restiqa''s flagship showcase property — a premium suite in the heart of Dhaka.\n\n'
    'This listing is used for platform demonstration and company verification. It features a modern '
    'open-plan layout with panoramic city views, high-speed WiFi, and a fully equipped kitchen.\n\n'
    'Ideal for business travellers and digital nomads looking for a comfortable, centrally located stay.',
    8500.00,
    'Gulshan-2, Dhaka 1212',
    'Dhaka',
    'Bangladesh',
    23.7937,
    90.4066,
    'apartment',
    2,
    2,
    4,
    ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Washing Machine', 'Parking', 'Elevator', '24/7 Security'],
    ARRAY[
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
      'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=1200&q=80',
      'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&q=80'
    ],
    TRUE,
    'approved'
  )
  ON CONFLICT (id) DO UPDATE SET
    title       = EXCLUDED.title,
    status      = 'approved',
    is_available = TRUE;

  RAISE NOTICE 'Dummy listing inserted/updated successfully (id: %, host: %)', v_listing_id, v_host_id;
END $$;
