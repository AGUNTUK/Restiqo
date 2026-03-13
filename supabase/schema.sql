-- Restiqo Database Schema - Production Grade
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- ENUMS
-- ============================================
CREATE TYPE user_role AS ENUM ('guest', 'host', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'refunded');
CREATE TYPE property_type AS ENUM ('apartment', 'hotel', 'tour');

-- ============================================
-- USERS TABLE (extends Supabase Auth)
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  address TEXT,
  bio TEXT,
  role user_role NOT NULL DEFAULT 'guest',
  is_verified BOOLEAN DEFAULT false,
  host_requested_at TIMESTAMP WITH TIME ZONE,
  host_approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROPERTIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  property_type property_type NOT NULL,
  category TEXT NOT NULL,
  price_per_night DECIMAL(10, 2) NOT NULL DEFAULT 0,
  price_per_tour DECIMAL(10, 2),
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'Bangladesh',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  bedrooms INTEGER,
  bathrooms INTEGER,
  max_guests INTEGER NOT NULL DEFAULT 1,
  rating DECIMAL(3, 2) NOT NULL DEFAULT 0,
  review_count INTEGER NOT NULL DEFAULT 0,
  is_available BOOLEAN NOT NULL DEFAULT true,
  is_approved BOOLEAN NOT NULL DEFAULT false,
  amenities TEXT[] DEFAULT '{}',
  images TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROPERTY IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.property_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  caption TEXT,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TOURS TABLE (extends properties for tour-specific data)
-- ============================================
CREATE TABLE IF NOT EXISTS public.tours (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  duration TEXT NOT NULL,
  included TEXT[] DEFAULT '{}',
  excluded TEXT[] DEFAULT '{}',
  itinerary JSONB,
  meeting_point TEXT NOT NULL,
  start_time TEXT NOT NULL,
  max_participants INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- AMENITIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.amenities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- BOOKINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  guest_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  guests INTEGER NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status booking_status NOT NULL DEFAULT 'pending',
  payment_status payment_status NOT NULL DEFAULT 'pending',
  special_requests TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- ============================================
-- WISHLISTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.wishlists (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);

-- ============================================
-- HOST EARNINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.host_earnings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  platform_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  net_amount DECIMAL(10, 2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- PROPERTY AVAILABILITY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.property_availability (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  is_available BOOLEAN DEFAULT true,
  price_override DECIMAL(10, 2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, date)
);

-- ============================================
-- ADMIN LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  admin_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR BETTER PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

CREATE INDEX IF NOT EXISTS idx_properties_host_id ON public.properties(host_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_is_approved ON public.properties(is_approved);
CREATE INDEX IF NOT EXISTS idx_properties_is_available ON public.properties(is_available);
CREATE INDEX IF NOT EXISTS idx_properties_rating ON public.properties(rating DESC);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price_per_night);

CREATE INDEX IF NOT EXISTS idx_bookings_property_id ON public.bookings(property_id);
CREATE INDEX IF NOT EXISTS idx_bookings_guest_id ON public.bookings(guest_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON public.bookings(check_in, check_out);

CREATE INDEX IF NOT EXISTS idx_reviews_property_id ON public.reviews(property_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON public.reviews(rating DESC);

CREATE INDEX IF NOT EXISTS idx_wishlists_user_id ON public.wishlists(user_id);
CREATE INDEX IF NOT EXISTS idx_wishlists_property_id ON public.wishlists(property_id);

CREATE INDEX IF NOT EXISTS idx_host_earnings_host_id ON public.host_earnings(host_id);
CREATE INDEX IF NOT EXISTS idx_property_availability_property_id ON public.property_availability(property_id);
CREATE INDEX IF NOT EXISTS idx_property_availability_date ON public.property_availability(date);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wishlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to check if user is host
CREATE OR REPLACE FUNCTION is_host()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role IN ('host', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role INTO user_role
  FROM public.users
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, 'guest');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- ============================================
-- RLS POLICIES FOR USERS
-- ============================================

-- Anyone can view user profiles (limited info)
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

-- Users can only insert their own profile
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "Admins can update any profile" ON public.users
  FOR UPDATE USING (is_admin());

-- Admins can delete users
CREATE POLICY "Admins can delete users" ON public.users
  FOR DELETE USING (is_admin());

-- ============================================
-- RLS POLICIES FOR PROPERTIES
-- ============================================

-- Anyone can view approved properties
CREATE POLICY "Anyone can view approved properties" ON public.properties
  FOR SELECT USING (is_approved = true OR auth.uid() = host_id OR is_admin());

-- Hosts can create properties
CREATE POLICY "Hosts can insert properties" ON public.properties
  FOR INSERT WITH CHECK (auth.uid() = host_id AND is_host());

-- Hosts can update their own properties
CREATE POLICY "Hosts can update own properties" ON public.properties
  FOR UPDATE USING (auth.uid() = host_id);

-- Admins can update any property
CREATE POLICY "Admins can update any property" ON public.properties
  FOR UPDATE USING (is_admin());

-- Hosts can delete their own properties
CREATE POLICY "Hosts can delete own properties" ON public.properties
  FOR DELETE USING (auth.uid() = host_id);

-- Admins can delete any property
CREATE POLICY "Admins can delete any property" ON public.properties
  FOR DELETE USING (is_admin());

-- ============================================
-- RLS POLICIES FOR BOOKINGS
-- ============================================

-- Guests can view their own bookings
CREATE POLICY "Guests can view own bookings" ON public.bookings
  FOR SELECT USING (auth.uid() = guest_id);

-- Hosts can view bookings for their properties
CREATE POLICY "Hosts can view property bookings" ON public.bookings
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND host_id = auth.uid()
    )
  );

-- Admins can view all bookings
CREATE POLICY "Admins can view all bookings" ON public.bookings
  FOR SELECT USING (is_admin());

-- Any authenticated user can create bookings
CREATE POLICY "Users can create bookings" ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = guest_id);

-- Guests can update their own bookings (limited)
CREATE POLICY "Guests can update own bookings" ON public.bookings
  FOR UPDATE USING (auth.uid() = guest_id);

-- Hosts can update bookings for their properties
CREATE POLICY "Hosts can update property bookings" ON public.bookings
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND host_id = auth.uid()
    )
  );

