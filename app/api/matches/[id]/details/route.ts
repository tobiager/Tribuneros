import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const matchId = params.id
    const apiKey = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "API key not configured" }, { status: 500 })
    }

    // Obtener detalles del partido desde API-Football
    const [fixturesResponse, lineupResponse, eventsResponse, statisticsResponse] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/fixtures?id=${matchId}`, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "v3.football.api-sports.io",
        },
      }),
      fetch(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${matchId}`, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "v3.football.api-sports.io",
        },
      }),
      fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "v3.football.api-sports.io",
        },
      }),
      fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${matchId}`, {
        headers: {
          "X-RapidAPI-Key": apiKey,
          "X-RapidAPI-Host": "v3.football.api-sports.io",
        },
      }),
    ])

    const [fixturesData, lineupData, eventsData, statisticsData] = await Promise.all([
      fixturesResponse.json(),
      lineupResponse.json(),
      eventsResponse.json(),
      statisticsResponse.json(),
    ])

    // Procesar los datos
    const fixture = fixturesData.response?.[0]
    const lineups = lineupData.response || []
    const events = eventsData.response || []
    const statistics = statisticsData.response || []

    // Extraer información específica
    const goals = events.filter((event: any) => event.type === "Goal")
    const cards = events.filter((event: any) => event.type === "Card")
    const substitutions = events.filter((event: any) => event.type === "subst")

    const matchDetails = {
      home_formation: lineups[0]?.formation,
      away_formation: lineups[1]?.formation,
      home_lineup: lineups[0]?.startXI || [],
      away_lineup: lineups[1]?.startXI || [],
      goals,
      cards,
      substitutions,
      statistics,
      events,
    }

    return NextResponse.json(matchDetails)
  } catch (error) {
    console.error("Error fetching match details:", error)
    return NextResponse.json({ error: "Failed to fetch match details" }, { status: 500 })
  }
}
