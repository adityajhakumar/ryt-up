-- First, let's check if the posts table has the right structure
-- Add missing columns if they don't exist
ALTER TABLE posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE posts ADD COLUMN IF NOT EXISTS audio_url TEXT;

-- Make sure the answer column allows updates
-- Check if there are any constraints preventing updates
UPDATE posts SET answer = NULL WHERE answer = '';

-- Create a simple test to verify the table works
INSERT INTO posts (question, description, nickname) 
VALUES ('Test question for debugging', 'This is a test', 'TestUser')
ON CONFLICT DO NOTHING;
