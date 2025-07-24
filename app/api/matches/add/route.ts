import { type NextRequest, NextResponse } from "next/server"
import { Database } from "@/lib/database"
import { apiFootball } from "@/lib/api-football"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, api_match_id, comentario, puntaje, contexto, emocion } = body

    // Validate required fields
    if (!user_id || !api_match_id || !puntaje) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate puntaje range
    if (puntaje < 1 || puntaje > 10) {
      return NextResponse.json({ error: "Puntaje must be between 1 and 10" }, { status: 400 })
    }

    // Get match details from API-Football to save team/stadium info
    try {
      const matchDetails = await apiFootball.getMatchById(api_match_id)

      // Save teams if they don't exist
      await Database.saveTeam({
        id: matchDetails.teams.home.id,
        nombre: matchDetails.teams.home.name,
        escudo_url: matchDetails.teams.home.logo,
        pais: matchDetails.league.country,
      })

      await Database.saveTeam({
        id: matchDetails.teams.away.id,
        nombre: matchDetails.teams.away.name,
        escudo_url: matchDetails.teams.away.logo,
        pais: matchDetails.league.country,
      })

      // Save stadium if it doesn't exist
      if (matchDetails.fixture.venue.id) {
        await Database.saveStadium({
          id: matchDetails.fixture.venue.id,
          nombre: matchDetails.fixture.venue.name,
          ciudad: matchDetails.fixture.venue.city,
          pais: matchDetails.league.country,
        })
      }
    } catch (apiError) {
      console.error("Error fetching match details:", apiError)
      // Continue anyway, we can still save the user's match
    }

    // Save the match seen
    const matchSeen = await Database.addMatchSeen({
      user_id,
      api_match_id,
      comentario,
      puntaje,
      contexto: contexto || "TV",
      emocion,
    })

    return NextResponse.json({ success: true, data: matchSeen })
  } catch (error) {
    console.error("Error adding match:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