-- Admins can update any booking
CREATE POLICY "Admins can update any booking" ON public.bookings
  FOR UPDATE USING (is_admin());

-- ============================================
-- RLS POLICIES FOR REVIEWS
-- ============================================

-- Anyone can view approved reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT USING (is_approved = true OR auth.uid() = user_id OR is_admin());

-- Users can create reviews for their bookings
CREATE POLICY "Users can create reviews" ON public.reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews" ON public.reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Admins can update any review
CREATE POLICY "Admins can manage reviews" ON public.reviews
  FOR UPDATE USING (is_admin());

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews" ON public.reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Admins can delete any review
CREATE POLICY "Admins can delete any review" ON public.reviews
  FOR DELETE USING (is_admin());

-- ============================================
-- RLS POLICIES FOR WISHLISTS
-- ============================================

-- Users can only view their own wishlist
CREATE POLICY "Users can view own wishlist" ON public.wishlists
  FOR SELECT USING (auth.uid() = user_id);

-- Users can add to their wishlist
CREATE POLICY "Users can add to wishlist" ON public.wishlists
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can remove from their wishlist
CREATE POLICY "Users can remove from wishlist" ON public.wishlists
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- RLS POLICIES FOR HOST EARNINGS
-- ============================================

-- Hosts can view their own earnings
CREATE POLICY "Hosts can view own earnings" ON public.host_earnings
  FOR SELECT USING (auth.uid() = host_id);

-- Admins can view all earnings
CREATE POLICY "Admins can view all earnings" ON public.host_earnings
  FOR SELECT USING (is_admin());

-- System can insert earnings (via trigger/function)
CREATE POLICY "System can insert earnings" ON public.host_earnings
  FOR INSERT WITH CHECK (true);

-- Admins can update earnings
CREATE POLICY "Admins can update earnings" ON public.host_earnings
  FOR UPDATE USING (is_admin());

-- ============================================
-- RLS POLICIES FOR PROPERTY AVAILABILITY
-- ============================================

-- Anyone can view availability
CREATE POLICY "Anyone can view availability" ON public.property_availability
  FOR SELECT USING (true);

-- Hosts can manage their property availability
CREATE POLICY "Hosts can manage availability" ON public.property_availability
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND host_id = auth.uid()
    )
  );

-- Admins can manage all availability
CREATE POLICY "Admins can manage all availability" ON public.property_availability
  FOR ALL USING (is_admin());

-- ============================================
-- RLS POLICIES FOR ADMIN LOGS
-- ============================================

-- Only admins can view logs
CREATE POLICY "Admins can view logs" ON public.admin_logs
  FOR SELECT USING (is_admin());

-- Only admins can insert logs
CREATE POLICY "Admins can insert logs" ON public.admin_logs
  FOR INSERT WITH CHECK (is_admin());

-- ============================================
-- RLS POLICIES FOR PROPERTY IMAGES
-- ============================================

-- Anyone can view property images
CREATE POLICY "Anyone can view property images" ON public.property_images
  FOR SELECT USING (true);

-- Hosts can manage their property images
CREATE POLICY "Hosts can manage property images" ON public.property_images
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND host_id = auth.uid()
    )
  );

-- Admins can manage all property images
CREATE POLICY "Admins can manage all images" ON public.property_images
  FOR ALL USING (is_admin());

-- ============================================
-- RLS POLICIES FOR TOURS
-- ============================================

-- Anyone can view tours
CREATE POLICY "Anyone can view tours" ON public.tours
  FOR SELECT USING (true);

-- Hosts can manage their tours
CREATE POLICY "Hosts can manage tours" ON public.tours
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.properties
      WHERE id = property_id AND host_id = auth.uid()
    )
  );

