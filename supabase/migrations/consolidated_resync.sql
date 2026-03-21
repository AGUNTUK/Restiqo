-- ============================================================
-- CONSOLIDATED RE-SYNC MIGRATION
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Storage Bucket
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true)
on conflict (id) do nothing;

-- Allow public read access to the 'listings' bucket
DROP POLICY IF EXISTS "Public Access to listings" on storage.objects;
create policy "Public Access to listings"
on storage.objects for select
to public
using ( bucket_id = 'listings' );

-- Allow authenticated users to upload images to the 'listings' bucket
DROP POLICY IF EXISTS "Authenticated users can upload listing images" on storage.objects;
create policy "Authenticated users can upload listing images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'listings' );

-- 2. Commission System (Bookings Table)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS total_amount NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS commission_amount NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS host_earnings NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS payout_status TEXT DEFAULT 'pending';

UPDATE bookings SET
  total_amount = total_price,
  commission_amount = total_price * 0.10,
  host_earnings = total_price * 0.90
WHERE total_amount IS NULL;

-- 3. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('payment', 'payout', 'commission')),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own transactions" ON transactions;
CREATE POLICY "Users can view their own transactions" ON transactions FOR SELECT USING (user_id = auth.uid());

-- 4. Payouts Table
CREATE TABLE IF NOT EXISTS payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed')),
  method TEXT CHECK (method IN ('bkash', 'nagad', 'bank')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE payouts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Hosts can view their own payouts" ON payouts;
CREATE POLICY "Hosts can view their own payouts" ON payouts FOR SELECT USING (host_id = auth.uid());
DROP POLICY IF EXISTS "Hosts can insert their own payouts" ON payouts;
CREATE POLICY "Hosts can insert their own payouts" ON payouts FOR INSERT WITH CHECK (host_id = auth.uid());

-- 5. Payout Methods Table
CREATE TABLE IF NOT EXISTS payout_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT CHECK (provider IN ('bKash', 'Nagad', 'Bank')),
  account_details TEXT NOT NULL,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
ALTER TABLE payout_methods ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Hosts can view own payout methods" ON payout_methods;
CREATE POLICY "Hosts can view own payout methods" ON payout_methods FOR SELECT USING (host_id = auth.uid());

-- 6. Admin Upgrades (Listings & Users)
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

DROP POLICY IF EXISTS "Admins have full access to listings" ON public.listings;
CREATE POLICY "Admins have full access to listings" ON public.listings USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')) WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 7. Slug Support
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

CREATE OR REPLACE FUNCTION public.slugify(title TEXT) RETURNS TEXT AS $$
DECLARE l_slug TEXT;
BEGIN
  l_slug := lower(title);
  l_slug := regexp_replace(l_slug, '[^a-z0-9]+', '-', 'g');
  l_slug := regexp_replace(l_slug, '^-+|-+$', '', 'g');
  RETURN l_slug;
END;
$$ LANGUAGE plpgsql;

UPDATE public.listings SET slug = slugify(title) || '-' || substr(gen_random_uuid()::text, 1, 4) WHERE slug IS NULL;

CREATE OR REPLACE FUNCTION public.handle_listing_slug() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := slugify(NEW.title) || '-' || substr(gen_random_uuid()::text, 1, 4);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_listing_slug ON public.listings;
CREATE TRIGGER tr_listing_slug BEFORE INSERT ON public.listings FOR EACH ROW EXECUTE FUNCTION public.handle_listing_slug();

-- 8. Final View Standard
DROP VIEW IF EXISTS public.listings_with_stats CASCADE;
CREATE OR REPLACE VIEW public.listings_with_stats AS
SELECT
  l.*,
  u.name                        AS host_name,
  u.avatar_url                  AS host_avatar,
  COALESCE(AVG(r.rating), 0)    AS avg_rating,
  COUNT(r.id)                   AS review_count
FROM public.listings l
LEFT JOIN public.users    u ON u.id = l.host_id
LEFT JOIN public.reviews  r ON r.listing_id = l.id
GROUP BY l.id, u.name, u.avatar_url;

-- 9. Blogs Table
CREATE TABLE IF NOT EXISTS public.blogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  content TEXT NOT NULL,
  cover_image TEXT,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Blogs are publicly viewable" ON public.blogs;
CREATE POLICY "Blogs are publicly viewable" ON public.blogs FOR SELECT USING (true);

-- 10. Feel Real Demo Product
DO $$
DECLARE
  v_host_id UUID;
  v_listing_id UUID := '00000000-0000-0000-0000-000000000002';
BEGIN
  SELECT id INTO v_host_id FROM public.users WHERE role = 'admin' ORDER BY created_at ASC LIMIT 1;
  IF v_host_id IS NULL THEN SELECT id INTO v_host_id FROM public.users ORDER BY created_at ASC LIMIT 1; END IF;
  
  IF v_host_id IS NOT NULL THEN
    INSERT INTO public.listings (id, host_id, title, description, price, location, city, country, latitude, longitude, type, beds, baths, max_guests, amenities, images, is_available, status, slug)
    VALUES (v_listing_id, v_host_id, 'Feel Real Luxury Villa — Tea Garden View', 'Experience the ultimate luxury in Sreemangal...', 25000, 'Sreemangal, Sylhet 3210', 'Sylhet', 'Bangladesh', 24.3065, 91.7295, 'villa', 4, 4, 8, ARRAY['WiFi', 'Air Conditioning', 'Kitchen', 'Private Pool'], ARRAY['https://images.unsplash.com/photo-1580587771525-78b9dba3b914'], TRUE, 'approved', 'feel-real-luxury-villa-sylhet')
    ON CONFLICT (id) DO UPDATE SET status = 'approved', is_available = TRUE, slug = EXCLUDED.slug;
  END IF;
END $$;
