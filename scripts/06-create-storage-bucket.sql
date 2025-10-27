-- Create storage bucket via SQL (bypasses RLS issues)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'media',
  'media', 
  true,
  10485760, -- 10MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp4']
) ON CONFLICT (id) DO NOTHING;

-- Set up RLS policies for the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'media');
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE USING (bucket_id = 'media');
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE USING (bucket_id = 'media');
