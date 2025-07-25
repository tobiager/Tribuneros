const API_KEY = process.env.NEXT_PUBLIC_API_FOOTBALL_KEY
const BASE_URL = "https://v3.football.api-sports.io"

if (!API_KEY) {
  console.warn("API Football key not found. Using mock data.")
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
    const mockMatch: ApiFootballMatch = {
      fixture: {
        id: 1,
        date: new Date().toISOString(),
        status: { short: "FT", long: "Match Finished" },
        venue: { id: 1, name: "Estadio Monumental", city: "Buenos Aires" },
      },
      league: {
        id: 1,
        name: "Liga Profesional Argentina",
        country: "Argentina",
        logo: "/placeholder.svg",
        season: 2024,
        round: "Fecha 15",
      },
      teams: {
        home: { id: 1, name: "River Plate", logo: "/placeholder.svg" },
        away: { id: 2, name: "Boca Juniors", logo: "/placeholder.svg" },
      },
      goals: { home: 2, away: 1 },
    }

    return {
      response: [mockMatch, { ...mockMatch, fixture: { ...mockMatch.fixture, id: 2 } }],
    }
  }

  async getTodayMatches(): Promise<ApiFootballMatch[]> {
    const today = new Date().toISOString().split("T")[0]
    const data = await this.makeRequest(`/fixtures?date=${today}`)
    return data.response || []
  }

  async getFeaturedMatches(): Promise<ApiFootballMatch[]> {
    const leagues = [39, 140, 78, 61, 135] // Premier League, La Liga, Bundesliga, Ligue 1, Serie A
    const season = new Date().getFullYear()

    try {
      const promises = leagues.map((league) => this.makeRequest(`/fixtures?league=${league}&season=${season}&last=5`))

      const results = await Promise.all(promises)
      const allMatches = results.flatMap((result) => result.response || [])

      return allMatches.slice(0, 10)
    } catch (error) {
      console.error("Error fetching featured matches:", error)
      const mockData = this.getMockData("/fixtures")
      return mockData.response || []
    }
  }

  async searchMatches(query: string): Promise<ApiFootballMatch[]> {
    try {
      const data = await this.makeRequest(`/fixtures?search=${encodeURIComponent(query)}`)
      return data.response || []
    } catch (error) {
      console.error("Error searching matches:", error)
      return []
    }
  }
}

export const apiFootballService = new ApiFootballService()
