-- ============================================================
-- Restiqa — Travel Marketplace Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram search on listings

-- ── Enum Types ──────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('guest', 'host', 'admin');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE listing_type AS ENUM ('apartment', 'villa', 'studio', 'penthouse', 'house', 'cabin', 'cottage');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


-- ============================================================
-- 1. USERS
--    Extends Supabase auth.users with public profile data.
--    Automatically populated via the handle_new_user trigger.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id          UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT,
  email       TEXT        UNIQUE NOT NULL,
  role        user_role   NOT NULL DEFAULT 'guest',
  avatar_url  TEXT,
  bio         TEXT,
  phone       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.users          IS 'Public user profiles, linked 1-to-1 with auth.users';
COMMENT ON COLUMN public.users.role     IS 'guest = can book, host = can list + book, admin = full access';

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS users_updated_at ON public.users;
CREATE TRIGGER users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile row when a new auth user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'guest'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 2. LISTINGS
--    Properties that hosts make available for booking.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.listings (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  title        TEXT          NOT NULL,
  description  TEXT,
  price        NUMERIC(10,2) NOT NULL CHECK (price > 0),
  location     TEXT          NOT NULL,
  city         TEXT          NOT NULL,
  country      TEXT          NOT NULL DEFAULT 'Indonesia',
  latitude     DOUBLE PRECISION,
  longitude    DOUBLE PRECISION,
  images       TEXT[]        NOT NULL DEFAULT '{}',
  type         listing_type  NOT NULL DEFAULT 'apartment',
  beds         INTEGER       NOT NULL DEFAULT 1 CHECK (beds > 0),
  baths        INTEGER       NOT NULL DEFAULT 1 CHECK (baths > 0),
  max_guests   INTEGER       NOT NULL DEFAULT 2 CHECK (max_guests > 0),
  amenities    TEXT[]        NOT NULL DEFAULT '{}',
  is_available BOOLEAN       NOT NULL DEFAULT TRUE,
  host_id      UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.listings             IS 'Property listings available for booking';
COMMENT ON COLUMN public.listings.images      IS 'Array of public image URLs (Supabase Storage or external CDN)';
COMMENT ON COLUMN public.listings.amenities   IS 'e.g. ["WiFi", "Pool", "Kitchen", "Parking"]';
COMMENT ON COLUMN public.listings.host_id     IS 'FK → users.id — the host who owns this listing';

DROP TRIGGER IF EXISTS listings_updated_at ON public.listings;
CREATE TRIGGER listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 3. BOOKINGS
--    A booking connects a guest (user) to a listing for a date range.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id              UUID           PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID           NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  listing_id      UUID           NOT NULL REFERENCES public.listings(id)  ON DELETE CASCADE,
  checkin         DATE           NOT NULL,
  checkout        DATE           NOT NULL,
  guests_count    INTEGER        NOT NULL DEFAULT 1 CHECK (guests_count > 0),
  total_price     NUMERIC(10,2)  NOT NULL CHECK (total_price >= 0),
  status          booking_status NOT NULL DEFAULT 'pending',
  notes           TEXT,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  -- Business rules
  CONSTRAINT checkin_before_checkout  CHECK (checkin < checkout),
  CONSTRAINT checkout_in_future       CHECK (checkout > CURRENT_DATE - INTERVAL '1 day')
);

COMMENT ON TABLE  public.bookings              IS 'Booking records linking guests to listings';
COMMENT ON COLUMN public.bookings.total_price  IS 'Pre-calculated at booking time: price/night × nights';
COMMENT ON COLUMN public.bookings.status       IS 'pending → confirmed → completed | pending → cancelled';

DROP TRIGGER IF EXISTS bookings_updated_at ON public.bookings;
CREATE TRIGGER bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- 4. REVIEWS
--    Guests can review a listing after a completed booking.
--    One review per user per listing.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  rating      SMALLINT    NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment     TEXT,
  user_id     UUID        NOT NULL REFERENCES public.users(id)    ON DELETE CASCADE,
  listing_id  UUID        NOT NULL REFERENCES public.listings(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  UNIQUE (user_id, listing_id)   -- one review per guest per property
);

