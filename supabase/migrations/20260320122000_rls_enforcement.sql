-- 1. Enable RLS on all core tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- 2. USERS Table Policies
-- Users can only read their own profile
CREATE POLICY "Users can view their own profile" ON public.users
  FOR SELECT USING (id = auth.uid());

-- Users can update their own data only
CREATE POLICY "Users can update their own profile" ON public.users
  FOR UPDATE USING (id = auth.uid());

-- Admins can do anything
CREATE POLICY "Admins have full access to users" ON public.users
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 3. LISTINGS Table Policies
-- Anyone can read listings (public)
CREATE POLICY "Listings are public to read" ON public.listings
  FOR SELECT USING (true);

-- Only the host (owner) can insert/update/delete their listings
CREATE POLICY "Hosts can insert listings" ON public.listings
  FOR INSERT WITH CHECK (host_id = auth.uid());
CREATE POLICY "Hosts can update their own listings" ON public.listings
  FOR UPDATE USING (host_id = auth.uid());
CREATE POLICY "Hosts can delete their own listings" ON public.listings
  FOR DELETE USING (host_id = auth.uid());

-- 4. BOOKINGS Table Policies
-- Users can create bookings
CREATE POLICY "Users can insert bookings" ON public.bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can only see their own bookings. Hosts can see bookings for their listings.
CREATE POLICY "Users and Hosts can view bookings" ON public.bookings
  FOR SELECT USING (
    user_id = auth.uid() OR 
    listing_id IN (SELECT id FROM public.listings WHERE host_id = auth.uid())
  );

-- Users and Hosts can update bookings (e.g. status changes / cancellations)
CREATE POLICY "Users and Hosts can update bookings" ON public.bookings
  FOR UPDATE USING (
    user_id = auth.uid() OR 
    listing_id IN (SELECT id FROM public.listings WHERE host_id = auth.uid())
  );

-- 5. REVIEWS Table Policies
CREATE POLICY "Reviews are public to read" ON public.reviews
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own reviews" ON public.reviews
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Users can delete their own reviews" ON public.reviews
  FOR DELETE USING (user_id = auth.uid());

-- 6. TRANSACTIONS Table Policies
-- Users can see their own payments. Hosts can see their earnings transactions.
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (user_id = auth.uid());

-- Allow insertions by users (for payments/refunds made by themselves)
CREATE POLICY "Users can insert own transactions" ON public.transactions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- No one can modify transactions except system/admin
CREATE POLICY "Admins have full access to transactions" ON public.transactions
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- 7. PAYOUTS Table Policies
-- Hosts can see their own payouts
CREATE POLICY "Hosts can view own payouts" ON public.payouts
  FOR SELECT USING (host_id = auth.uid());

-- Only admin can update/insert payout status
CREATE POLICY "Admins have full access to payouts" ON public.payouts
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
