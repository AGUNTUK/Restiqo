"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function submitReview(formData: FormData) {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { error: "You must be logged in to leave a review." };
  }

  // 2. Extract and validate data
  const listingId = formData.get("listingId") as string;
  const rating = parseInt(formData.get("rating") as string, 10);
  const comment = formData.get("comment") as string;

  if (!listingId || isNaN(rating) || rating < 1 || rating > 5) {
    return { error: "Invalid review data. Rating must be between 1 and 5." };
  }

  if (!comment || comment.length < 5) {
    return { error: "Review comment must be at least 5 characters long." };
  }

  // 3. Insert review
  const { error: insertError } = await supabase
    .from("reviews")
    .insert({
      listing_id: listingId,
      user_id: user.id,
      rating,
      comment
    });

  if (insertError) {
    console.error("Review insert error:", insertError.message);
    return { error: "Failed to submit review. You might have already reviewed this property." };
  }

  // 4. Revalidate the listing page
  // Note: We don't have the slug here easily, but we can revalidate the general path 
  // or the specific one if we passed the slug in formData.
  const slug = formData.get("slug") as string;
  if (slug) {
    revalidatePath(`/listing/${slug}`);
  }
  revalidatePath("/listings");

  return { success: true };
}