COMMENT ON TABLE  public.reviews         IS 'Guest reviews for listings (1 per user per listing)';
COMMENT ON COLUMN public.reviews.rating  IS '1 (poor) → 5 (excellent)';

DROP TRIGGER IF EXISTS reviews_updated_at ON public.reviews;
CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ============================================================
-- INDEXES — optimise common query patterns
-- ============================================================

-- Listings
CREATE INDEX IF NOT EXISTS idx_listings_host_id      ON public.listings (host_id);
CREATE INDEX IF NOT EXISTS idx_listings_city         ON public.listings (city);
CREATE INDEX IF NOT EXISTS idx_listings_type         ON public.listings (type);
CREATE INDEX IF NOT EXISTS idx_listings_price        ON public.listings (price);
CREATE INDEX IF NOT EXISTS idx_listings_available    ON public.listings (is_available) WHERE is_available = TRUE;
CREATE INDEX IF NOT EXISTS idx_listings_title_trgm   ON public.listings USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_listings_location_trgm ON public.listings USING GIN (location gin_trgm_ops);

-- Bookings
CREATE INDEX IF NOT EXISTS idx_bookings_user_id      ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_listing_id   ON public.bookings (listing_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status       ON public.bookings (status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates        ON public.bookings (listing_id, checkin, checkout);

-- Reviews
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id   ON public.reviews (listing_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id      ON public.reviews (user_id);


-- ============================================================
-- VIEWS — convenience aggregates
-- ============================================================

-- Listings with average rating and review count
CREATE OR REPLACE VIEW public.listings_with_stats AS
SELECT
  l.*,
  u.name                        AS host_name,
  u.avatar_url                  AS host_avatar,
  COALESCE(AVG(r.rating), 0)   AS avg_rating,
  COUNT(r.id)                   AS review_count
FROM public.listings l
LEFT JOIN public.users    u ON u.id = l.host_id
LEFT JOIN public.reviews  r ON r.listing_id = l.id
GROUP BY l.id, u.name, u.avatar_url;

COMMENT ON VIEW public.listings_with_stats IS 'Listings joined with host info and computed rating stats';


-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE public.users     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews   ENABLE ROW LEVEL SECURITY;

-- ── users ────────────────────────────────────────────────────
-- Anyone can read public profiles
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.users FOR SELECT USING (true);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- The trigger (service role) inserts automatically; no user INSERT policy needed.

-- ── listings ─────────────────────────────────────────────────
-- Everyone can view available listings
CREATE POLICY "Listings are publicly viewable"
  ON public.listings FOR SELECT USING (true);

-- Only authenticated hosts/admins can create listings
CREATE POLICY "Hosts can create listings"
  ON public.listings FOR INSERT
  WITH CHECK (
    auth.uid() = host_id AND
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('host', 'admin')
    )
  );

-- Hosts can only update their own listings
CREATE POLICY "Hosts can update own listings"
  ON public.listings FOR UPDATE
  USING (auth.uid() = host_id);

-- Hosts can only delete their own listings
CREATE POLICY "Hosts can delete own listings"
  ON public.listings FOR DELETE
  USING (auth.uid() = host_id);

-- ── bookings ─────────────────────────────────────────────────
-- Guests see their own bookings; hosts see bookings for their listings
CREATE POLICY "Users see own bookings"
  ON public.bookings FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND host_id = auth.uid()
    )
  );

-- Authenticated users can create bookings for themselves
CREATE POLICY "Authenticated users can book"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can cancel their own bookings; hosts can confirm/complete
CREATE POLICY "Users can update own bookings"
  ON public.bookings FOR UPDATE
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE id = listing_id AND host_id = auth.uid()
    )
  );

-- ── reviews ──────────────────────────────────────────────────
-- Reviews are publicly readable
CREATE POLICY "Reviews are publicly viewable"
  ON public.reviews FOR SELECT USING (true);

-- Authenticated users can post reviews
CREATE POLICY "Authenticated users can review"
  ON public.reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON public.reviews FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON public.reviews FOR DELETE
  USING (auth.uid() = user_id);
