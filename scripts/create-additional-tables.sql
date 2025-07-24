-- Additional tables for enhanced features
-- Run this after the main tables script

-- Match comments table
CREATE TABLE match_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match likes table
CREATE TABLE match_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- Favorite moments table
CREATE TABLE favorite_moments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    match_id INTEGER NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    video_url TEXT,
    minute INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_match_comments_match_id ON match_comments(match_id);
CREATE INDEX idx_match_comments_user_id ON match_comments(user_id);
CREATE INDEX idx_match_likes_match_id ON match_likes(match_id);
CREATE INDEX idx_match_likes_user_id ON match_likes(user_id);
CREATE INDEX idx_favorite_moments_match_id ON favorite_moments(match_id);
CREATE INDEX idx_favorite_moments_user_id ON favorite_moments(user_id);

-- Enable RLS
ALTER TABLE match_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorite_moments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all comments" ON match_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON match_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON match_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON match_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all likes" ON match_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON match_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON match_likes FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view all moments" ON favorite_moments FOR SELECT USING (true);
CREATE POLICY "Users can insert own moments" ON favorite_moments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own moments" ON favorite_moments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own moments" ON favorite_moments FOR DELETE USING (auth.uid() = user_id);
