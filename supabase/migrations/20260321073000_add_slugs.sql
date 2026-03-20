-- ============================================================
-- Add Slug Support for SEO-friendly URLs
-- Run in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- 1. Add slug column to listings
ALTER TABLE public.listings 
ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Create a function to slugify text
CREATE OR REPLACE FUNCTION public.slugify(title TEXT)
RETURNS TEXT AS $$
DECLARE
  l_slug TEXT;
BEGIN
  -- Convert to lowercase, replace non-alphanumeric with hyphens, trim hyphens
  l_slug := lower(title);
  l_slug := regexp_replace(l_slug, '[^a-z0-9]+', '-', 'g');
  l_slug := regexp_replace(l_slug, '^-+|-+$', '', 'g');
  RETURN l_slug;
END;
$$ LANGUAGE plpgsql;

-- 3. Update existing listings with generated slugs
-- Add a random suffix if slug is not unique (though gen_random_uuid first 4 chars is safer)
UPDATE public.listings 
SET slug = slugify(title) || '-' || substr(gen_random_uuid()::text, 1, 4)
WHERE slug IS NULL;

-- 4. Rebuild the listings_with_stats view to include the slug
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

-- 5. Add a trigger to auto-generate slug on insert if not provided
CREATE OR REPLACE FUNCTION public.handle_listing_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug := slugify(NEW.title) || '-' || substr(gen_random_uuid()::text, 1, 4);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_listing_slug ON public.listings;
CREATE TRIGGER tr_listing_slug
  BEFORE INSERT ON public.listings
  FOR EACH ROW EXECUTE FUNCTION public.handle_listing_slug();
