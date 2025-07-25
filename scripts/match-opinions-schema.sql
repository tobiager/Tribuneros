-- Crear tabla para opiniones de partidos
CREATE TABLE IF NOT EXISTS match_opinions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  api_match_id INTEGER NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_match_opinions_api_match_id ON match_opinions(api_match_id);
CREATE INDEX IF NOT EXISTS idx_match_opinions_user_id ON match_opinions(user_id);
CREATE INDEX IF NOT EXISTS idx_match_opinions_created_at ON match_opinions(created_at DESC);

-- Crear tabla para likes de opiniones
CREATE TABLE IF NOT EXISTS match_opinion_likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  opinion_id UUID REFERENCES match_opinions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, opinion_id)
);

-- Función para actualizar el contador de likes
CREATE OR REPLACE FUNCTION update_opinion_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE match_opinions 
    SET likes = likes + 1 
    WHERE id = NEW.opinion_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE match_opinions 
    SET likes = likes - 1 
    WHERE id = OLD.opinion_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar automáticamente el contador de likes
DROP TRIGGER IF EXISTS trigger_update_opinion_likes_count ON match_opinion_likes;
CREATE TRIGGER trigger_update_opinion_likes_count
  AFTER INSERT OR DELETE ON match_opinion_likes
  FOR EACH ROW EXECUTE FUNCTION update_opinion_likes_count();

-- Insertar datos de ejemplo
INSERT INTO match_opinions (user_id, api_match_id, rating, comment, likes, created_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 1, 5, '¡Qué partidazo! Messi estuvo increíble, especialmente en el penal. Una final para la historia del fútbol mundial.', 24, '2022-12-18 20:30:00'),
  ('00000000-0000-0000-0000-000000000002', 1, 4, 'Partido muy emocionante, aunque sufrí mucho en los penales. Di María jugó espectacular.', 18, '2022-12-18 21:15:00'),
  ('00000000-0000-0000-0000-000000000003', 1, 5, 'SOMOS CAMPEONES DEL MUNDO! 🏆🇦🇷 No puedo creer que lo hayamos logrado después de tantos años.', 45, '2022-12-19 08:00:00'),
  ('00000000-0000-0000-0000-000000000004', 2, 5, '¡DALE BOCA! Qué lindo ganarle a River en la Bombonera. El gol de Benedetto fue espectacular.', 32, '2023-10-15 19:45:00'),
  ('00000000-0000-0000-0000-000000000005', 2, 2, 'No jugamos bien, Boca mereció ganar. Hay que mejorar para el próximo clásico.', 8, '2023-10-15 20:30:00');
