-- Fix comments table structure
DROP TABLE IF EXISTS comments CASCADE;
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment TEXT NOT NULL,
  nickname TEXT DEFAULT 'Anonymous',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fix likes table structure  
DROP TABLE IF EXISTS likes CASCADE;
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, nickname)
);

-- Increase character limits for posts
ALTER TABLE posts ALTER COLUMN question TYPE TEXT;
ALTER TABLE posts ALTER COLUMN description TYPE TEXT;
ALTER TABLE posts ALTER COLUMN answer TYPE TEXT;

-- Remove character length constraints
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_question_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_description_check;
ALTER TABLE posts DROP CONSTRAINT IF EXISTS posts_answer_check;

-- Add proper indexes
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_nickname ON likes(nickname);

-- Test data to verify everything works
INSERT INTO posts (question, description, answer, nickname) 
VALUES (
  'Test question with longer content to verify the new limits work properly',
  'This is a test description that can be much longer than before. We are testing to make sure that the database can handle longer content without any issues. This should work fine now with the updated schema.',
  'This is a test answer that can be much longer than the previous 2000 character limit. Users should be able to write detailed, comprehensive answers without worrying about artificial character limits. This will allow for more thorough explanations, examples, and detailed responses that truly help the community. The goal is to enable rich, meaningful content that provides real value to users seeking answers to their questions.',
  'TestUser'
) ON CONFLICT DO NOTHING;

-- Add a test comment
INSERT INTO comments (post_id, comment, nickname)
SELECT id, 'This is a test comment to verify comments are working properly', 'TestCommenter'
FROM posts WHERE nickname = 'TestUser' LIMIT 1
ON CONFLICT DO NOTHING;

-- Add a test like
INSERT INTO likes (post_id, nickname)
SELECT id, 'TestLiker'
FROM posts WHERE nickname = 'TestUser' LIMIT 1
ON CONFLICT DO NOTHING;
