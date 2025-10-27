-- Add slug column to posts table (nullable initially)
ALTER TABLE posts ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);

-- Function to generate slug from text
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        regexp_replace(input_text, '[^a-zA-Z0-9\s]', '', 'g'),
        '\s+', '-', 'g'
      ),
      '^-+|-+$', '', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql;

-- Update existing posts with slugs (only if they don't have one)
UPDATE posts 
SET slug = generate_slug(question) || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL;

-- Don't make slug required yet - we'll handle this in the application
-- We'll add the constraint later after ensuring all new posts get slugs
