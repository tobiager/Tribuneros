// Mock Football API Service - Simulates API-Football/Football-Data.org

export interface League {
  id: number
  name: string
  country: string
  logo: string
  season: number
}

export interface Team {
  id: number
  name: string
  logo: string
  country: string
  founded: number
  venue?: string
}

export interface Match {
  id: number
  date: string
  time: string
  homeTeam: Team
  awayTeam: Team
  homeScore: number | null
  awayScore: number | null
  status: "scheduled" | "live" | "finished"
  league: League
  venue: string
  round?: string
}

export interface MatchDetails extends Match {
  events: Array<{
    type: "goal" | "card" | "substitution"
    time: number
    player: string
    team: "home" | "away"
    detail?: string
  }>
  stats: {
    possession: { home: number; away: number }
    shots: { home: number; away: number }
    shotsOnTarget: { home: number; away: number }
  }
}

// Mock data
const leagues: League[] = [
  { id: 1, name: "Liga Profesional", country: "Argentina", logo: "🇦🇷", season: 2024 },
  { id: 2, name: "Copa Libertadores", country: "South America", logo: "🏆", season: 2024 },
  { id: 3, name: "Premier League", country: "England", logo: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", season: 2024 },
  { id: 4, name: "La Liga", country: "Spain", logo: "🇪🇸", season: 2024 },
  { id: 5, name: "Champions League", country: "Europe", logo: "⭐", season: 2024 },
  { id: 6, name: "Copa del Mundo", country: "FIFA", logo: "🌍", season: 2022 },
]

const teams: Team[] = [
  { id: 1, name: "River Plate", logo: "🔴⚪", country: "Argentina", founded: 1901, venue: "Monumental" },
  { id: 2, name: "Boca Juniors", logo: "🔵🟡", country: "Argentina", founded: 1905, venue: "La Bombonera" },
  { id: 3, name: "Racing Club", logo: "⚫⚪", country: "Argentina", founded: 1903, venue: "Cilindro" },
  { id: 4, name: "Independiente", logo: "🔴", country: "Argentina", founded: 1905, venue: "Libertadores de América" },
  { id: 5, name: "Argentina", logo: "🇦🇷", country: "Argentina", founded: 1893, venue: "Various" },
  { id: 6, name: "Francia", logo: "🇫🇷", country: "France", founded: 1904, venue: "Various" },
  { id: 7, name: "Real Madrid", logo: "⚪", country: "Spain", founded: 1902, venue: "Santiago Bernabéu" },
  { id: 8, name: "Barcelona", logo: "🔵🔴", country: "Spain", founded: 1899, venue: "Camp Nou" },
  { id: 9, name: "Manchester City", logo: "🔵", country: "England", founded: 1880, venue: "Etihad Stadium" },
  { id: 10, name: "Liverpool", logo: "🔴", country: "England", founded: 1892, venue: "Anfield" },
  { id: 11, name: "Brasil", logo: "🇧🇷", country: "Brazil", founded: 1914, venue: "Various" },
  { id: 12, name: "Talleres", logo: "⚫⚪", country: "Argentina", founded: 1913, venue: "Mario Alberto Kempes" },
]

const matches: Match[] = [
  {
    id: 1,
    date: "2022-12-18",
    time: "16:00",
    homeTeam: teams[4], // Argentina
    awayTeam: teams[5], // Francia
    homeScore: 3,
    awayScore: 3,
    status: "finished",
    league: leagues[5], // Copa del Mundo
    venue: "Lusail Stadium",
    round: "Final",
  },
  {
    id: 2,
    date: "2023-10-15",
    time: "17:00",
    homeTeam: teams[1], // Boca
    awayTeam: teams[0], // River
    homeScore: 2,
    awayScore: 1,
    status: "finished",
    league: leagues[0], // Liga Profesional
    venue: "La Bombonera",
    round: "Fecha 25",
  },
  {
    id: 3,
    date: "2023-10-28",
    time: "21:00",
    homeTeam: teams[6], // Real Madrid
    awayTeam: teams[7], // Barcelona
    homeScore: 2,
    awayScore: 1,
    status: "finished",
    league: leagues[3], // La Liga
    venue: "Santiago Bernabéu",
    round: "Jornada 11",
  },
  {
    id: 4,
    date: "2023-11-21",
    time: "21:30",
    homeTeam: teams[4], // Argentina
    awayTeam: teams[10], // Brasil
    homeScore: 1,
    awayScore: 0,
    status: "finished",
    league: { id: 7, name: "Eliminatorias", country: "South America", logo: "🌎", season: 2024 },
    venue: "Maracaná",
    round: "Fecha 5",
  },
  {
    id: 5,
    date: "2024-01-15",
    time: "19:00",
    homeTeam: teams[8], // Manchester City
    awayTeam: teams[9], // Liverpool
    homeScore: null,
    awayScore: null,
    status: "scheduled",
    league: leagues[2], // Premier League
    venue: "Etihad Stadium",
    round: "Matchday 21",
  },
  {
    id: 6,
    date: "2023-12-10",
    time: "17:00",
    homeTeam: teams[0], // River
    awayTeam: teams[2], // Racing
    homeScore: 3,
    awayScore: 1,
    status: "finished",
    league: leagues[0], // Liga Profesional
    venue: "Monumental",
    round: "Fecha 27",
  },
]

// API Functions
export class FootballAPI {
  static async getRecentMatches(limit = 10): Promise<Match[]> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return matches
      .filter((match) => match.status === "finished")
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit)
  }

  static async getUpcomingMatches(limit = 10): Promise<Match[]> {
    await new Promise((resolve) => setTimeout(resolve, 500))

    return matches
      .filter((match) => match.status === "scheduled")
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit)
  }

  static async searchMatches(query: string): Promise<Match[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    const searchTerm = query.toLowerCase()
    return matches.filter(
      (match) =>
        match.homeTeam.name.toLowerCase().includes(searchTerm) ||
        match.awayTeam.name.toLowerCase().includes(searchTerm) ||
        match.league.name.toLowerCase().includes(searchTerm) ||
        match.venue.toLowerCase().includes(searchTerm),
    )
  }

  static async getMatchById(id: number): Promise<MatchDetails | null> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    const match = matches.find((m) => m.id === id)
    if (!match) return null

    // Add mock details
    return {
      ...match,
      events: [
        { type: "goal", time: 23, player: "Lionel Messi", team: "home", detail: "Penalty" },
        { type: "goal", time: 36, player: "Ángel Di María", team: "home" },
        { type: "card", time: 45, player: "Aurélien Tchouaméni", team: "away", detail: "Yellow" },
      ],
      stats: {
        possession: { home: 52, away: 48 },
        shots: { home: 14, away: 12 },
        shotsOnTarget: { home: 7, away: 5 },
      },
    }
  }

  static async getTeams(query?: string): Promise<Team[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    if (!query) return teams

    const searchTerm = query.toLowerCase()
    return teams.filter(
      (team) => team.name.toLowerCase().includes(searchTerm) || team.country.toLowerCase().includes(searchTerm),
    )
  }

  static async getLeagues(): Promise<League[]> {
    await new Promise((resolve) => setTimeout(resolve, 200))
    return leagues
  }

  static async getMatchesByTeam(teamId: number): Promise<Match[]> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    return matches.filter((match) => match.homeTeam.id === teamId || match.awayTeam.id === teamId)
  }

  static async getMatchesByLeague(leagueId: number): Promise<Match[]> {
    await new Promise((resolve) => setTimeout(resolve, 400))

    return matches.filter((match) => match.league.id === leagueId)
  }

  static async getMatchesByDate(date: string): Promise<Match[]> {
    await new Promise((resolve) => setTimeout(resolve, 300))

    return matches.filter((match) => match.date === date)
  }
}