-- Admins can manage all tours
CREATE POLICY "Admins can manage all tours" ON public.tours
  FOR ALL USING (is_admin());

-- ============================================
-- RLS POLICIES FOR AMENITIES
-- ============================================

-- Anyone can view amenities
CREATE POLICY "Anyone can view amenities" ON public.amenities
  FOR SELECT USING (true);

-- Admins can manage amenities
CREATE POLICY "Admins can manage amenities" ON public.amenities
  FOR ALL USING (is_admin());

-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update property rating after review
CREATE OR REPLACE FUNCTION update_property_rating()
RETURNS TRIGGER AS $$
DECLARE
  avg_rating DECIMAL(3, 2);
  review_count INTEGER;
BEGIN
  SELECT AVG(rating), COUNT(*) INTO avg_rating, review_count
  FROM public.reviews
  WHERE property_id = COALESCE(NEW.property_id, OLD.property_id) AND is_approved = true;

  UPDATE public.properties
  SET rating = COALESCE(avg_rating, 0),
      review_count = COALESCE(review_count, 0)
  WHERE id = COALESCE(NEW.property_id, OLD.property_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for updating property rating
CREATE TRIGGER update_rating_after_review
  AFTER INSERT OR UPDATE OR DELETE ON public.reviews
  FOR EACH ROW EXECUTE FUNCTION update_property_rating();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN (NEW.raw_user_meta_data->>'role') IN ('guest', 'host', 'admin') THEN (NEW.raw_user_meta_data->>'role')::user_role
      ELSE 'guest'::user_role
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    avatar_url = EXCLUDED.avatar_url,
    updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to create host earnings when booking is confirmed
CREATE OR REPLACE FUNCTION create_host_earning()
RETURNS TRIGGER AS $$
DECLARE
  host_id UUID;
  platform_fee DECIMAL(10, 2);
BEGIN
  IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
    -- Get host_id from property
    SELECT host_id INTO host_id
    FROM public.properties
    WHERE id = NEW.property_id;
    
    -- Calculate platform fee (10%)
    platform_fee := NEW.total_price * 0.10;
    
    -- Insert host earning
    INSERT INTO public.host_earnings (host_id, booking_id, amount, platform_fee, net_amount, status)
    VALUES (host_id, NEW.id, NEW.total_price, platform_fee, NEW.total_price - platform_fee, 'paid');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for host earnings
DROP TRIGGER IF EXISTS on_booking_confirmed ON public.bookings;
CREATE TRIGGER on_booking_confirmed
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION create_host_earning();

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_logs (admin_id, action, entity_type, entity_id, details)
  VALUES (
    auth.uid(),
    TG_OP,
    TG_TABLE_NAME::TEXT,
    COALESCE(NEW.id, OLD.id),
    jsonb_build_object('old', row_to_json(OLD), 'new', row_to_json(NEW))
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- INSERT DEFAULT AMENITIES
-- ============================================
INSERT INTO public.amenities (name, icon, category) VALUES
  ('WiFi', 'Wifi', 'essentials'),
  ('Air Conditioning', 'Wind', 'essentials'),
  ('Kitchen', 'Coffee', 'essentials'),
  ('Parking', 'Car', 'essentials'),
  ('Washer', 'Shirt', 'essentials'),
  ('TV', 'Tv', 'entertainment'),
  ('Pool', 'Waves', 'recreation'),
  ('Gym', 'Dumbbell', 'recreation'),
  ('Spa', 'Sparkles', 'recreation'),
  ('Restaurant', 'UtensilsCrossed', 'dining'),
  ('Room Service', 'Bell', 'dining'),
  ('Beach Access', 'Umbrella', 'outdoor'),
  ('Garden', 'Trees', 'outdoor'),
  ('Balcony', 'DoorOpen', 'outdoor'),
  ('Security', 'Shield', 'safety'),
  ('Elevator', 'ArrowUp', 'building'),
  ('Hot Water', 'Flame', 'essentials'),
  ('Refrigerator', 'Refrigerator', 'essentials'),
  ('Microwave', 'Microwave', 'essentials'),
  ('Hair Dryer', 'Wind', 'essentials'),
  ('Iron', 'Iron', 'essentials'),
  ('Workspace', 'Monitor', 'essentials'),
  ('First Aid', 'HeartPulse', 'safety'),
  ('Fire Extinguisher', 'Flame', 'safety'),
  ('Pet Friendly', 'Dog', 'features'),
  ('Smoking Allowed', 'Cigarette', 'features'),
  ('Events Allowed', 'Calendar', 'features')
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- STORAGE BUCKET FOR PROPERTY IMAGES
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('property-images', 'property-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for property images
CREATE POLICY "Anyone can view property images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'property-images');

CREATE POLICY "Authenticated users can upload property images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'property-images' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own property images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'property-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- STORAGE BUCKET FOR USER AVATARS
-- ============================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view user avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'user-avatars');

CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'user-avatars' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'user-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
