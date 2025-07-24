import { supabase } from "./supabase"
import type { User, MatchSeen, Team, Stadium } from "./supabase"

export class Database {
  // User operations
  static async createUser(userData: Omit<User, "id" | "fecha_creacion">) {
    const { data, error } = await supabase.from("users").insert([userData]).select().single()

    if (error) throw error
    return data
  }

  static async getUserById(id: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("id", id).single()

    if (error) return null
    return data
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

    if (error) return null
    return data
  }

  static async updateUser(id: string, updates: Partial<User>) {
    const { data, error } = await supabase.from("users").update(updates).eq("id", id).select().single()

    if (error) throw error
    return data
  }

  // Match operations
  static async addMatchSeen(matchData: Omit<MatchSeen, "id" | "fecha_visto">) {
    const { data, error } = await supabase.from("matches_seen").insert([matchData]).select().single()

    if (error) throw error
    return data
  }

  static async getMatchesSeenByUser(userId: string): Promise<MatchSeen[]> {
    const { data, error } = await supabase
      .from("matches_seen")
      .select("*")
      .eq("user_id", userId)
      .order("fecha_visto", { ascending: false })

    if (error) throw error
    return data || []
  }

  static async getUserStats(userId: string) {
    const matches = await this.getMatchesSeenByUser(userId)

    const stats = {
      totalMatches: matches.length,
      averageRating:
        matches.length > 0
          ? Math.round((matches.reduce((sum, m) => sum + m.puntaje, 0) / matches.length) * 10) / 10
          : 0,
      contextoStats: {
        estadio: matches.filter((m) => m.contexto === "Estadio").length,
        tv: matches.filter((m) => m.contexto === "TV").length,
        stream: matches.filter((m) => m.contexto === "Stream").length,
        bar: matches.filter((m) => m.contexto === "Bar").length,
      },
      topEmociones: this.getTopEmociones(matches),
      recentMatches: matches.slice(0, 10),
    }

    return stats
  }

  private static getTopEmociones(matches: MatchSeen[]) {
    const emociones: Record<string, number> = {}
    matches.forEach((match) => {
      if (match.emocion) {
        emociones[match.emocion] = (emociones[match.emocion] || 0) + 1
      }
    })

    return Object.entries(emociones)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([emocion, count]) => ({ emocion, count }))
  }

  static async getPopularMatches(): Promise<{ api_match_id: number; count: number; avg_rating: number }[]> {
    const { data, error } = await supabase.from("matches_seen").select("api_match_id, puntaje")

    if (error) throw error

    const matchStats: Record<number, { count: number; totalRating: number }> = {}

    data?.forEach((match) => {
      if (!matchStats[match.api_match_id]) {
        matchStats[match.api_match_id] = { count: 0, totalRating: 0 }
      }
      matchStats[match.api_match_id].count++
      matchStats[match.api_match_id].totalRating += match.puntaje
    })

    return Object.entries(matchStats)
      .map(([matchId, stats]) => ({
        api_match_id: Number.parseInt(matchId),
        count: stats.count,
        avg_rating: Math.round((stats.totalRating / stats.count) * 10) / 10,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20)
  }

  // Team operations
  static async saveTeam(teamData: Team) {
    const { data, error } = await supabase.from("teams").upsert([teamData]).select().single()

    if (error) throw error
    return data
  }

  static async getTeamById(id: number): Promise<Team | null> {
    const { data, error } = await supabase.from("teams").select("*").eq("id", id).single()

    if (error) return null
    return data
  }

  // Stadium operations
  static async saveStadium(stadiumData: Stadium) {
    const { data, error } = await supabase.from("stadiums").upsert([stadiumData]).select().single()

    if (error) throw error
    return data
  }
}
