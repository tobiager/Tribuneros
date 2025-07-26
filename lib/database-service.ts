import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { ApiFootballMatch, ApiFootballTeam, MatchOpinion } from "./types"

const supabase = createClientComponentClient()

// Ligas permitidas - debe coincidir con api-football-service.ts
const ALLOWED_LEAGUE_IDS = [
  // Argentina
  128, 129, 130, 131, 132, 133, 134, 135,
  // Brasil
  71,
  // España
  140,
  // Italia
  135,
  // Inglaterra
  39,
  // Competiciones internacionales
  9, 1, 4, 5, 32,
]

export class DatabaseService {
  static async syncTeam(team: ApiFootballTeam): Promise<void> {
    try {
      const { error } = await supabase
        .from("teams")
        .upsert({
          id: team.id,
          name: team.name,
          logo_url: team.logo,
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error("Error syncing team:", error)
      }
    } catch (error) {
      console.error("Error syncing team:", error)
    }
  }

  static async syncMatch(match: ApiFootballMatch): Promise<void> {
    try {
      // Solo sincronizar partidos de ligas permitidas
      if (!ALLOWED_LEAGUE_IDS.includes(match.league.id)) {
        return
      }

      // Verificar si el partido ya existe para evitar duplicados
      const { data: existingMatch } = await supabase
        .from("matches")
        .select("id, updated_at")
        .eq("id", match.fixture.id)
        .single()

      // First sync the teams
      await Promise.all([this.syncTeam(match.teams.home), this.syncTeam(match.teams.away)])

      const matchData = {
        id: match.fixture.id,
        home_team_id: match.teams.home.id,
        away_team_id: match.teams.away.id,
        home_score: match.goals.home,
        away_score: match.goals.away,
        match_date: match.fixture.date,
        status: match.fixture.status.short,
        league_name: match.league.name,
        league_id: match.league.id,
        league_logo_url: match.league.logo,
        venue_name: match.fixture.venue?.name || null,
        venue_city: match.fixture.venue?.city || null,
        round_info: match.league.round,
        updated_at: new Date().toISOString(),
      }

      if (existingMatch) {
        // Actualizar partido existente
        const { error } = await supabase.from("matches").update(matchData).eq("id", match.fixture.id)

        if (error) {
          console.error("Error updating match:", error)
        } else {
          console.log(`✅ Partido actualizado: ${match.teams.home.name} vs ${match.teams.away.name}`)
        }
      } else {
        // Insertar nuevo partido
        const { error } = await supabase.from("matches").insert(matchData)

        if (error) {
          console.error("Error inserting match:", error)
        } else {
          console.log(`✅ Partido guardado: ${match.teams.home.name} vs ${match.teams.away.name}`)
        }
      }
    } catch (error) {
      console.error("Error syncing match:", error)
    }
  }

  static async getMatchesByDate(date: string): Promise<any[]> {
    try {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)

      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)

      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, logo_url)
        `)
        .gte("match_date", startOfDay.toISOString())
        .lte("match_date", endOfDay.toISOString())
        .or(`league_id.in.(${ALLOWED_LEAGUE_IDS.join(",")}),is_manual.eq.true`)
        .order("match_date", { ascending: true })

      if (error) {
        console.error("Error fetching matches by date:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching matches by date:", error)
      return []
    }
  }

  static async getFeaturedStoredMatches(): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, logo_url),
          views_count:match_views(count),
          opinions_count:match_opinions(count),
          favorites_count:match_favorites(count)
        `)
        .in("status", ["FT", "AET", "PEN"])
        .or(`league_id.in.(${ALLOWED_LEAGUE_IDS.join(",")}),is_manual.eq.true`)
        .order("match_date", { ascending: false })
        .limit(50)

      if (error) {
        console.error("Error fetching featured matches:", error)
        return []
      }

      // Calcular interacciones totales y ordenar por más interacciones
      const matchesWithInteractions = (data || []).map((match) => {
        const viewsCount = match.views_count?.length || 0
        const opinionsCount = match.opinions_count?.length || 0
        const favoritesCount = match.favorites_count?.length || 0
        const totalInteractions = viewsCount + opinionsCount + favoritesCount

        return {
          ...match,
          interaction_count: totalInteractions,
          views_count: viewsCount,
          opinions_count: opinionsCount,
          favorites_count: favoritesCount,
        }
      })

      // Ordenar por interacciones (descendente) y tomar los primeros 20
      return matchesWithInteractions.sort((a, b) => b.interaction_count - a.interaction_count).slice(0, 20)
    } catch (error) {
      console.error("Error fetching featured matches:", error)
      return []
    }
  }

  static async getStoredMatches(limit = 50): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("matches")
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, logo_url)
        `)
        .or(`league_id.in.(${ALLOWED_LEAGUE_IDS.join(",")}),is_manual.eq.true`)
        .order("match_date", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching stored matches:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching stored matches:", error)
      return []
    }
  }

  static async addManualMatch(matchData: {
    homeTeam: string
    awayTeam: string
    homeScore?: number
    awayScore?: number
    matchDate: string
    league: string
    venue?: string
    status: string
  }): Promise<{ success: boolean; error?: string; matchId?: number }> {
    try {
      // Generate a unique ID for manual matches (negative to avoid conflicts)
      const manualId = -Math.floor(Math.random() * 1000000)

      const { data, error } = await supabase
        .from("matches")
        .insert({
          id: manualId,
          home_team_id: null,
          away_team_id: null,
          home_score: matchData.homeScore || null,
          away_score: matchData.awayScore || null,
          match_date: matchData.matchDate,
          status: matchData.status,
          league_name: matchData.league,
          venue_name: matchData.venue || null,
          is_manual: true,
          manual_home_team: matchData.homeTeam,
          manual_away_team: matchData.awayTeam,
        })
        .select()
        .single()

      if (error) {
        console.error("Error adding manual match:", error)
        return { success: false, error: error.message }
      }

      return { success: true, matchId: data.id }
    } catch (error) {
      console.error("Error adding manual match:", error)
      return { success: false, error: "Error inesperado" }
    }
  }

  static async getMatchOpinions(matchId: number): Promise<MatchOpinion[]> {
    try {
      const { data, error } = await supabase
        .from("match_opinions")
        .select(`
          *,
          profiles:user_id (
            username,
            avatar_url
          )
        `)
        .eq("match_id", matchId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching match opinions:", error)
        return []
      }

      return data || []
    } catch (error) {
      console.error("Error fetching match opinions:", error)
      return []
    }
  }

  static async getMatchAverageRating(matchId: number): Promise<number> {
    try {
      const { data, error } = await supabase.from("match_opinions").select("rating").eq("match_id", matchId)

      if (error || !data || data.length === 0) {
        return 0
      }

      const sum = data.reduce((acc, opinion) => acc + opinion.rating, 0)
      return sum / data.length
    } catch (error) {
      console.error("Error calculating average rating:", error)
      return 0
    }
  }

  static async checkUserIsAdmin(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.from("profiles").select("is_admin").eq("id", userId).single()

      if (error) {
        console.error("Error checking admin status:", error)
        return false
      }

      return data?.is_admin || false
    } catch (error) {
      console.error("Error checking admin status:", error)
      return false
    }
  }

  /**
   * Verifica si un partido ya existe en la base de datos
   */
  static async matchExists(matchId: number): Promise<boolean> {
    try {
      const { data, error } = await supabase.from("matches").select("id").eq("id", matchId).single()

      return !error && !!data
    } catch (error) {
      return false
    }
  }

  /**
   * Obtiene estadísticas de sincronización
   */
  static async getSyncStats(): Promise<{
    totalMatches: number
    todayMatches: number
    yesterdayMatches: number
    lastSyncTime: string | null
  }> {
    try {
      const today = new Date().toISOString().split("T")[0]
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]

      const [totalResult, todayResult, yesterdayResult] = await Promise.all([
        supabase.from("matches").select("id", { count: "exact" }),
        supabase
          .from("matches")
          .select("id", { count: "exact" })
          .gte("match_date", `${today}T00:00:00`)
          .lt("match_date", `${today}T23:59:59`),
        supabase
          .from("matches")
          .select("id", { count: "exact" })
          .gte("match_date", `${yesterday}T00:00:00`)
          .lt("match_date", `${yesterday}T23:59:59`),
      ])

      return {
        totalMatches: totalResult.count || 0,
        todayMatches: todayResult.count || 0,
        yesterdayMatches: yesterdayResult.count || 0,
        lastSyncTime: new Date().toISOString(),
      }
    } catch (error) {
      console.error("Error getting sync stats:", error)
      return {
        totalMatches: 0,
        todayMatches: 0,
        yesterdayMatches: 0,
        lastSyncTime: null,
      }
    }
  }
}

export async function getUserInteractions(userId: string, matchIds: number[]) {
  try {
    const [viewsData, opinionsData, favoritesData, remindersData] = await Promise.all([
      supabase.from("match_views").select("*").eq("user_id", userId).in("match_id", matchIds),
      supabase.from("match_opinions").select("*").eq("user_id", userId).in("match_id", matchIds),
      supabase.from("match_favorites").select("*").eq("user_id", userId).in("match_id", matchIds),
      supabase.from("match_reminders").select("*").eq("user_id", userId).in("match_id", matchIds),
    ])

    return {
      views: new Map(viewsData.data?.map((v) => [v.match_id, v]) || []),
      opinions: new Map(opinionsData.data?.map((o) => [o.match_id, o]) || []),
      favorites: new Set(favoritesData.data?.map((f) => f.match_id) || []),
      reminders: new Set(remindersData.data?.map((r) => r.match_id) || []),
    }
  } catch (error) {
    console.error("Error fetching user interactions:", error)
    return {
      views: new Map(),
      opinions: new Map(),
      favorites: new Set(),
      reminders: new Set(),
    }
  }
}

// Function to automatically save finished matches
export async function autoSaveFinishedMatches(matches: ApiFootballMatch[]) {
  const finishedMatches = matches.filter(
    (match) =>
      ["FT", "AET", "PEN"].includes(match.fixture.status.short) && ALLOWED_LEAGUE_IDS.includes(match.league.id),
  )

  for (const match of finishedMatches) {
    try {
      await DatabaseService.syncMatch(match)
    } catch (error) {
      console.error(`Error auto-saving match ${match.fixture.id}:`, error)
    }
  }
}
