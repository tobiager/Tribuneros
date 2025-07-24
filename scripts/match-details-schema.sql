-- Tablas adicionales para detalles de partidos y opiniones
-- Ejecutar después del schema principal

-- Primero, agregar la columna faltante a matches_seen si no existe
ALTER TABLE matches_seen ADD COLUMN IF NOT EXISTS fecha_visto TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Tabla para detalles completos de partidos
CREATE TABLE IF NOT EXISTS match_details (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    api_match_id INTEGER UNIQUE NOT NULL,
    home_formation VARCHAR(10),
    away_formation VARCHAR(10),
    home_lineup JSONB,
    away_lineup JSONB,
    substitutions JSONB,
    goals JSONB,
    cards JSONB,
    statistics JSONB,
    events JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para ratings de partidos
CREATE TABLE IF NOT EXISTS match_ratings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    api_match_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, api_match_id)
);

-- Tabla para comentarios de partidos
CREATE TABLE IF NOT EXISTS match_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    api_match_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla para likes de comentarios
CREATE TABLE IF NOT EXISTS comment_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    comment_id UUID REFERENCES match_comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, comment_id)
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_match_details_api_match_id ON match_details(api_match_id);
CREATE INDEX IF NOT EXISTS idx_match_ratings_api_match_id ON match_ratings(api_match_id);
CREATE INDEX IF NOT EXISTS idx_match_ratings_user_id ON match_ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_match_comments_api_match_id ON match_comments(api_match_id);
CREATE INDEX IF NOT EXISTS idx_match_comments_user_id ON match_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment_id ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_user_id ON comment_likes(user_id);

-- Habilitar RLS
ALTER TABLE match_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Anyone can view match details" ON match_details FOR SELECT USING (true);
CREATE POLICY "Anyone can view ratings" ON match_ratings FOR SELECT USING (true);
CREATE POLICY "Users can insert own ratings" ON match_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON match_ratings FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comments" ON match_comments FOR SELECT USING (true);
CREATE POLICY "Users can insert own comments" ON match_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON match_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON match_comments FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view comment likes" ON comment_likes FOR SELECT USING (true);
CREATE POLICY "Users can insert own likes" ON comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Trigger para actualizar contador de likes
CREATE OR REPLACE FUNCTION update_comment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE match_comments 
        SET likes_count = likes_count + 1 
        WHERE id = NEW.comment_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE match_comments 
        SET likes_count = likes_count - 1 
        WHERE id = OLD.comment_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_likes_count
    AFTER INSERT OR DELETE ON comment_likes
    FOR EACH ROW EXECUTE FUNCTION update_comment_likes_count();
