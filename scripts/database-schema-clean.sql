-- Drop existing tables if they exist to ensure a clean slate
DROP TABLE IF EXISTS match_opinion_likes CASCADE;
DROP TABLE IF EXISTS match_reminders CASCADE;
DROP TABLE IF EXISTS match_favorites CASCADE;
DROP TABLE IF EXISTS match_opinions CASCADE;
DROP TABLE IF EXISTS match_views CASCADE;
DROP TABLE IF EXISTS favorite_teams CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS teams CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Profiles Table (linked to auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams Table (stores data from API)
CREATE TABLE teams (
    id BIGINT PRIMARY KEY,
    name TEXT NOT NULL,
    logo_url TEXT,
    country TEXT,
    founded INT,
    venue_name TEXT,
    venue_city TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Matches Table (stores data from API)
CREATE TABLE matches (
    id BIGINT PRIMARY KEY,
    home_team_id BIGINT REFERENCES teams(id),
    away_team_id BIGINT REFERENCES teams(id),
    home_score INT,
    away_score INT,
    match_date TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL,
    league_name TEXT,
    league_logo_url TEXT,
    venue_name TEXT,
    venue_city TEXT,
    round_info TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Match Views Table (User interaction)
CREATE TABLE match_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    view_type TEXT NOT NULL, -- 'tv' or 'stadium'
    viewed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- Match Opinions Table (User interaction)
CREATE TABLE match_opinions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- Match Favorites Table (User interaction)
CREATE TABLE match_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- Match Reminders Table (User interaction)
CREATE TABLE match_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id BIGINT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, match_id)
);

-- RLS Policies
-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can insert their own profile." ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- Teams & Matches (Publicly readable, writable by service_role)
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams are viewable by everyone." ON teams FOR SELECT USING (true);
CREATE POLICY "Allow full access for service_role" ON teams FOR ALL USING (bypassing_rls()) WITH CHECK (bypassing_rls());

ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Matches are viewable by everyone." ON matches FOR SELECT USING (true);
CREATE POLICY "Allow full access for service_role" ON matches FOR ALL USING (bypassing_rls()) WITH CHECK (bypassing_rls());

-- User-specific tables
ALTER TABLE match_views ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own match views." ON match_views FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow read access to all." ON match_views FOR SELECT USING (true);

ALTER TABLE match_opinions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own opinions." ON match_opinions FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow read access to all." ON match_opinions FOR SELECT USING (true);

ALTER TABLE match_favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own favorites." ON match_favorites FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow read access to all." ON match_favorites FOR SELECT USING (true);

ALTER TABLE match_reminders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage their own reminders." ON match_reminders FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Allow read access to all." ON match_reminders FOR SELECT USING (true);

-- Function to handle new user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'user_name', new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
