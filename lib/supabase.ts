import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types
export interface User {
  id: string
  username: string
  foto_perfil?: string
  bio?: string
  equipos_favoritos: string[]
  fecha_creacion: string
}

export interface MatchSeen {
  id: string
  user_id: string
  api_match_id: number
  comentario?: string
  puntaje: number
  fecha_visto: string
  contexto: "TV" | "Estadio" | "Stream" | "Bar"
  emocion?: string
}

export interface Team {
  id: number
  nombre: string
  escudo_url?: string
  pais?: string
}

export interface Stadium {
  id: number
  nombre: string
  ciudad?: string
  pais?: string
  capacidad?: number
}
