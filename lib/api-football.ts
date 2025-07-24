// API-Football integration
const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY!
const BASE_URL = "https://v3.football.api-sports.io"

export interface ApiMatch {
  fixture: {
    id: number
    date: string
    status: {
      long: string
      short: string
    }
    venue: {
      id: number
      name: string
      city: string
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
    }
    away: {
      id: number
      name: string
      logo: string
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
  score: {
    halftime: {
      home: number | null
      away: number | null
    }
    fulltime: {
      home: number | null
      away: number | null
    }
  }
}

export interface ApiTeam {
  team: {
    id: number
    name: string
    logo: string
    country: string
  }
  venue: {
    id: number
    name: string
    city: string
    capacity: number
  }
}

class ApiFootball {
  private async request(endpoint: string, params: Record<string, any> = {}) {
    const url = new URL(`${BASE_URL}${endpoint}`)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.append(key, value.toString())
      }
    })

    const response = await fetch(url.toString(), {
      headers: {
        "X-RapidAPI-Key": API_KEY,
        "X-RapidAPI-Host": "v3.football.api-sports.io",
      },
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()
    return data.response
  }

  async getMatchesByDate(date: string): Promise<ApiMatch[]> {
    return this.request("/fixtures", { date })
  }

  async getMatchesByLeague(leagueId: number, season: number): Promise<ApiMatch[]> {
    return this.request("/fixtures", { league: leagueId, season })
  }

  async getMatchById(matchId: number): Promise<ApiMatch> {
    const matches = await this.request("/fixtures", { id: matchId })
    return matches[0]
  }

  async searchTeams(query: string): Promise<ApiTeam[]> {
    return this.request("/teams", { search: query })
  }

  async getTeamById(teamId: number): Promise<ApiTeam> {
    const teams = await this.request("/teams", { id: teamId })
    return teams[0]
  }

  async getRecentMatches(limit = 20): Promise<ApiMatch[]> {
    const today = new Date()
    const dates = []

    // Get matches from last 7 days
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      dates.push(date.toISOString().split("T")[0])
    }

    const allMatches: ApiMatch[] = []

    for (const date of dates) {
      try {
        const matches = await this.getMatchesByDate(date)
        allMatches.push(...matches.filter((m) => m.fixture.status.short === "FT"))
        if (allMatches.length >= limit) break
      } catch (error) {
        console.error(`Error fetching matches for ${date}:`, error)
      }
    }

    return allMatches.slice(0, limit)
  }

  // Popular leagues IDs for trending
  async getTrendingMatches(): Promise<ApiMatch[]> {
    const popularLeagues = [39, 140, 78, 61, 2] // Premier, La Liga, Bundesliga, Ligue 1, Champions
    const currentSeason = new Date().getFullYear()

    const allMatches: ApiMatch[] = []

    for (const leagueId of popularLeagues) {
      try {
        const matches = await this.getMatchesByLeague(leagueId, currentSeason)
        const recentFinished = matches.filter((m) => m.fixture.status.short === "FT").slice(0, 5)
        allMatches.push(...recentFinished)
      } catch (error) {
        console.error(`Error fetching league ${leagueId}:`, error)
      }
    }

    return allMatches.slice(0, 20)
  }
}

export const apiFootball = new ApiFootball()
