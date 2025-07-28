"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Calendar,
  Clock,
  MapPin,
  Eye,
  MessageSquare,
  Heart,
  Bell,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Star,
  RefreshCw,
  AlertCircle,
  Database,
  Wifi,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { toggleMatchFavorite, toggleMatchReminder, getUserMatchInteractions } from "@/lib/database-actions"
import { DatabaseService, processMatchesWithTimezone } from "@/lib/database-service"
import { apiFootballService } from "@/lib/api-football-service"
import {
  getArgentinaDate,
  formatArgentinaDate,
  getDateLabel,
  isSameDayArgentina,
  isPastDate,
  isFutureDate,
  formatDateDisplay,
  formatTimeDisplay,
} from "@/lib/timezone-utils"
import { ARGENTINA_TIMEZONE } from "@/lib/constants"
import MatchModal from "@/components/match-modal"
import AuthModal from "@/components/auth-modal"
import AddManualMatchModal from "@/components/add-manual-match-modal"
import type { ApiFootballMatch, UserMatchInteractions } from "@/lib/types"

interface PartidosClientProps {
  initialTodayMatches: ApiFootballMatch[]
  initialFeaturedMatches: any[]
}

export default function PartidosClient({ initialTodayMatches, initialFeaturedMatches }: PartidosClientProps) {
  const { user, loading: authLoading } = useAuth()
  const [selectedMatch, setSelectedMatch] = useState<ApiFootballMatch | null>(null)
  const [modalType, setModalType] = useState<"view" | "opinion" | "opinions-list" | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showManualMatchModal, setShowManualMatchModal] = useState(false)
  const [userInteractions, setUserInteractions] = useState<UserMatchInteractions>({
    views: [],
    opinions: [],
    favorites: [],
    reminders: [],
  })
  const [loadingInteractions, setLoadingInteractions] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // State for date navigation and matches - usando fecha argentina
  const [currentDate, setCurrentDate] = useState(getArgentinaDate())
  const [currentMatches, setCurrentMatches] = useState<(ApiFootballMatch | any)[]>([])
  const [featuredMatches, setFeaturedMatches] = useState(initialFeaturedMatches)
  const [loadingMatches, setLoadingMatches] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())

  useEffect(() => {
    if (user && !authLoading) {
      loadUserInteractions()
      checkAdminStatus()
    }
  }, [user, authLoading, currentMatches, featuredMatches])

  useEffect(() => {
    loadMatchesForDate(currentDate)
  }, [currentDate])

  // Initialize with today's data
  useEffect(() => {
    const argentinaToday = getArgentinaDate()
    if (isSameDayArgentina(currentDate, argentinaToday)) {
      setCurrentMatches(initialTodayMatches)
    }
  }, [initialTodayMatches, currentDate])

  // Initialize featured matches
  useEffect(() => {
    setFeaturedMatches(initialFeaturedMatches)
  }, [initialFeaturedMatches])

  const checkAdminStatus = async () => {
    if (!user) return
    try {
      const adminStatus = await DatabaseService.checkUserIsAdmin(user.id)
      setIsAdmin(adminStatus)
    } catch (error) {
      console.error("Error checking admin status:", error)
      setIsAdmin(false)
    }
  }

  const loadMatchesForDate = async (date: Date = currentDate) => {
    setLoadingMatches(true)
    try {
      const dateStr = formatArgentinaDate(date)
      const argentinaToday = getArgentinaDate()

      console.log(`📅 Cargando partidos para: ${dateStr} (${getDateLabel(date)})`)

      if (isSameDayArgentina(date, argentinaToday)) {
        // Para HOY: usar API externa, filtrar por zona horaria y auto-guardar ayer
        console.log("📡 Consultando API para partidos de HOY con filtro de zona horaria")
        const apiMatches = await apiFootballService.getMatchesByDate(dateStr)

        // Procesar partidos con zona horaria argentina
        const { todayMatches, savedYesterdayCount } = await processMatchesWithTimezone(apiMatches)

        setCurrentMatches(todayMatches)

        if (savedYesterdayCount > 0) {
          toast.success(`${savedYesterdayCount} partidos de ayer guardados automáticamente`)
          // Recargar partidos destacados si se guardaron nuevos
          await refreshFeaturedMatches()
        }

        console.log(`✅ Partidos de HOY filtrados por zona horaria: ${todayMatches.length}`)
      } else if (isPastDate(date)) {
        // Para fechas PASADAS: solo consultar base de datos
        console.log("🗄️ Consultando BD para fecha pasada")
        const dbMatches = await DatabaseService.getMatchesByDate(dateStr)
        setCurrentMatches(dbMatches)
        console.log(`✅ Partidos pasados cargados desde BD: ${dbMatches.length}`)
      } else if (isFutureDate(date)) {
        // Para fechas FUTURAS: usar API externa (hasta 7 días)
        console.log("🔮 Consultando API para fecha futura")
        const apiMatches = await apiFootballService.getMatchesByDate(dateStr)
        setCurrentMatches(apiMatches)
        console.log(`✅ Partidos futuros cargados desde API: ${apiMatches.length}`)
      }
    } catch (error) {
      console.error("Error loading matches for date:", error)
      toast.error("Error al cargar los partidos")
      setCurrentMatches([])
    } finally {
      setLoadingMatches(false)
    }
  }

  const refreshFeaturedMatches = async () => {
    try {
      console.log("🔄 Actualizando partidos destacados...")
      const featuredData = await DatabaseService.getFeaturedMatches()
      setFeaturedMatches(featuredData)
      console.log(`✅ Partidos destacados actualizados: ${featuredData.length}`)
    } catch (error) {
      console.error("Error refreshing featured matches:", error)
    }
  }

  const loadUserInteractions = async () => {
    if (!user) return

    setLoadingInteractions(true)
    try {
      const allMatchIds = [
        ...currentMatches.map((m) => m.fixture?.id || m.id),
        ...featuredMatches.map((m) => m.id),
      ].filter(Boolean)

      if (allMatchIds.length > 0) {
        const result = await getUserMatchInteractions(user.id, allMatchIds)
        if (result.success) {
          setUserInteractions(result.data)
        }
      }
    } catch (error) {
      console.error("Error loading user interactions:", error)
    } finally {
      setLoadingInteractions(false)
    }
  }

  const refreshData = async () => {
    try {
      await Promise.all([loadMatchesForDate(currentDate), refreshFeaturedMatches()])

      if (user) {
        await loadUserInteractions()
      }

      setLastUpdateTime(new Date())
      toast.success("Datos actualizados correctamente")
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast.error("Error al actualizar los datos")
    }
  }

  const handleAction = (match: ApiFootballMatch | any, action: "view" | "opinion" | "opinions-list") => {
    // Verificar autenticación para acciones que la requieren
    if (!user && (action === "view" || action === "opinion")) {
      setShowAuthModal(true)
      return
    }

    setSelectedMatch(match)
    setModalType(action)
  }

  const handleToggleFavorite = async (match: ApiFootballMatch | any) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      const matchId = match.fixture?.id || match.id
      const result = await toggleMatchFavorite(matchId)
      if (result.success) {
        toast.success(result.action === "added" ? "¡Partido agregado a favoritos!" : "Partido removido de favoritos")
        await loadUserInteractions()
      } else {
        toast.error(result.error || "Error al actualizar favorito")
      }
    } catch (error) {
      toast.error("Error inesperado")
    }
  }

  const handleToggleReminder = async (match: ApiFootballMatch | any) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      const matchId = match.fixture?.id || match.id
      const result = await toggleMatchReminder(matchId)
      if (result.success) {
        toast.success(result.action === "enabled" ? "¡Recordatorio activado!" : "Recordatorio desactivado")
        await loadUserInteractions()
      } else {
        toast.error(result.error || "Error al actualizar recordatorio")
      }
    } catch (error) {
      toast.error("Error inesperado")
    }
  }

  const isMatchFavorite = (matchId: number) => {
    return userInteractions.favorites.some((f) => f.match_id === matchId)
  }

  const hasMatchReminder = (matchId: number) => {
    return userInteractions.reminders.some((r) => r.match_id === matchId && r.is_active)
  }

  const hasMatchView = (matchId: number) => {
    return userInteractions.views.some((v) => v.match_id === matchId)
  }

  const hasMatchOpinion = (matchId: number) => {
    return userInteractions.opinions.some((o) => o.match_id === matchId)
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      NS: "Por jugarse",
      "1H": "1er Tiempo",
      HT: "Entretiempo",
      "2H": "2do Tiempo",
      FT: "Finalizado",
      AET: "Finalizado (TE)",
      PEN: "Finalizado (PEN)",
      LIVE: "En Vivo",
      CANC: "Cancelado",
      PST: "Postergado",
    }
    return statusMap[status] || "En Vivo"
  }

  const getStatusColor = (status: string) => {
    if (["1H", "2H", "HT", "LIVE"].includes(status)) return "bg-red-500/20 text-red-400 border-red-500/30 animate-pulse"
    if (["FT", "AET", "PEN"].includes(status)) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (["CANC", "PST"].includes(status)) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    return "bg-blue-500/20 text-blue-400 border-blue-500/30"
  }

  const isMatchFinished = (status: string) => {
    return ["FT", "AET", "PEN"].includes(status)
  }

  const isMatchScheduled = (status: string) => {
    return status === "NS"
  }

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate)
    if (direction === "prev") {
      newDate.setDate(currentDate.getDate() - 1)
    } else {
      newDate.setDate(currentDate.getDate() + 1)
    }

    // Límite: 7 días antes y después de hoy (en hora argentina)
    const argentinaToday = getArgentinaDate()
    const minDate = new Date(argentinaToday)
    minDate.setDate(argentinaToday.getDate() - 7)
    const maxDate = new Date(argentinaToday)
    maxDate.setDate(argentinaToday.getDate() + 7)

    if (newDate >= minDate && newDate <= maxDate) {
      setCurrentDate(newDate)
    }
  }

  const canNavigatePrev = () => {
    const argentinaToday = getArgentinaDate()
    const minDate = new Date(argentinaToday)
    minDate.setDate(argentinaToday.getDate() - 7)
    return currentDate > minDate
  }

  const canNavigateNext = () => {
    const argentinaToday = getArgentinaDate()
    const maxDate = new Date(argentinaToday)
    maxDate.setDate(argentinaToday.getDate() + 7)
    return currentDate < maxDate
  }

  const renderMatchCard = (match: ApiFootballMatch | any, isFromAPI = true) => {
    const matchId = isFromAPI ? match.fixture.id : match.id
    const homeTeam = isFromAPI
      ? match.teams.home
      : match.home_team || { name: match.manual_home_team, logo: "/placeholder.svg" }
    const awayTeam = isFromAPI
      ? match.teams.away
      : match.away_team || { name: match.manual_away_team, logo: "/placeholder.svg" }
    const homeScore = isFromAPI ? match.goals.home : match.home_score
    const awayScore = isFromAPI ? match.goals.away : match.away_score
    const matchDate = isFromAPI ? match.fixture.date : match.match_date
    const status = isFromAPI ? match.fixture.status.short : match.status
    const league = isFromAPI ? match.league : { name: match.league_name, logo: match.league_logo_url }
    const venue = isFromAPI ? match.fixture.venue : { name: match.venue_name }

    return (
      <Card key={matchId} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
        <CardContent className="p-4">
          {/* Header con liga y estado */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <img
                src={league.logo || "/placeholder.svg"}
                alt={league.name}
                className="h-5 w-5 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <span className="text-sm text-gray-400 truncate">{league.name}</span>
            </div>
            <Badge className={`${getStatusColor(status)} flex-shrink-0`}>{getStatusText(status)}</Badge>
          </div>

          {/* Equipos y resultado */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img
                src={homeTeam.logo_url || homeTeam.logo || "/placeholder.svg"}
                alt={homeTeam.name}
                className="h-8 w-8 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <span className="font-semibold text-white truncate text-sm sm:text-base">{homeTeam.name}</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-green-400 px-2 flex-shrink-0">
              {homeScore !== null && awayScore !== null ? `${homeScore} - ${awayScore}` : "VS"}
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="font-semibold text-white truncate text-sm sm:text-base text-right">{awayTeam.name}</span>
              <img
                src={awayTeam.logo_url || awayTeam.logo || "/placeholder.svg"}
                alt={awayTeam.name}
                className="h-8 w-8 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
            </div>
          </div>

          {/* Información del partido */}
          <div className="flex items-center justify-center gap-3 text-xs sm:text-sm text-gray-400 mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatDateDisplay(matchDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatTimeDisplay(matchDate)}</span>
            </div>
            {venue?.name && (
              <div className="flex items-center gap-1 min-w-0">
                <MapPin className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                <span className="truncate max-w-20 sm:max-w-24">{venue.name}</span>
              </div>
            )}
          </div>

          {/* Contador de interacciones para partidos destacados */}
          {match.interaction_count !== undefined && (
            <div className="flex items-center justify-center gap-2 mb-4 text-sm">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">{match.interaction_count} interacciones</span>
            </div>
          )}

          {/* Botones de acción */}
          <div className="space-y-2">
            {/* Primera fila */}
            <div className="flex gap-2">
              {isMatchScheduled(status) && (
                <Button
                  onClick={() => handleToggleReminder(match)}
                  variant="outline"
                  size="sm"
                  className={`flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 text-xs sm:text-sm ${
                    hasMatchReminder(matchId) ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" : ""
                  }`}
                >
                  <Bell className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Recordar
                </Button>
              )}

              {isMatchFinished(status) && (
                <Button
                  onClick={() => handleAction(match, "view")}
                  variant="outline"
                  size="sm"
                  className={`flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 text-xs sm:text-sm ${
                    hasMatchView(matchId) ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : ""
                  }`}
                >
                  <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  Lo vi
                </Button>
              )}

              <Button
                onClick={() => handleToggleFavorite(match)}
                variant="outline"
                size="sm"
                className={`flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 text-xs sm:text-sm ${
                  isMatchFavorite(matchId) ? "bg-red-500/20 border-red-500/30 text-red-400" : ""
                }`}
              >
                <Heart className={`h-3 w-3 sm:h-4 sm:w-4 mr-1 ${isMatchFavorite(matchId) ? "fill-current" : ""}`} />
                Favorito
              </Button>
            </div>

            {/* Segunda fila */}
            <div className="flex gap-2">
              <Button
                onClick={() => handleAction(match, "opinions-list")}
                variant="outline"
                size="sm"
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 text-xs sm:text-sm"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Opiniones
              </Button>

              {isMatchFinished(status) && (
                <Button
                  onClick={() => handleAction(match, "opinion")}
                  variant="outline"
                  size="sm"
                  className={`flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 text-xs sm:text-sm ${
                    hasMatchOpinion(matchId) ? "bg-green-500/20 border-green-500/30 text-green-400" : ""
                  }`}
                >
                  <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                  {hasMatchOpinion(matchId) ? "Opiné" : "Opinar"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEmptyState = (message: string) => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-2">
        <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
      </div>
      <p className="text-gray-400">{message}</p>
    </div>
  )

  const renderLoadingSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i} className="bg-gray-900 border-gray-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-32 bg-gray-800" />
              <Skeleton className="h-6 w-20 bg-gray-800" />
            </div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded bg-gray-800" />
                <Skeleton className="h-4 w-24 bg-gray-800" />
              </div>
              <Skeleton className="h-8 w-16 bg-gray-800" />
              <div className="flex items-center gap-3">
                <Skeleton className="h-4 w-24 bg-gray-800" />
                <Skeleton className="h-8 w-8 rounded bg-gray-800" />
              </div>
            </div>
            <div className="flex justify-center gap-4 mb-4">
              <Skeleton className="h-4 w-20 bg-gray-800" />
              <Skeleton className="h-4 w-16 bg-gray-800" />
              <Skeleton className="h-4 w-24 bg-gray-800" />
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 bg-gray-800" />
                <Skeleton className="h-8 flex-1 bg-gray-800" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1 bg-gray-800" />
                <Skeleton className="h-8 flex-1 bg-gray-800" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Partidos</h1>
            <p className="text-gray-400">Descubre, sigue y opina sobre los partidos de fútbol</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
              <Clock className="h-3 w-3" />
              <span>Última actualización: {lastUpdateTime.toLocaleTimeString("es-AR")}</span>
              <span className="text-green-400">• Zona horaria Argentina activa</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={refreshData}
              variant="outline"
              size="sm"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>

            {isAdmin && (
              <Button
                onClick={() => setShowManualMatchModal(true)}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar Partido
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-800">
            <TabsTrigger value="today" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
              Partidos de Hoy ({currentMatches.length})
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
              Partidos Destacados ({featuredMatches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            {/* Navegación por fecha */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("prev")}
                disabled={!canNavigatePrev()}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="text-center min-w-[300px]">
                <h3 className="text-xl font-semibold text-white">{getDateLabel(currentDate)}</h3>
                <p className="text-sm text-gray-400">
                  {currentDate.toLocaleDateString("es-AR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    timeZone: ARGENTINA_TIMEZONE,
                  })}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => navigateDate("next")}
                disabled={!canNavigateNext()}
                className="border-gray-700 text-gray-300 hover:bg-gray-800"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Indicador de fuente de datos */}
            <div className="mb-4 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-400">
                {isSameDayArgentina(currentDate, getArgentinaDate()) ? (
                  <>
                    <Wifi className="w-3 h-3 text-green-400" />
                    Datos en vivo con filtro de zona horaria Argentina
                  </>
                ) : isPastDate(currentDate) ? (
                  <>
                    <Database className="w-3 h-3 text-blue-400" />
                    Partidos guardados en base de datos
                  </>
                ) : (
                  <>
                    <Wifi className="w-3 h-3 text-yellow-400" />
                    Partidos futuros desde API externa
                  </>
                )}
              </div>
            </div>

            {loadingMatches ? (
              renderLoadingSkeleton()
            ) : currentMatches.length === 0 ? (
              renderEmptyState(
                isPastDate(currentDate)
                  ? "No hay partidos guardados para esta fecha"
                  : "No hay partidos programados para esta fecha",
              )
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentMatches.map((match) => {
                  const isFromAPI = !!match.fixture
                  return renderMatchCard(match, isFromAPI)
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
            <div className="mb-4">
              <h3 className="text-xl font-semibold text-white mb-2">Partidos Destacados</h3>
              <p className="text-sm text-gray-400">Partidos finalizados con más interacciones de la comunidad</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Database className="w-3 h-3 text-blue-400" />
                <span>Datos desde base de datos Supabase</span>
              </div>
            </div>

            {featuredMatches.length === 0 ? (
              renderEmptyState("No hay partidos destacados disponibles")
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredMatches.map((match) => renderMatchCard(match, false))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <MatchModal
        isOpen={!!selectedMatch && !!modalType}
        onClose={() => {
          setSelectedMatch(null)
          setModalType(null)
        }}
        match={selectedMatch!}
        modalType={modalType}
      />

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />

      <AddManualMatchModal
        open={showManualMatchModal}
        onOpenChange={setShowManualMatchModal}
        onMatchAdded={refreshData}
      />
    </div>
  )
}
