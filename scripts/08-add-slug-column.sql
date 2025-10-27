-- Add slug column to posts table
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

-- Update existing posts with slugs
UPDATE posts 
SET slug = generate_slug(question) || '-' || substring(id::text, 1, 8)
WHERE slug IS NULL;

-- Make slug required for new posts
ALTER TABLE posts ALTER COLUMN slug SET NOT NULL;

-- Add unique constraint
ALTER TABLE posts ADD CONSTRAINT posts_slug_unique UNIQUE (slug);
