"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createListing(formData: FormData) {
  const supabase = await createClient();

  // 1. Authenticate user
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be logged in to create a listing." };
  }

  // Verify Role securely
  const { data: profile } = await supabase.from("users").select("role").eq("id", user.id).single();
  if (profile?.role !== "host" && profile?.role !== "admin") {
    return { error: "Unauthorized: Host access required to create listings." };
  }

  // 2. Extract basic fields
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const type = formData.get("type") as string;
  const city = formData.get("city") as string;
  const country = formData.get("country") as string;
  const maxGuests = parseInt(formData.get("maxGuests") as string, 10);
  const beds = parseInt(formData.get("beds") as string, 10);
  const baths = parseInt(formData.get("baths") as string, 10);

  // Validate required
  if (!title || !description || isNaN(price) || !city || isNaN(maxGuests)) {
    return { error: "Please fill in all required fields correctly." };
  }

  // Amenities: gather checking multiple checkbox inputs named "amenities"
  const amenities = formData.getAll("amenities") as string[];

  // 3. Handle File Uploads
  const images: string[] = [];
  const files = formData.getAll("images") as File[];
  
  if (!files || files.length === 0 || files[0].size === 0) {
    return { error: "Please upload at least one image." };
  }

  for (const file of files) {
    if (file.size > 0 && file.type.startsWith("image/")) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Generate a unique filename: user_id/timestamp_filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("listings")
        .upload(fileName, buffer, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error("Storage upload error:", uploadError);
        return { error: `Failed to upload image: ${file.name}` };
      }

      // Generate the public URL immediately after successful upload
      const { data: publicUrlData } = supabase.storage
        .from("listings")
        .getPublicUrl(fileName);
        
      images.push(publicUrlData.publicUrl);
    }
  }

  // 4. Insert Listing
  const { data: newListing, error: insertError } = await supabase
    .from("listings")
    .insert({
      host_id: user.id,
      title,
      description,
      price,
      type,
      location: `${city}, ${country}`,
      city,
      country,
      max_guests: maxGuests,
      beds,
      baths,
      amenities,
      images,
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("Database insert error:", insertError.message);
    return { error: "Failed to save the listing to the database." };
  }

  // 5. Success
  revalidatePath("/dashboard");
  revalidatePath("/listings");
  redirect("/dashboard");
}

export async function deleteListing(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const id = formData.get("id") as string;
  if (!id) throw new Error("Invalid ID");

  const { error } = await supabase
    .from("listings")
    .delete()
    .eq("id", id)
    .eq("host_id", user.id);

  if (error) {
    console.error("Failed to delete listing:", error);
    throw new Error("Failed to delete listing.");
  }

  revalidatePath("/dashboard");
  revalidatePath("/listings");
}

export async function addPayoutMethod(formData: FormData): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const provider = formData.get("provider") as string;
  const account_details = formData.get("account_details") as string;

  if (!provider || !account_details) {
    throw new Error("Invalid input");
  }

  const { error } = await supabase.from("payout_methods").insert({
    host_id: user.id,
    provider,
    account_details
  });

  if (error) {
    console.error("Failed to add payout method:", error);
    throw new Error("Failed to add payout method");
  }

  revalidatePath("/dashboard");
}

