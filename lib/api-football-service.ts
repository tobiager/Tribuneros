const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY
const BASE_URL = "https://v3.football.api-sports.io"

if (!API_KEY) {
  console.warn("API Football key not found. Using mock data.")
}

// Ligas permitidas - IDs específicos de la API Football
const ALLOWED_LEAGUES = {
  // Argentina
  128: "Liga Profesional Argentina",
  129: "Primera Nacional",
  130: "Copa Argentina",
  131: "Copa de la Liga",
  132: "Primera B Metro",
  133: "Federal A",
  134: "Primera C",
  135: "Promocional Amateur",

  // Brasil
  71: "Brasileirão Serie A",

  // España
  140: "La Liga",

  // Italia
  135: "Serie A",

  // Inglaterra
  39: "Premier League",

  // Competiciones internacionales
  9: "Copa América",
  1: "Mundial",
  4: "Eurocopa",
  5: "Nations League",
  32: "Eliminatorias Conmebol",
}

export interface ApiFootballMatch {
  fixture: {
    id: number
    date: string
    status: {
      short: string
      long: string
    }
    venue: {
      id: number | null
      name: string | null
      city: string | null
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    season: number
    round: string
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
}

class ApiFootballService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

  private async makeRequest(endpoint: string): Promise<any> {
    if (!API_KEY) {
      return this.getMockData(endpoint)
    }

    const cacheKey = endpoint
    const cached = this.cache.get(cacheKey)

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          "X-RapidAPI-Key": API_KEY,
          "X-RapidAPI-Host": "v3.football.api-sports.io",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      this.cache.set(cacheKey, { data, timestamp: Date.now() })

      return data
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error)
      return this.getMockData(endpoint)
    }
  }

  private getMockData(endpoint: string): any {
    const today = new Date()
    const mockMatches: ApiFootballMatch[] = []

    // Generate mock matches for testing
    for (let i = 0; i < 5; i++) {
      const matchDate = new Date(today)
      matchDate.setDate(today.getDate() + (i - 2)) // Some past, some future

      const mockMatch: ApiFootballMatch = {
        fixture: {
          id: i + 1,
          date: matchDate.toISOString(),
          status: {
            short: i < 2 ? "FT" : i === 2 ? "LIVE" : "NS",
            long: i < 2 ? "Match Finished" : i === 2 ? "Match Live" : "Not Started",
          },
          venue: { id: 1, name: "Estadio Monumental", city: "Buenos Aires" },
        },
        league: {
          id: 128, // Liga Profesional Argentina
          name: "Liga Profesional Argentina",
          country: "Argentina",
          logo: "/placeholder.svg",
          season: 2024,
          round: `Fecha ${15 + i}`,
        },
        teams: {
          home: { id: 1, name: "River Plate", logo: "/placeholder.svg" },
          away: { id: 2, name: "Boca Juniors", logo: "/placeholder.svg" },
        },
        goals: {
          home: i < 2 ? Math.floor(Math.random() * 3) : null,
          away: i < 2 ? Math.floor(Math.random() * 3) : null,
        },
      }
      mockMatches.push(mockMatch)
    }

    return {
      response: mockMatches,
    }
  }

  private filterAllowedLeagues(matches: ApiFootballMatch[]): ApiFootballMatch[] {
    const allowedLeagueIds = Object.keys(ALLOWED_LEAGUES).map((id) => Number.parseInt(id))
    return matches.filter((match) => allowedLeagueIds.includes(match.league.id))
  }

  async getMatchesByDate(date: string): Promise<ApiFootballMatch[]> {
    const data = await this.makeRequest(`/fixtures?date=${date}`)
    const matches = data.response || []
    return this.filterAllowedLeagues(matches)
  }

  async getMatchesByDateRange(from: string, to: string): Promise<ApiFootballMatch[]> {
    const data = await this.makeRequest(`/fixtures?from=${from}&to=${to}`)
    const matches = data.response || []
    return this.filterAllowedLeagues(matches)
  }

  async getTodayMatches(): Promise<ApiFootballMatch[]> {
    const today = new Date().toISOString().split("T")[0]
    return this.getMatchesByDate(today)
  }

  async searchMatches(query: string): Promise<ApiFootballMatch[]> {
    try {
      const data = await this.makeRequest(`/fixtures?search=${encodeURIComponent(query)}`)
      const matches = data.response || []
      return this.filterAllowedLeagues(matches)
    } catch (error) {
      console.error("Error searching matches:", error)
      return []
    }
  }

  // Helper method to check if a league is allowed
  isLeagueAllowed(leagueId: number): boolean {
    return Object.keys(ALLOWED_LEAGUES)
      .map((id) => Number.parseInt(id))
      .includes(leagueId)
  }

  // Get list of allowed leagues
  getAllowedLeagues(): typeof ALLOWED_LEAGUES {
    return ALLOWED_LEAGUES
  }
}

export const apiFootballService = new ApiFootballService()
