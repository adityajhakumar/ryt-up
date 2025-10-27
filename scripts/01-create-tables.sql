-- Create questions table
CREATE TABLE IF NOT EXISTS questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  tag TEXT DEFAULT 'General',
  language TEXT DEFAULT 'English',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create answers table
CREATE TABLE IF NOT EXISTS answers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
  text TEXT,
  audio_url TEXT,
  nickname TEXT DEFAULT 'Anonymous',
  upvotes INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stance TEXT CHECK (stance IN ('agree', 'disagree', 'neutral')) DEFAULT 'neutral'
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_questions_timestamp ON questions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_answers_question_id ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_answers_upvotes ON answers(upvotes DESC);
