-- ============================================================
-- Feel Real Demo Product — Luxury Villa in Sylhet
-- ============================================================

DO $$
DECLARE
  v_host_id UUID;
  v_listing_id UUID := '00000000-0000-0000-0000-000000000002'; -- Distinct fixed UUID
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
    RAISE NOTICE 'No users found. Please create a user account first.';
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
    status,
    slug
  )
  VALUES (
    v_listing_id,
    v_host_id,
    'Feel Real Luxury Villa — Tea Garden View',
    E'Experience the ultimate luxury in the heart of Sylhet''s famous tea gardens.\n\n'
    'Our Feel Real Luxury Villa offers a unique blend of traditional Sylheti architecture and modern high-end amenities. '
    'Wake up to the serene views of emerald tea gardens, enjoy a dip in your private infinity pool, or relax in the spacious '
    'open-air lounge.\n\n'
    'Features:\n'
    '- Private Infinity Pool\n'
    '- Gourmet Kitchen with Private Chef available\n'
    '- Panoramic Tea Garden views from every room\n'
    '- 24/7 Concierge service\n\n'
    'Perfect for families or groups seeking a premium and authentic Sylheti experience.',
    25000.00,
    'Sreemangal, Sylhet 3210',
    'Sylhet',
    'Bangladesh',
    24.3065,
    91.7295,
    'villa',
    4,
    4,
    8,
    ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'TV', 'Washing Machine', 'Parking', 'Private Pool', 'Chef Service', 'Security', 'Garden'],
    ARRAY[
      'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=1200&q=80',
      'https://images.unsplash.com/photo-1613490491584-38b243085c54?w=1200&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=80',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80'
    ],
    TRUE,
    'approved',
    'feel-real-luxury-villa-sylhet'
  )
  ON CONFLICT (id) DO UPDATE SET
    title       = EXCLUDED.title,
    description = EXCLUDED.description,
    price       = EXCLUDED.price,
    status      = 'approved',
    is_available = TRUE,
    slug        = EXCLUDED.slug;

  RAISE NOTICE 'Feel Real demo listing inserted/updated successfully (id: %, host: %)', v_listing_id, v_host_id;
END $$;
