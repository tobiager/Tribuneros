"use client"

import { useState, useEffect } from "react"
import { Search, Users, Trophy, MapPin, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { apiFootball, type ApiMatch } from "@/lib/api-football"

interface SearchUser {
  id: string
  username: string
  name: string
  avatar_url: string
  bio: string
  matches_count: number
  favorite_team: string
}

interface SearchFilters {
  query: string
  team: string
  user: string
  dateFrom: string
  dateTo: string
  tournament: string
  venue: string
}

export default function SearchPage() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    team: "",
    user: "",
    dateFrom: "",
    dateTo: "",
    tournament: "",
    venue: "",
  })
  const [searchResults, setSearchResults] = useState<{
    matches: ApiMatch[]
    users: SearchUser[]
  }>({
    matches: [],
    users: [],
  })
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("matches")

  // Mock users data
  const mockUsers: SearchUser[] = [
    {
      id: "1",
      username: "futbolero_arg",
      name: "Carlos Futbolero",
      avatar_url: "/placeholder.svg?height=40&width=40",
      bio: "Hincha de River desde siempre 🔴⚪",
      matches_count: 1247,
      favorite_team: "River Plate",
    },
    {
      id: "2",
      username: "messi_fan",
      name: "Ana Messi",
      avatar_url: "/placeholder.svg?height=40&width=40",
      bio: "GOAT 🐐 | Barcelona y Argentina ❤️",
      matches_count: 892,
      favorite_team: "Barcelona",
    },
  ]

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      if (filters.query.trim() || filters.team || filters.dateFrom) {
        handleSearch()
      }
    }, 500)

    return () => clearTimeout(debounceTimer)
  }, [filters])

  const handleSearch = async () => {
    setLoading(true)
    try {
      let matches: ApiMatch[] = []

      // Search matches
      if (filters.dateFrom) {
        matches = await apiFootball.getMatchesByDate(filters.dateFrom)
      } else if (filters.query.trim()) {
        const response = await fetch(`/api/matches/search?team=${filters.query}`)
        const data = await response.json()
        matches = data.matches || []
      } else {
        matches = await apiFootball.getRecentMatches(20)
      }

      // Filter matches by additional criteria
      if (filters.team) {
        matches = matches.filter(
          (match) =>
            match.teams.home.name.toLowerCase().includes(filters.team.toLowerCase()) ||
            match.teams.away.name.toLowerCase().includes(filters.team.toLowerCase()),
        )
      }

      if (filters.tournament) {
        matches = matches.filter((match) => match.league.name.toLowerCase().includes(filters.tournament.toLowerCase()))
      }

      if (filters.venue) {
        matches = matches.filter((match) =>
          match.fixture.venue.name.toLowerCase().includes(filters.venue.toLowerCase()),
        )
      }

      // Search users (mock)
      let users = mockUsers
      if (filters.query.trim()) {
        users = mockUsers.filter(
          (user) =>
            user.username.toLowerCase().includes(filters.query.toLowerCase()) ||
            user.name.toLowerCase().includes(filters.query.toLowerCase()) ||
            user.favorite_team.toLowerCase().includes(filters.query.toLowerCase()),
        )
      }

      setSearchResults({ matches, users })
    } catch (error) {
      console.error("Error searching:", error)
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      query: "",
      team: "",
      user: "",
      dateFrom: "",
      dateTo: "",
      tournament: "",
      venue: "",
    })
    setSearchResults({ matches: [], users: [] })
  }

  const MatchResult = ({ match }: { match: ApiMatch }) => {
    const isFinished = match.fixture.status.short === "FT"
    const matchDate = new Date(match.fixture.date)

    return (
      <Card className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
              {match.league.name}
            </Badge>
            <div className="text-xs text-gray-500">{matchDate.toLocaleDateString("es-AR")}</div>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-center">
                <img
                  src={match.teams.home.logo || "/placeholder.svg"}
                  alt={match.teams.home.name}
                  className="w-8 h-8 mx-auto mb-1 object-contain"
                />
                <div className="font-medium text-sm text-gray-300 truncate max-w-[80px]">{match.teams.home.name}</div>
              </div>
            </div>

            <div className="text-center px-4">
              {isFinished ? (
                <div className="text-xl font-bold text-white">
                  {match.goals.home} - {match.goals.away}
                </div>
              ) : (
                <div className="text-sm text-gray-400">
                  {matchDate.toLocaleTimeString("es-AR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="text-center">
                <img
                  src={match.teams.away.logo || "/placeholder.svg"}
                  alt={match.teams.away.name}
                  className="w-8 h-8 mx-auto mb-1 object-contain"
                />
                <div className="font-medium text-sm text-gray-300 truncate max-w-[80px]">{match.teams.away.name}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{match.fixture.venue.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{match.fixture.status.long}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const UserResult = ({ user }: { user: SearchUser }) => (
    <Card className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
            <AvatarFallback className="bg-green-600 text-black font-semibold">
              {user.name[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-white">{user.name}</span>
              <span className="text-sm text-gray-400">@{user.username}</span>
            </div>
            <p className="text-sm text-gray-300 mb-2 line-clamp-2">{user.bio}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>❤️ {user.favorite_team}</span>
              <span>{user.matches_count} partidos</span>
            </div>
          </div>

          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black font-semibold">
            Seguir
          </Button>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-4">
            Búsqueda <span className="text-green-500">Avanzada</span>
          </h1>
          <p className="text-gray-400">Encuentra partidos, usuarios, equipos y más con filtros específicos</p>
        </div>

        {/* Search Form */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardContent className="p-6">
            <div className="space-y-6">
              {/* Main Search */}
              <div>
                <Label htmlFor="search" className="text-white mb-2 block">
                  Búsqueda general
                </Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <Input
                    id="search"
                    placeholder="Buscar equipos, usuarios, torneos..."
                    value={filters.query}
                    onChange={(e) => setFilters({ ...filters, query: e.target.value })}
                    className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
                  />
                </div>
              </div>

              {/* Advanced Filters */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="team" className="text-white mb-2 block">
                    Equipo específico
                  </Label>
                  <Input
                    id="team"
                    placeholder="Ej: River Plate, Barcelona..."
                    value={filters.team}
                    onChange={(e) => setFilters({ ...filters, team: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <Label htmlFor="tournament" className="text-white mb-2 block">
                    Torneo
                  </Label>
                  <Input
                    id="tournament"
                    placeholder="Ej: Liga Profesional, Champions..."
                    value={filters.tournament}
                    onChange={(e) => setFilters({ ...filters, tournament: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <Label htmlFor="venue" className="text-white mb-2 block">
                    Estadio
                  </Label>
                  <Input
                    id="venue"
                    placeholder="Ej: Monumental, Camp Nou..."
                    value={filters.venue}
                    onChange={(e) => setFilters({ ...filters, venue: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
                  />
                </div>

                <div>
                  <Label htmlFor="dateFrom" className="text-white mb-2 block">
                    Fecha desde
                  </Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white focus:border-green-500"
                  />
                </div>

                <div>
                  <Label htmlFor="dateTo" className="text-white mb-2 block">
                    Fecha hasta
                  </Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                    className="bg-gray-800 border-gray-700 text-white focus:border-green-500"
                  />
                </div>

                <div className="flex items-end">
                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="w-full border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    Limpiar filtros
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {(searchResults.matches.length > 0 || searchResults.users.length > 0 || loading) && (
          <div className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-800/50 h-12 rounded-xl">
                <TabsTrigger
                  value="matches"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  Partidos ({searchResults.matches.length})
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Usuarios ({searchResults.users.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="matches" className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Buscando partidos...</p>
                  </div>
                ) : searchResults.matches.length > 0 ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {searchResults.matches.map((match) => (
                      <MatchResult key={match.fixture.id} match={match} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No se encontraron partidos con estos filtros</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="users" className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Buscando usuarios...</p>
                  </div>
                ) : searchResults.users.length > 0 ? (
                  <div className="grid gap-4 lg:grid-cols-2">
                    {searchResults.users.map((user) => (
                      <UserResult key={user.id} user={user} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No se encontraron usuarios con estos filtros</p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Empty State */}
        {!loading && searchResults.matches.length === 0 && searchResults.users.length === 0 && !filters.query && (
          <div className="text-center py-16">
            <Search className="h-24 w-24 text-gray-600 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-white mb-4">Comenzá tu búsqueda</h3>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Usa los filtros de arriba para encontrar partidos específicos, usuarios de la comunidad, equipos favoritos
              y mucho más.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
