-- Insert sample questions for testing
INSERT INTO questions (question, tag, language) VALUES
('What are the best career opportunities in AI for freshers in India?', 'Career', 'English'),
('How can we preserve Indian culture in the digital age?', 'Culture', 'English'),
('What is the future of startups in tier-2 cities?', 'Startup', 'English'),
('Best meditation practices for busy professionals?', 'Spiritual', 'English'),
('How to balance work-life in Indian corporate culture?', 'Career', 'English');

-- Insert sample answers
INSERT INTO answers (question_id, text, nickname, upvotes) VALUES
((SELECT id FROM questions WHERE question LIKE '%AI for freshers%' LIMIT 1), 'Focus on learning Python, machine learning basics, and contribute to open source projects. Many Indian companies are hiring AI freshers now.', 'TechGuru', 5),
((SELECT id FROM questions WHERE question LIKE '%preserve Indian culture%' LIMIT 1), 'We should use technology to document and share our traditions. Create digital archives of folk songs, stories, and festivals.', 'CultureKeeper', 3),
((SELECT id FROM questions WHERE question LIKE '%startups in tier-2%' LIMIT 1), 'Tier-2 cities have lower costs and untapped markets. Focus on local problems and solutions. Government support is also increasing.', 'StartupFounder', 7);
