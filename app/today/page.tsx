"use client"

import { useEffect, useState } from "react"
import { Calendar, Clock, MapPin, Star, Bell, BellOff, Filter, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NavbarEnhanced from "@/components/navbar-enhanced"
import { useAuth } from "@/lib/auth"
import { apiFootball, type ApiMatch } from "@/lib/api-football"

export default function TodayPage() {
  const { user } = useAuth()
  const [todayMatches, setTodayMatches] = useState<ApiMatch[]>([])
  const [favoriteTeamMatches, setFavoriteTeamMatches] = useState<ApiMatch[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [notifications, setNotifications] = useState<Set<number>>(new Set())
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Mock user favorite teams - in real app, get from user profile
  const favoriteTeams = ["Real Madrid", "Barcelona", "Argentina", "River Plate", "Boca Juniors"]

  useEffect(() => {
    loadTodayMatches()
  }, [])

  const loadTodayMatches = async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split("T")[0]
      const matches = await apiFootball.getMatchesByDate(today)

      setTodayMatches(matches)

      // Filter matches for favorite teams
      const favoriteMatches = matches.filter(
        (match) => favoriteTeams.includes(match.teams.home.name) || favoriteTeams.includes(match.teams.away.name),
      )
      setFavoriteTeamMatches(favoriteMatches)
    } catch (error) {
      console.error("Error loading today matches:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadTodayMatches()
    setRefreshing(false)
  }

  const toggleNotification = (matchId: number) => {
    const newNotifications = new Set(notifications)
    if (newNotifications.has(matchId)) {
      newNotifications.delete(matchId)
    } else {
      newNotifications.add(matchId)
    }
    setNotifications(newNotifications)
  }

  const getFilteredMatches = (matches: ApiMatch[]) => {
    if (filterStatus === "all") return matches
    if (filterStatus === "live") return matches.filter((m) => m.fixture.status.short === "LIVE")
    if (filterStatus === "upcoming") return matches.filter((m) => m.fixture.status.short === "NS")
    if (filterStatus === "finished") return matches.filter((m) => m.fixture.status.short === "FT")
    return matches
  }

  const MatchCard = ({ match, isFavorite = false }: { match: ApiMatch; isFavorite?: boolean }) => {
    const isLive = match.fixture.status.short === "LIVE"
    const isFinished = match.fixture.status.short === "FT"
    const matchTime = new Date(match.fixture.date)
    const hasNotification = notifications.has(match.fixture.id)

    return (
      <Card
        className={`bg-gray-900 border-gray-800 hover:border-green-500/50 transition-all ${isFavorite ? "ring-2 ring-green-500/30" : ""}`}
      >
        <CardContent className="p-4">
          {/* Match Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge
                variant="secondary"
                className={`text-xs ${
                  isLive
                    ? "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
                    : "bg-green-500/20 text-green-400 border-green-500/30"
                }`}
              >
                {match.league.name}
              </Badge>
              {isFavorite && (
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Favorito
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isLive && <Badge className="bg-red-500 text-white text-xs animate-pulse">EN VIVO</Badge>}
              <div className="text-xs text-gray-500">
                {matchTime.toLocaleTimeString("es-AR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="text-center">
                <img
                  src={match.teams.home.logo || "/placeholder.svg"}
                  alt={match.teams.home.name}
                  className="w-10 h-10 mx-auto mb-2 object-contain"
                />
                <div className="font-medium text-sm text-gray-300 truncate max-w-[80px]">{match.teams.home.name}</div>
              </div>
            </div>

            <div className="text-center px-6">
              {isFinished || isLive ? (
                <div className="text-2xl font-bold text-white">
                  {match.goals.home} - {match.goals.away}
                </div>
              ) : (
                <div className="text-lg text-gray-400">VS</div>
              )}
              <div className="text-xs text-gray-500 uppercase">
                {isLive ? "En vivo" : isFinished ? "Final" : "Programado"}
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <div className="text-center">
                <img
                  src={match.teams.away.logo || "/placeholder.svg"}
                  alt={match.teams.away.name}
                  className="w-10 h-10 mx-auto mb-2 object-contain"
                />
                <div className="font-medium text-sm text-gray-300 truncate max-w-[80px]">{match.teams.away.name}</div>
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{match.fixture.venue.name}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{match.fixture.status.long}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Ver detalles
            </Button>

            {!isFinished && user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleNotification(match.fixture.id)}
                className={`p-2 ${
                  hasNotification ? "text-green-500 hover:text-green-400" : "text-gray-400 hover:text-green-500"
                }`}
              >
                {hasNotification ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavbarEnhanced />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Cargando partidos de hoy...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavbarEnhanced />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Partidos de Hoy</h1>
            <p className="text-gray-400">
              {new Date().toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 bg-gray-900 border-gray-700 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="live">En vivo</SelectItem>
                <SelectItem value="upcoming">Por jugar</SelectItem>
                <SelectItem value="finished">Finalizados</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
              Actualizar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="favorites" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-800/50 h-12 rounded-xl">
            <TabsTrigger
              value="favorites"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              <Star className="h-4 w-4 mr-2" />
              Tus Equipos
            </TabsTrigger>
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Todos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Partidos de tus equipos favoritos</h2>
              <span className="text-sm text-gray-400">{getFilteredMatches(favoriteTeamMatches).length} partidos</span>
            </div>

            {getFilteredMatches(favoriteTeamMatches).length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2">
                {getFilteredMatches(favoriteTeamMatches).map((match) => (
                  <MatchCard key={match.fixture.id} match={match} isFavorite={true} />
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-12 text-center">
                  <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No hay partidos de tus equipos hoy</h3>
                  <p className="text-gray-400 mb-6">
                    Tus equipos favoritos no juegan hoy. Podés ver todos los partidos en la pestaña "Todos".
                  </p>
                  <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">
                    Configurar equipos favoritos
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Todos los partidos de hoy</h2>
              <span className="text-sm text-gray-400">{getFilteredMatches(todayMatches).length} partidos</span>
            </div>

            {getFilteredMatches(todayMatches).length > 0 ? (
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {getFilteredMatches(todayMatches).map((match) => (
                  <MatchCard key={match.fixture.id} match={match} />
                ))}
              </div>
            ) : (
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-12 text-center">
                  <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No hay partidos programados</h3>
                  <p className="text-gray-400">
                    No se encontraron partidos para el filtro seleccionado. Intenta con otro filtro.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
