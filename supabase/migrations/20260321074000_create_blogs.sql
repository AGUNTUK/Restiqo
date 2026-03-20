-- ============================================================
-- SEO Blog System
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Create blogs table
CREATE TABLE IF NOT EXISTS public.blogs (
  id           UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         TEXT          NOT NULL UNIQUE,
  title        TEXT          NOT NULL,
  excerpt      TEXT          NOT NULL,
  content      TEXT          NOT NULL, -- Markdown content
  cover_image  TEXT,
  author_id    UUID          NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 2. Index for slug lookup
CREATE INDEX IF NOT EXISTS idx_blogs_slug ON public.blogs (slug);

-- 3. RLS Policies
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Blogs are publicly viewable" 
  ON public.blogs FOR SELECT USING (true);

CREATE POLICY "Admins can manage blogs" 
  ON public.blogs FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Sample Post: Top 10 Hotels in Cox's Bazar
DO $$
DECLARE
  v_author_id UUID;
BEGIN
  -- Pick the first admin or any user as author
  SELECT id INTO v_author_id FROM public.users WHERE role = 'admin' LIMIT 1;
  IF v_author_id IS NULL THEN
    SELECT id INTO v_author_id FROM public.users LIMIT 1;
  END IF;

  IF v_author_id IS NOT NULL THEN
    INSERT INTO public.blogs (slug, title, excerpt, content, cover_image, author_id)
    VALUES (
      'top-10-hotels-coxs-bazar',
      'Top 10 Hotels and Resorts in Cox’s Bazar for 2026',
      'Planning a trip to the world’s longest sea beach? Discover the best beachfront hotels and luxury resorts in Cox’s Bazar for an unforgettable stay.',
      E'# Top 10 Hotels and Resorts in Cox’s Bazar\n\n'
      'Cox’s Bazar is home to the world’s longest natural sea beach, stretching over 120km. Whether you’re looking for luxury, budget-friendly stays, or a romantic honeymoon resort, this guide covers the absolute best places to stay.\n\n'
      '## 1. Sayeman Beach Resort\n'
      'Located right on Kolatoli Beach, Sayeman is a legend in Cox’s Bazar. Its infinity pool overlooking the ocean is a highlight.\n\n'
      '## 2. Royal Tulip Sea Pearl Beach Resort\n'
      'For those who want secluded luxury, Sea Pearl at Inani Beach is the ultimate choice. It features a private beach and multiple swimming pools.\n\n'
      '## 3. Ocean Paradise Hotel & Resort\n'
      'A great choice for families, offering fantastic views and a central location near the main beach points.\n\n'
      '## 4. Long Beach Hotel\n'
      'Known for its excellent service and indoor pool, making it a reliable choice for business and leisure travelers alike.\n\n'
      '## 5. Seagull Hotel\n'
      'One of the oldest luxury hotels in the region, Seagull offers a classic experience with well-maintained gardens and great food.\n\n'
      '---\n\n'
      '### Looking for a Private Stay?\n'
      'If you prefer more privacy and a home-like feel, check out our [verified apartments in Cox’s Bazar](/coxs-bazar). Many of these feature kitchens and private balconies with sea views at a fraction of the hotel price.\n\n'
      '### [View All Cox’s Bazar Stays →](/coxs-bazar)\n\n'
      '## Travel Tips for Cox’s Bazar\n'
      '* **Best Time to Visit:** November to March for the best weather.\n'
      '* **Must-Visit:** Take a drive along the Marine Drive road to Inani and Himchari.\n'
      '* **Booking Tip:** Always verify your host and check real guest reviews on Restiqa.',
      'https://images.unsplash.com/photo-1544333323-537ffecaa8c3?w=1200&q=80',
      v_author_id
    ) ON CONFLICT (slug) DO NOTHING;
  END IF;
END $$;
