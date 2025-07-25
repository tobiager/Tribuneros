import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { ApiFootballMatch, ApiFootballTeam, MatchOpinion } from "./types"

const supabase = createClientComponentClient()

export class DatabaseService {
  static async syncTeam(team: ApiFootballTeam): Promise<void> {
    try {
      const { error } = await supabase
        .from("teams")
        .upsert({
          id: team.id,
          name: team.name,
          logo: team.logo,
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
      const { error } = await supabase
        .from("matches")
        .upsert({
          id: match.fixture.id,
          home_team_id: match.teams.home.id,
          away_team_id: match.teams.away.id,
          home_score: match.goals.home,
          away_score: match.goals.away,
          match_date: match.fixture.date,
          venue: match.fixture.venue?.name || "Unknown",
          league: match.league.name,
          status: this.mapApiStatus(match.fixture.status.short),
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error("Error syncing match:", error)
      }
    } catch (error) {
      console.error("Error syncing match:", error)
    }
  }

  private static mapApiStatus(apiStatus: string): "scheduled" | "live" | "finished" {
    const liveStatuses = ["1H", "HT", "2H", "ET", "BT", "P", "SUSP", "INT", "LIVE"]
    const finishedStatuses = ["FT", "AET", "PEN", "PST", "CANC", "ABD", "AWD", "WO"]

    if (liveStatuses.includes(apiStatus)) return "live"
    if (finishedStatuses.includes(apiStatus)) return "finished"
    return "scheduled"
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
