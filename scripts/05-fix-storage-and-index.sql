-- Drop the problematic index that's causing size issues
DROP INDEX IF EXISTS idx_posts_answer;

-- Create a more efficient index that doesn't include the full text content
CREATE INDEX IF NOT EXISTS idx_posts_has_answer ON posts(id) WHERE answer IS NOT NULL;

-- Also create an index for unanswered questions
CREATE INDEX IF NOT EXISTS idx_posts_no_answer ON posts(id) WHERE answer IS NULL;

-- Make sure the posts table structure is correct
ALTER TABLE posts ALTER COLUMN answer TYPE TEXT;
ALTER TABLE posts ALTER COLUMN description TYPE TEXT;

-- Add a simple test insert to verify everything works
INSERT INTO posts (question, description, nickname) 
VALUES ('Test question after index fix', 'Testing the database after fixing indexes', 'TestUser')
ON CONFLICT DO NOTHING;
