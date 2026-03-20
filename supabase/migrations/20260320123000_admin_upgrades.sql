-- 1. Add new tracking columns for Admin Operation Actions
ALTER TABLE public.listings ADD COLUMN IF NOT EXISTS status TEXT CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'approved';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 2. Expand RLS strictness allowing full Administration overrides cleanly
-- Admins get universal bypass for modifications across remaining tables
CREATE POLICY "Admins have full access to listings" ON public.listings
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins have full access to bookings" ON public.bookings
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admins have full access to reviews" ON public.reviews
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
