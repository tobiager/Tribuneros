import { createClient } from "@supabase/supabase-js"
import { SUPABASE_TABLES, MATCH_STATUS } from "./constants"
import { isMatchInArgentinaToday, isMatchArgentinaYesterday } from "./timezone-utils"
import type { ApiFootballMatch } from "./types"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export class DatabaseService {
  /**
   * Verifica si un usuario es administrador
   */
  static async checkUserIsAdmin(userId: string): Promise<boolean> {
    try {
      console.log(`🔍 Verificando si el usuario ${userId} es admin...`)

      // Verificar en la tabla de perfiles si existe un campo is_admin
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", userId)
        .maybeSingle()

      if (profileError) {
        console.error("❌ Error checking profile admin status:", profileError)
      } else if (profileData?.is_admin) {
        console.log("✅ Usuario es admin según profiles")
        return true
      }

      // Verificar en la tabla de admins si existe
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle()

      if (adminError) {
        console.error("❌ Error checking admins table:", adminError)
        return false
      }

      const isAdmin = !!adminData
      console.log(`${isAdmin ? "✅" : "❌"} Usuario ${isAdmin ? "es" : "no es"} admin`)
      return isAdmin
    } catch (error) {
      console.error("❌ Error in checkUserIsAdmin:", error)
      return false
    }
  }

  /**
   * Obtiene partidos por fecha desde la base de datos
   */
  static async getMatchesByDate(dateString: string): Promise<any[]> {
    try {
      console.log(`🔍 Buscando partidos para fecha: ${dateString}`)

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.MATCHES)
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, logo_url)
        `)
        .gte("match_date", `${dateString}T00:00:00`)
        .lt("match_date", `${dateString}T23:59:59`)
        .order("match_date", { ascending: true })

      if (error) {
        console.error("❌ Error fetching matches by date:", error)
        return []
      }

      console.log(`✅ Encontrados ${data?.length || 0} partidos para ${dateString}`)
      return data || []
    } catch (error) {
      console.error("❌ Error in getMatchesByDate:", error)
      return []
    }
  }

  /**
   * Obtiene partidos destacados (con más interacciones)
   */
  static async getFeaturedMatches(): Promise<any[]> {
    try {
      console.log("🔍 Buscando partidos destacados...")

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.MATCHES)
        .select(`
          *,
          home_team:teams!matches_home_team_id_fkey(id, name, logo_url),
          away_team:teams!matches_away_team_id_fkey(id, name, logo_url),
          views_count:match_views(count),
          opinions_count:match_opinions(count),
          favorites_count:match_favorites(count)
        `)
        .in("status", [MATCH_STATUS.FINISHED, MATCH_STATUS.FINISHED_EXTRA_TIME, MATCH_STATUS.FINISHED_PENALTIES])
        .order("created_at", { ascending: false })
        .limit(50)

      if (error) {
        console.error("❌ Error fetching featured matches:", error)
        return []
      }

      // Calcular interaction_count manualmente
      const processedData = (data || []).map((match) => {
        const viewsCount = Array.isArray(match.views_count) ? match.views_count.length : 0
        const opinionsCount = Array.isArray(match.opinions_count) ? match.opinions_count.length : 0
        const favoritesCount = Array.isArray(match.favorites_count) ? match.favorites_count.length : 0
        const totalInteractions = viewsCount + opinionsCount + favoritesCount

        return {
          ...match,
          interaction_count: totalInteractions,
          views_count: viewsCount,
          opinions_count: opinionsCount,
          favorites_count: favoritesCount,
        }
      })

      // Ordenar por interaction_count descendente y tomar los primeros 20
      const featured = processedData.sort((a, b) => b.interaction_count - a.interaction_count).slice(0, 20)

      console.log(`✅ Encontrados ${featured.length} partidos destacados`)
      return featured
    } catch (error) {
      console.error("❌ Error in getFeaturedMatches:", error)
      return []
    }
  }

  /**
   * Guarda o actualiza un equipo en la base de datos
   */
  static async upsertTeam(team: any): Promise<any> {
    try {
      console.log(`💾 Guardando equipo: ${team.name} (ID: ${team.id})`)

      // Solo insertar campos que sabemos que existen en la tabla teams
      const teamData = {
        id: team.id,
        name: team.name,
        logo_url: team.logo, // Usar logo_url en lugar de logo
        country: team.country || null,
        founded: team.founded || null,
        national: team.national || false,
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from(SUPABASE_TABLES.TEAMS)
        .upsert(teamData, {
          onConflict: "id",
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error upserting team:", error)
        console.error("❌ Team data:", teamData)
        return null
      }

      console.log(`✅ Equipo guardado: ${team.name}`)
      return data
    } catch (error) {
      console.error("❌ Error in upsertTeam:", error)
      return null
    }
  }

  /**
   * Guarda un partido en la base de datos
   */
  static async saveMatch(match: ApiFootballMatch): Promise<boolean> {
    try {
      console.log(`💾 Guardando partido: ${match.teams.home.name} vs ${match.teams.away.name}`)

      // Primero, asegurar que los equipos existan
      const [homeTeam, awayTeam] = await Promise.all([
        this.upsertTeam(match.teams.home),
        this.upsertTeam(match.teams.away),
      ])

      if (!homeTeam || !awayTeam) {
        console.error("❌ No se pudieron guardar los equipos")
        return false
      }

      // Verificar si el partido ya existe
      const { data: existingMatch } = await supabase
        .from(SUPABASE_TABLES.MATCHES)
        .select("id")
        .eq("id", match.fixture.id)
        .maybeSingle()

      // Solo insertar campos que sabemos que existen en la tabla matches
      const matchData = {
        id: match.fixture.id,
        home_team_id: match.teams.home.id,
        away_team_id: match.teams.away.id,
        home_score: match.goals.home,
        away_score: match.goals.away,
        match_date: match.fixture.date,
        status: match.fixture.status.short,
        league_name: match.league.name,
        league_logo_url: match.league.logo,
        venue_name: match.fixture.venue?.name || null,
        season: match.league.season || null,
        updated_at: new Date().toISOString(),
      }

      if (existingMatch) {
        console.log(`🔄 Actualizando partido existente: ${match.fixture.id}`)

        const { error } = await supabase
          .from(SUPABASE_TABLES.MATCHES)
          .update({
            home_score: matchData.home_score,
            away_score: matchData.away_score,
            status: matchData.status,
            updated_at: matchData.updated_at,
          })
          .eq("id", match.fixture.id)

        if (error) {
          console.error("❌ Error updating match:", error)
          return false
        }

        console.log(`✅ Partido actualizado: ${match.fixture.id}`)
      } else {
        console.log(`➕ Insertando nuevo partido: ${match.fixture.id}`)

        const { error } = await supabase.from(SUPABASE_TABLES.MATCHES).insert({
          ...matchData,
          created_at: new Date().toISOString(),
        })

        if (error) {
          console.error("❌ Error inserting match:", error)
          console.error("❌ Match data:", matchData)
          return false
        }

        console.log(`✅ Partido insertado: ${match.fixture.id}`)
      }

      return true
    } catch (error) {
      console.error("❌ Error in saveMatch:", error)
      return false
    }
  }
}

/**
 * Procesa partidos de la API con filtro de zona horaria argentina
 * y guarda automáticamente los partidos finalizados de ayer
 */
export async function processMatchesWithTimezone(apiMatches: ApiFootballMatch[]): Promise<{
  todayMatches: ApiFootballMatch[]
  savedYesterdayCount: number
}> {
  console.log(`🔄 Procesando ${apiMatches.length} partidos con filtro de zona horaria...`)

  const todayMatches: ApiFootballMatch[] = []
  const yesterdayFinishedMatches: ApiFootballMatch[] = []

  // Filtrar partidos por zona horaria argentina
  for (const match of apiMatches) {
    if (isMatchInArgentinaToday(match.fixture.date)) {
      todayMatches.push(match)
      console.log(`📅 HOY: ${match.teams.home.name} vs ${match.teams.away.name}`)
    } else if (isMatchArgentinaYesterday(match.fixture.date)) {
      // Si es de ayer y está finalizado, guardarlo
      const isFinished = [
        MATCH_STATUS.FINISHED,
        MATCH_STATUS.FINISHED_EXTRA_TIME,
        MATCH_STATUS.FINISHED_PENALTIES,
      ].includes(match.fixture.status.short as any)

      if (isFinished) {
        yesterdayFinishedMatches.push(match)
        console.log(`📅 AYER (finalizado): ${match.teams.home.name} vs ${match.teams.away.name}`)
      }
    }
  }

  console.log(`📊 Filtrado completado:`)
  console.log(`   - Partidos de HOY: ${todayMatches.length}`)
  console.log(`   - Partidos de AYER finalizados: ${yesterdayFinishedMatches.length}`)

  // Guardar partidos de ayer automáticamente
  let savedYesterdayCount = 0
  if (yesterdayFinishedMatches.length > 0) {
    console.log(`💾 Guardando ${yesterdayFinishedMatches.length} partidos de ayer...`)

    for (const match of yesterdayFinishedMatches) {
      const saved = await DatabaseService.saveMatch(match)
      if (saved) {
        savedYesterdayCount++
      }
    }

    console.log(`✅ Partidos de ayer guardados: ${savedYesterdayCount}/${yesterdayFinishedMatches.length}`)
  }

  return {
    todayMatches,
    savedYesterdayCount,
  }
}
