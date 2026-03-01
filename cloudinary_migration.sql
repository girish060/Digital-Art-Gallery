-- Cloudinary Integration Migration for Artify
-- This script adds support for Cloudinary image storage

-- Add storage_provider column to track which service is used
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS storage_provider text DEFAULT 'supabase' 
CHECK (storage_provider IN ('supabase', 'cloudinary', 'server'));

-- Add category column if it doesn't exist
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'digital';

-- Update existing artworks to use 'supabase' as default
UPDATE public.artworks SET storage_provider = 'supabase' WHERE storage_provider IS NULL;

-- Add cloudinary_url column as backup/alternative
ALTER TABLE public.artworks 
ADD COLUMN IF NOT EXISTS cloudinary_url text;

-- Create index for faster queries by storage provider
CREATE INDEX IF NOT EXISTS idx_artworks_storage_provider ON public.artworks(storage_provider);

-- Update RLS policies if needed (they should still work fine)
-- The existing policies will work with Cloudinary URLs since they're just text fields

-- Add a function to get the appropriate image URL based on storage provider
CREATE OR REPLACE FUNCTION get_artwork_image_url(artwork artworks)
RETURNS text AS $$
BEGIN
  RETURN COALESCE(artwork.cloudinary_url, artwork.image_url);
END;
$$ LANGUAGE plpgsql STABLE;

-- Add comment to explain the storage_provider column
COMMENT ON COLUMN public.artworks.storage_provider IS 'Storage service used: supabase, cloudinary, or server';
COMMENT ON COLUMN public.artworks.cloudinary_url IS 'Cloudinary URL for the artwork image';
COMMENT ON COLUMN public.artworks.category IS 'Category of artwork: digital, traditional, etc.';

-- Sample usage:
-- INSERT with Cloudinary URL
-- INSERT INTO artworks (title, description, price, image_url, artist_id, storage_provider, category)
-- VALUES ('My Art', 'Description', 99.99, 'https://res.cloudinary.com/your-cloud/image/upload/v1234567890/your-image.jpg', 'user-id', 'cloudinary', 'digital');