-- ============================================================
-- Restiqa — Seed / Dummy Data  (v2)
-- Run AFTER schema.sql in: Supabase Dashboard → SQL Editor
--
-- Strategy: insert dummy rows into auth.users first so the
-- users_id_fkey FK constraint is satisfied, then let the
-- handle_new_user trigger populate public.users automatically.
-- ============================================================

-- ── Disable RLS temporarily for seeding ─────────────────────
ALTER TABLE public.users     DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings  DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews   DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- STEP 1 — Insert into auth.users (satisfies the FK)
--   auth.users is Supabase's internal table; we insert minimal
--   required columns here so the FK can be satisfied.
--   The handle_new_user trigger will auto-create public.users rows.
-- ============================================================
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'admin@restiqa.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"full_name": "Sarah Admin"}'::jsonb,
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'marco@restiqa.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"full_name": "Marco Rossi"}'::jsonb,
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'aiko@restiqa.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"full_name": "Aiko Tanaka"}'::jsonb,
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'liam@restiqa.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"full_name": "Liam Nguyen"}'::jsonb,
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'emma@restiqa.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"full_name": "Emma Dubois"}'::jsonb,
    NOW(), NOW()
  ),
  (
    '00000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated',
    'james@restiqa.com',
    crypt('Password123!', gen_salt('bf')),
    NOW(),
    '{"full_name": "James Wilson"}'::jsonb,
    NOW(), NOW()
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STEP 2 — Enrich public.users with profile data
--   The trigger already created bare rows; UPDATE them with
--   role, avatar, bio, etc.
-- ============================================================
UPDATE public.users SET
  role = 'admin',
  avatar_url = 'https://i.pravatar.cc/150?img=47',
  bio = 'Platform administrator and travel enthusiast.'
WHERE id = '00000000-0000-0000-0000-000000000001';

UPDATE public.users SET
  role = 'host',
  avatar_url = 'https://i.pravatar.cc/150?img=11',
  bio = 'Superhost with 5 years of experience. I love making guests feel at home in Bali.'
WHERE id = '00000000-0000-0000-0000-000000000002';

UPDATE public.users SET
  role = 'host',
  avatar_url = 'https://i.pravatar.cc/150?img=32',
  bio = 'Interior designer turned host. All my properties are beautifully styled.'
WHERE id = '00000000-0000-0000-0000-000000000003';

UPDATE public.users SET
  role = 'guest',
  avatar_url = 'https://i.pravatar.cc/150?img=57',
  bio = 'Digital nomad exploring Southeast Asia one city at a time.'
WHERE id = '00000000-0000-0000-0000-000000000004';

UPDATE public.users SET
  role = 'guest',
  avatar_url = 'https://i.pravatar.cc/150?img=38',
  bio = 'Paris-based traveller, passionate about architecture and food.'
WHERE id = '00000000-0000-0000-0000-000000000005';

UPDATE public.users SET
  role = 'guest',
  avatar_url = 'https://i.pravatar.cc/150?img=60',
  bio = 'Weekend explorer. Always looking for cozy hidden gems.'
WHERE id = '00000000-0000-0000-0000-000000000006';


-- ============================================================
-- STEP 3 — LISTINGS (8 properties across 5 cities)
-- ============================================================
INSERT INTO public.listings
  (id, title, description, price, location, city, country, latitude, longitude, images, type, beds, baths, max_guests, amenities, host_id)
VALUES
  (
    'a0000000-0000-0000-0000-000000000001',
    'Cox''s Bazar Sea View Apartment',
    'Wake up to the sound of waves in this stunning beachfront apartment. Directly overlooking the longest natural sea beach in the world.',
    4500.00,
    'Kolatoli, Cox''s Bazar', 'Cox''s Bazar', 'Bangladesh',
    21.4272, 91.9702,
    ARRAY['https://images.unsplash.com/photo-1596815064285-45ed8a9c0463?q=80&w=800',
          'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=800'],
    'apartment', 3, 2, 6,
    ARRAY['WiFi','AC','Family-friendly','Near sea','Balcony'],
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    'a0000000-0000-0000-0000-000000000002',
    'Sajek Valley Eco Resort',
    'A charming bamboo cottage nestled among the clouds in Sajek Valley. Enjoy the serene morning mist from your private wooden deck.',
    3200.00,
    'Sajek, Rangamati', 'Sajek', 'Bangladesh',
    23.3833, 92.2833,
    ARRAY['https://images.unsplash.com/photo-1605553535914-7e8c3a10fb63?q=80&w=800',
          'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800'],
    'resort', 1, 1, 2,
    ARRAY['Non-AC','Couple-friendly','Hill view','Breakfast Included'],
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'Dhaka Luxury Suite (Gulshan)',
    'A beautifully styled luxury suite in the diplomatic zone of Gulshan. Perfect for business travelers or couples seeking a premium city experience.',
    8500.00,
    'Gulshan 2, Dhaka', 'Dhaka', 'Bangladesh',
    23.7937, 90.4066,
    ARRAY['https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=800',
          'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
    'suite', 2, 2, 4,
    ARRAY['WiFi','AC','Family-friendly','Couple-friendly','City Center','Gym'],
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'a0000000-0000-0000-0000-000000000004',
    'Sylhet Tea Garden Cottage',
    'Surrounded by endless green tea estates, this tranquil cottage in Srimangal offers an authentic countryside retreat away from the city noise.',
    2500.00,
    'Srimangal, Sylhet', 'Sylhet', 'Bangladesh',
    24.3065, 91.7296,
    ARRAY['https://images.unsplash.com/photo-1592095626359-baae57ef35b2?q=80&w=800',
          'https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?w=800'],
    'cottage', 2, 1, 4,
    ARRAY['WiFi','AC','Family-friendly','Hill view','Kitchen'],
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'a0000000-0000-0000-0000-000000000005',
    'Bandarban Hillside Villa',
    'An opulent villa sitting high in the Bandarban hills. Breathtaking panoramic views, perfect for large groups seeking adventure and luxury.',
    6500.00,
    'Chimbuk Road, Bandarban', 'Bandarban', 'Bangladesh',
    22.1953, 92.2184,
    ARRAY['https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=800',
          'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800'],
    'villa', 4, 3, 10,
    ARRAY['WiFi','Non-AC','Family-friendly','Hill view','BBQ'],
    '00000000-0000-0000-0000-000000000002'
  ),
  (
    'a0000000-0000-0000-0000-000000000006',
    'Chittagong Port View Penthouse',
    'Stunning modern penthouse providing sweeping views of the bustling Chittagong port and Karnaphuli River from a private terrace.',
    5000.00,
    'Agrabad, Chittagong', 'Chittagong', 'Bangladesh',
    22.3569, 91.7832,
    ARRAY['https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=800',
          'https://images.unsplash.com/photo-1560185127-6a8e9ede0a50?w=800'],
    'penthouse', 3, 2, 6,
    ARRAY['WiFi','AC','Couple-friendly','City Center','Parking'],
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'a0000000-0000-0000-0000-000000000007',
    'Kuakata Beachfront Cabin',
    'Experience both sunrise and sunset from this rustic beachfront cabin on the shores of Kuakata. The perfect honeymoon destination.',
    1800.00,
    'Kuakata Sea Beach, Patuakhali', 'Kuakata', 'Bangladesh',
    21.8167, 90.1167,
    ARRAY['https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?q=80&w=800',
          'https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=800'],
    'cabin', 1, 1, 2,
    ARRAY['Non-AC','Couple-friendly','Near sea','Balcony'],
    '00000000-0000-0000-0000-000000000003'
  ),
  (
    'a0000000-0000-0000-0000-000000000008',
    'Sonargaon Heritage House',
    'A beautifully restored heritage property near the ancient capital of Panam City. High ceilings, classical architecture, and a lush private garden.',
    7000.00,
    'Panam City, Sonargaon', 'Narayanganj', 'Bangladesh',
    23.6425, 90.5985,
    ARRAY['https://images.unsplash.com/photo-1548484352-ea579e5233a8?q=80&w=800',
          'https://images.unsplash.com/photo-1519181245277-cffeb6f9c28c?w=800'],
    'house', 4, 3, 8,
    ARRAY['WiFi','AC','Family-friendly','City Center'],
    '00000000-0000-0000-0000-000000000002'
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STEP 4 — BOOKINGS
-- ============================================================
INSERT INTO public.bookings
  (id, user_id, listing_id, checkin, checkout, guests_count, total_price, status, notes)
VALUES
  (
    'b0000000-0000-0000-0000-000000000001',
    '00000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001',
    '2026-04-10', '2026-04-17', 4, 1540.00, 'confirmed',
    'Celebrating a family reunion. Please have extra towels ready.'
  ),
  (
    'b0000000-0000-0000-0000-000000000002',
    '00000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000004',
    '2026-05-01', '2026-05-08', 2, 1225.00, 'confirmed',
    NULL
  ),
  (
    'b0000000-0000-0000-0000-000000000003',
    '00000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000003',
    '2026-04-20', '2026-04-25', 2, 700.00, 'pending',
    'Late check-in around 11pm if possible.'
  ),
  (
    'b0000000-0000-0000-0000-000000000004',
    '00000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002',
    '2026-05-15', '2026-05-22', 1, 455.00, 'completed',
    NULL
  ),
  (
    'b0000000-0000-0000-0000-000000000005',
    '00000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000006',
    '2026-06-01', '2026-06-07', 3, 1860.00, 'confirmed',
    NULL
  ),
  (
    'b0000000-0000-0000-0000-000000000006',
    '00000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000007',
    '2026-06-10', '2026-06-13', 1, 285.00, 'cancelled',
    'Had to cancel due to a work conflict.'
  )
ON CONFLICT (id) DO NOTHING;


-- ============================================================
-- STEP 5 — REVIEWS
-- ============================================================
INSERT INTO public.reviews (id, rating, comment, user_id, listing_id)
VALUES
  (
    'c0000000-0000-0000-0000-000000000001', 5,
    'Absolutely magical stay. The villa exceeded every expectation — the private pool, the views, the staff. Marco is an exceptional host. We will definitely be back!',
    '00000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000001'
  ),
  (
    'c0000000-0000-0000-0000-000000000002', 5,
    'A genuinely peaceful escape. The rice field views from the terrace every morning were breathtaking. Breakfast was delicious and Marco was incredibly helpful with local tips.',
    '00000000-0000-0000-0000-000000000004',
    'a0000000-0000-0000-0000-000000000002'
  ),
  (
    'c0000000-0000-0000-0000-000000000003', 4,
    'Beautiful apartment in a perfect location. The Marais is such a great neighbourhood. The only minor issue was street noise in the mornings, but everything else was wonderful.',
    '00000000-0000-0000-0000-000000000006',
    'a0000000-0000-0000-0000-000000000003'
  ),
  (
    'c0000000-0000-0000-0000-000000000004', 5,
    'The Tokyo loft is something else — sleek, beautiful, and the rooftop view of Shibuya at night is unforgettable. Aiko''s communication was prompt and professional.',
    '00000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000004'
  ),
  (
    'c0000000-0000-0000-0000-000000000005', 5,
    'The machiya was a once-in-a-lifetime experience. Sleeping on tatami, practising tea ceremony in the morning, cycling through Gion — it doesn''t get more immersive than this.',
    '00000000-0000-0000-0000-000000000005',
    'a0000000-0000-0000-0000-000000000008'
  )
ON CONFLICT (id) DO NOTHING;


-- ── Re-enable RLS ────────────────────────────────────────────
ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews   ENABLE ROW LEVEL SECURITY;


-- ── Verify ───────────────────────────────────────────────────
SELECT 'auth.users' AS tbl, COUNT(*) AS rows FROM auth.users    WHERE id::text LIKE '00000000-0000-0000-0000-00000000000%'
UNION ALL
SELECT 'public.users',  COUNT(*) FROM public.users
UNION ALL
SELECT 'listings',      COUNT(*) FROM public.listings
UNION ALL
SELECT 'bookings',      COUNT(*) FROM public.bookings
UNION ALL
SELECT 'reviews',       COUNT(*) FROM public.reviews;
