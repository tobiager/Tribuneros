-- Limpiar esquema existente
DROP SCHEMA IF EXISTS public CASCADE;
CREATE SCHEMA public;

-- Habilitar extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de equipos
CREATE TABLE teams (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  country TEXT,
  founded INTEGER,
  venue_name TEXT,
  venue_city TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de partidos
CREATE TABLE matches (
  id INTEGER PRIMARY KEY,
  home_team_id INTEGER REFERENCES teams(id),
  away_team_id INTEGER REFERENCES teams(id),
  home_score INTEGER,
  away_score INTEGER,
  match_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL,
  league_name TEXT,
  league_logo_url TEXT,
  venue_name TEXT,
  venue_city TEXT,
  round_info TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de vistas de partidos
CREATE TABLE match_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  viewing_type TEXT CHECK (viewing_type IN ('tv', 'stadium')) NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Tabla de opiniones de partidos
CREATE TABLE match_opinions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Tabla de favoritos
CREATE TABLE match_favorites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Tabla de recordatorios
CREATE TABLE match_reminders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  match_id INTEGER REFERENCES matches(id) ON DELETE CASCADE,
  reminder_time TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, match_id)
);

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_matches_updated_at BEFORE UPDATE ON matches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_match_opinions_updated_at BEFORE UPDATE ON match_opinions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_opinions ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_reminders ENABLE ROW LEVEL SECURITY;

-- Políticas para profiles
CREATE POLICY "Profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Políticas para match_views
CREATE POLICY "Users can view own match views" ON match_views FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own match views" ON match_views FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own match views" ON match_views FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own match views" ON match_views FOR DELETE USING (auth.uid() = user_id);

-- Políticas para match_opinions
CREATE POLICY "Match opinions are viewable by everyone" ON match_opinions FOR SELECT USING (true);
CREATE POLICY "Users can insert own match opinions" ON match_opinions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own match opinions" ON match_opinions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own match opinions" ON match_opinions FOR DELETE USING (auth.uid() = user_id);

-- Políticas para match_favorites
CREATE POLICY "Users can view own match favorites" ON match_favorites FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own match favorites" ON match_favorites FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own match favorites" ON match_favorites FOR DELETE USING (auth.uid() = user_id);

-- Políticas para match_reminders
CREATE POLICY "Users can view own match reminders" ON match_reminders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own match reminders" ON match_reminders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own match reminders" ON match_reminders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own match reminders" ON match_reminders FOR DELETE USING (auth.uid() = user_id);

-- Permitir lectura pública de teams y matches
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Teams are viewable by everyone" ON teams FOR SELECT USING (true);
CREATE POLICY "Matches are viewable by everyone" ON matches FOR SELECT USING (true);

-- Permitir inserción de teams y matches (para sincronización con API)
CREATE POLICY "Service role can manage teams" ON teams FOR ALL USING (true);
CREATE POLICY "Service role can manage matches" ON matches FOR ALL USING (true);
