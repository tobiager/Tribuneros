-- Create tables for Tribuneros
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    foto_perfil TEXT,
    bio TEXT,
    equipos_favoritos TEXT[] DEFAULT '{}',
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table (from API-Football)
CREATE TABLE teams (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    escudo_url TEXT,
    pais VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Stadiums table
CREATE TABLE stadiums (
    id INTEGER PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ciudad VARCHAR(50),
    pais VARCHAR(50),
    capacidad INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Matches seen table
CREATE TABLE matches_seen (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    api_match_id INTEGER NOT NULL,
    comentario TEXT,
    puntaje INTEGER CHECK (puntaje >= 1 AND puntaje <= 10),
    fecha_visto TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    contexto VARCHAR(20) DEFAULT 'TV', -- TV, Estadio, Stream, Bar
    emocion VARCHAR(20), -- Épico, Me rompió, Aburrido, etc.
    UNIQUE(user_id, api_match_id)
);

-- Create indexes for better performance
CREATE INDEX idx_matches_seen_user_id ON matches_seen(user_id);
CREATE INDEX idx_matches_seen_api_match_id ON matches_seen(api_match_id);
CREATE INDEX idx_users_username ON users(username);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches_seen ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE stadiums ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view all matches seen" ON matches_seen FOR SELECT USING (true);
CREATE POLICY "Users can insert own matches" ON matches_seen FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own matches" ON matches_seen FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own matches" ON matches_seen FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Everyone can view teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Everyone can view stadiums" ON stadiums FOR SELECT USING (true);
