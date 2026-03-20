-- Create a new public storage bucket called 'listings' to hold property images
insert into storage.buckets (id, name, public)
values ('listings', 'listings', true);

-- Allow public read access to the 'listings' bucket
create policy "Public Access to listings"
on storage.objects for select
to public
using ( bucket_id = 'listings' );

-- Allow authenticated users to upload images to the 'listings' bucket
create policy "Authenticated users can upload listing images"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'listings' );

-- Allow users to update their own uploads (optional, but good for management)
create policy "Users can update their own listing images"
on storage.objects for update
to authenticated
using ( bucket_id = 'listings' AND auth.uid() = owner )
with check ( bucket_id = 'listings' AND auth.uid() = owner );

-- Allow users to delete their own uploads
create policy "Users can delete their own listing images"
on storage.objects for delete
to authenticated
using ( bucket_id = 'listings' AND auth.uid() = owner );
