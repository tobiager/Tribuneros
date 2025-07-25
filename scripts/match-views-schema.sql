-- Crear tabla para almacenar las vistas de partidos por usuario
CREATE TABLE IF NOT EXISTS match_views (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  match_id INTEGER NOT NULL,
  view_type VARCHAR(20) NOT NULL CHECK (view_type IN ('tv', 'stadium')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Restricción única: un usuario solo puede tener una vista por partido
  UNIQUE(user_id, match_id)
);

-- Crear tabla para almacenar recordatorios de partidos
CREATE TABLE IF NOT EXISTS match_reminders (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL,
  match_id INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Restricción única: un usuario solo puede tener un recordatorio por partido
  UNIQUE(user_id, match_id)
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_match_views_user_id ON match_views(user_id);
CREATE INDEX IF NOT EXISTS idx_match_views_match_id ON match_views(match_id);
CREATE INDEX IF NOT EXISTS idx_match_reminders_user_id ON match_reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_match_reminders_match_id ON match_reminders(match_id);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_match_views_updated_at 
    BEFORE UPDATE ON match_views 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Políticas RLS (Row Level Security) si es necesario
-- ALTER TABLE match_views ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE match_reminders ENABLE ROW LEVEL SECURITY;

-- Comentarios para documentación
COMMENT ON TABLE match_views IS 'Almacena cómo los usuarios vieron cada partido (TV o estadio)';
COMMENT ON TABLE match_reminders IS 'Almacena recordatorios de partidos configurados por usuarios';
COMMENT ON COLUMN match_views.view_type IS 'Tipo de visualización: tv (televisión/streaming) o stadium (en el estadio)';
