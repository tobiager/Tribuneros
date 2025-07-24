import { type NextRequest, NextResponse } from "next/server"
import { apiFootball } from "@/lib/api-football"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date")
    const team = searchParams.get("team")
    const league = searchParams.get("league")

    let matches = []

    if (date) {
      matches = await apiFootball.getMatchesByDate(date)
    } else if (league) {
      const season = new Date().getFullYear()
      matches = await apiFootball.getMatchesByLeague(Number.parseInt(league), season)
    } else {
      // Default: get recent matches
      matches = await apiFootball.getRecentMatches(20)
    }

    return NextResponse.json({ matches })
  } catch (error) {
    console.error("Error searching matches:", error)
    return NextResponse.json({ error: "Error fetching matches" }, { status: 500 })
  }
}
