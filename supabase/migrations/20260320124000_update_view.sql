-- Rebuild listings_with_stats view to ensure standard visibility of newly added columns like status
CREATE OR REPLACE VIEW listings_with_stats AS
SELECT l.*,
       COALESCE(AVG(r.rating), 0) AS average_rating,
       COUNT(r.id) AS review_count
FROM public.listings l
LEFT JOIN public.reviews r ON l.id = r.listing_id
GROUP BY l.id;
