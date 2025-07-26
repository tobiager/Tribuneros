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
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { toggleMatchFavorite, toggleMatchReminder, getUserMatchInteractions } from "@/lib/database-actions"
import { DatabaseService, autoSaveFinishedMatches } from "@/lib/database-service"
import { apiFootballService } from "@/lib/api-football-service"
import { autoSyncService } from "@/lib/auto-sync-service"
import {
  getArgentinaDate,
  formatArgentinaDate,
  getDateLabel,
  isSameDayArgentina,
  getMillisecondsUntilMidnightArgentina,
} from "@/lib/timezone-utils"
import MatchModal from "@/components/match-modal"
import AuthModal from "@/components/auth-modal"
import AddManualMatchModal from "@/components/add-manual-match-modal"
import type { ApiFootballMatch, UserMatchInteractions } from "@/lib/types"

interface PartidosClientProps {
  initialTodayMatches: ApiFootballMatch[]
  initialStoredTodayMatches: any[]
  initialFeaturedMatches: any[]
}

export default function PartidosClient({
  initialTodayMatches,
  initialStoredTodayMatches,
  initialFeaturedMatches,
}: PartidosClientProps) {
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
  const [todayMatches, setTodayMatches] = useState<(ApiFootballMatch | any)[]>([])
  const [featuredMatches, setFeaturedMatches] = useState(initialFeaturedMatches)
  const [loadingToday, setLoadingToday] = useState(false)
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(new Date())
  const [autoUpdateTimer, setAutoUpdateTimer] = useState<NodeJS.Timeout | null>(null)

  // Inicializar servicio de auto-sincronización
  useEffect(() => {
    console.log("🚀 Iniciando servicio de auto-sincronización")
    autoSyncService.startAutoSync()

    return () => {
      autoSyncService.stopAutoSync()
    }
  }, [])

  // Escuchar eventos de actualización automática
  useEffect(() => {
    const handleAutoUpdate = (event: CustomEvent) => {
      console.log("📡 Evento de actualización automática recibido:", event.detail)

      // Actualizar la fecha actual a la fecha argentina
      const newArgentinaDate = getArgentinaDate()
      setCurrentDate(newArgentinaDate)
      setLastUpdateTime(new Date())

      // Recargar datos
      loadTodayMatches(newArgentinaDate)
      refreshFeaturedMatches()

      toast.success("¡Partidos actualizados automáticamente!", {
        description: `Fecha actualizada: ${getDateLabel(newArgentinaDate)}`,
      })
    }

    if (typeof window !== "undefined") {
      window.addEventListener("partidosAutoUpdate", handleAutoUpdate as EventListener)

      return () => {
        window.removeEventListener("partidosAutoUpdate", handleAutoUpdate as EventListener)
      }
    }
  }, [])

  // Timer para actualización automática a medianoche argentina
  useEffect(() => {
    const setupMidnightTimer = () => {
      const msUntilMidnight = getMillisecondsUntilMidnightArgentina()

      console.log(
        `⏰ Configurando timer para medianoche argentina en ${Math.round(msUntilMidnight / 1000 / 60)} minutos`,
      )

      const timer = setTimeout(() => {
        console.log("🌅 ¡Medianoche argentina! Actualizando automáticamente...")

        // Actualizar fecha
        const newDate = getArgentinaDate()
        setCurrentDate(newDate)
        setLastUpdateTime(new Date())

        // Recargar datos
        loadTodayMatches(newDate)
        refreshFeaturedMatches()

        // Configurar próximo timer
        setupMidnightTimer()

        toast.success("¡Nuevo día! Partidos actualizados automáticamente", {
          description: getDateLabel(newDate),
        })
      }, msUntilMidnight)

      setAutoUpdateTimer(timer)
    }

    setupMidnightTimer()

    return () => {
      if (autoUpdateTimer) {
        clearTimeout(autoUpdateTimer)
      }
    }
  }, [])

  useEffect(() => {
    if (user && !authLoading) {
      loadUserInteractions()
      checkAdminStatus()
    }
  }, [user, authLoading, todayMatches, featuredMatches])

  useEffect(() => {
    loadTodayMatches(currentDate)
  }, [currentDate])

  // Initialize with today's data
  useEffect(() => {
    const argentinaToday = getArgentinaDate()
    if (isSameDayArgentina(currentDate, argentinaToday)) {
      // Combinar partidos de API y base de datos para hoy
      const combinedMatches = combineMatches(initialTodayMatches, initialStoredTodayMatches)
      setTodayMatches(combinedMatches)
    }
  }, [initialTodayMatches, initialStoredTodayMatches, currentDate])

  const combineMatches = (apiMatches: ApiFootballMatch[], dbMatches: any[]) => {
    const combined = [...apiMatches]

    // Agregar partidos de la base de datos que no estén en la API
    dbMatches.forEach((dbMatch) => {
      const existsInApi = apiMatches.some((apiMatch) => apiMatch.fixture.id === dbMatch.id)
      if (!existsInApi) {
        combined.push(dbMatch)
      }
    })

    return combined.sort((a, b) => {
      const dateA = new Date(a.fixture?.date || a.match_date)
      const dateB = new Date(b.fixture?.date || b.match_date)
      return dateA.getTime() - dateB.getTime()
    })
  }

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

  const loadTodayMatches = async (date: Date = currentDate) => {
    setLoadingToday(true)
    try {
      const dateStr = formatArgentinaDate(date)
      const argentinaToday = getArgentinaDate()

      console.log(`📅 Cargando partidos para: ${dateStr} (${getDateLabel(date)})`)

      if (isSameDayArgentina(date, argentinaToday)) {
        // Para hoy: combinar API y base de datos
        const [apiMatches, dbMatches] = await Promise.all([
          apiFootballService.getMatchesByDate(dateStr),
          DatabaseService.getMatchesByDate(dateStr),
        ])

        const combined = combineMatches(apiMatches, dbMatches)
        setTodayMatches(combined)

        // Auto-guardar partidos finalizados
        await autoSaveFinishedMatches(apiMatches)

        console.log(
          `✅ Partidos de hoy cargados: ${combined.length} (${apiMatches.length} API + ${dbMatches.length} DB)`,
        )
      } else if (date > argentinaToday) {
        // Para fechas futuras: solo API
        const apiMatches = await apiFootballService.getMatchesByDate(dateStr)
        setTodayMatches(apiMatches)
        console.log(`✅ Partidos futuros cargados: ${apiMatches.length}`)
      } else {
        // Para fechas pasadas: solo base de datos
        const dbMatches = await DatabaseService.getMatchesByDate(dateStr)
        setTodayMatches(dbMatches)
        console.log(`✅ Partidos pasados cargados: ${dbMatches.length}`)
      }
    } catch (error) {
      console.error("Error loading today matches:", error)
      toast.error("Error al cargar los partidos")
    } finally {
      setLoadingToday(false)
    }
  }

  const refreshFeaturedMatches = async () => {
    try {
      const featuredData = await DatabaseService.getFeaturedStoredMatches()
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
        ...todayMatches.map((m) => m.fixture?.id || m.id),
        ...featuredMatches.map((m) => m.id),
      ].filter(Boolean)

      const result = await getUserMatchInteractions(user.id, allMatchIds)
      if (result.success) {
        setUserInteractions(result.data)
      }
    } catch (error) {
      console.error("Error loading user interactions:", error)
    } finally {
      setLoadingInteractions(false)
    }
  }

  const refreshData = async () => {
    try {
      await Promise.all([loadTodayMatches(currentDate), refreshFeaturedMatches()])

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
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

          {/* Equipos y resultado - Mejorado para nombres largos */}
          <div className="flex items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <img
                src={homeTeam.logo || "/placeholder.svg"}
                alt={homeTeam.name}
                className="h-8 w-8 flex-shrink-0"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <span className="font-semibold text-white truncate text-sm sm:text-base">{homeTeam.name}</span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-green-400 px-2 flex-shrink-0">
              {homeScore !== null && awayScore !== null ? `${homeScore} - ${awayScore}` : "vs"}
            </div>

            <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
              <span className="font-semibold text-white truncate text-sm sm:text-base text-right">{awayTeam.name}</span>
              <img
                src={awayTeam.logo || "/placeholder.svg"}
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
              <span>{formatDate(matchDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>{formatTime(matchDate)}</span>
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
              {isMatchFinished(status) && (
                <>
                  <Button
                    onClick={() => handleAction(match, "view")}
                    variant="outline"
                    size="sm"
                    className={`flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 text-xs sm:text-sm ${
                      hasMatchView(matchId) ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : ""
                    }`}
                  >
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    {hasMatchView(matchId) ? "Visto" : "Lo vi"}
                  </Button>

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
                </>
              )}

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
                  {hasMatchReminder(matchId) ? "Recordando" : "Recordar"}
                </Button>
              )}
            </div>

            {/* Segunda fila */}
            <div className="flex gap-2">
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

              <Button
                onClick={() => handleAction(match, "opinions-list")}
                variant="outline"
                size="sm"
                className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 text-xs sm:text-sm"
              >
                <Users className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                Opiniones
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderEmptyState = (message: string) => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-2">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
              <span className="text-green-400">• Actualización automática activa</span>
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
              Partidos de {getDateLabel(currentDate)} ({todayMatches.length})
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
                    timeZone: "America/Argentina/Buenos_Aires",
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

            {loadingToday ? (
              renderLoadingSkeleton()
            ) : todayMatches.length === 0 ? (
              renderEmptyState("No hay partidos programados para esta fecha")
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayMatches.map((match) => {
                  const isFromAPI = !!match.fixture
                  return renderMatchCard(match, isFromAPI)
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
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
