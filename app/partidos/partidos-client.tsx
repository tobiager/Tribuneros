"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, Clock, MapPin, Eye, MessageSquare, Heart, Bell, Users } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { toggleMatchFavorite, toggleMatchReminder, getUserMatchInteractions } from "@/lib/database-actions"
import MatchModal from "@/components/match-modal"
import AuthModal from "@/components/auth-modal"
import type { ApiFootballMatch, UserMatchInteractions } from "@/lib/types"

interface PartidosClientProps {
  todayMatches: ApiFootballMatch[]
  featuredMatches: ApiFootballMatch[]
}

export default function PartidosClient({ todayMatches, featuredMatches }: PartidosClientProps) {
  const { user } = useAuth()
  const [selectedMatch, setSelectedMatch] = useState<ApiFootballMatch | null>(null)
  const [modalType, setModalType] = useState<"view" | "opinion" | "opinions-list" | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [userInteractions, setUserInteractions] = useState<UserMatchInteractions>({
    views: [],
    opinions: [],
    favorites: [],
    reminders: [],
  })
  const [loadingInteractions, setLoadingInteractions] = useState(false)

  useEffect(() => {
    if (user) {
      loadUserInteractions()
    }
  }, [user, todayMatches, featuredMatches])

  const loadUserInteractions = async () => {
    if (!user) return

    setLoadingInteractions(true)
    try {
      const allMatchIds = [...todayMatches.map((m) => m.fixture.id), ...featuredMatches.map((m) => m.fixture.id)]

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

  const handleAction = (match: ApiFootballMatch, action: "view" | "opinion" | "opinions-list") => {
    if (!user && (action === "view" || action === "opinion")) {
      setShowAuthModal(true)
      return
    }

    setSelectedMatch(match)
    setModalType(action)
  }

  const handleToggleFavorite = async (match: ApiFootballMatch) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      const result = await toggleMatchFavorite(match.fixture.id)
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

  const handleToggleReminder = async (match: ApiFootballMatch) => {
    if (!user) {
      setShowAuthModal(true)
      return
    }

    try {
      const result = await toggleMatchReminder(match.fixture.id)
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
      NS: "Programado",
      "1H": "1er Tiempo",
      HT: "Entretiempo",
      "2H": "2do Tiempo",
      FT: "Finalizado",
      AET: "Finalizado (TE)",
      PEN: "Finalizado (PEN)",
      LIVE: "En Vivo",
    }
    return statusMap[status] || "En Vivo"
  }

  const getStatusColor = (status: string) => {
    if (["1H", "2H", "HT", "LIVE"].includes(status)) return "bg-red-500/20 text-red-400 border-red-500/30"
    if (["FT", "AET", "PEN"].includes(status)) return "bg-gray-500/20 text-gray-400 border-gray-500/30"
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

  const renderMatchCard = (match: ApiFootballMatch) => (
    <Card key={match.fixture.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
      <CardContent className="p-4">
        {/* Header con liga y estado */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <img
              src={match.league.logo || "/placeholder.svg"}
              alt={match.league.name}
              className="h-5 w-5"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <span className="text-sm text-gray-400 truncate">{match.league.name}</span>
          </div>
          <Badge className={getStatusColor(match.fixture.status.short)}>
            {getStatusText(match.fixture.status.short)}
          </Badge>
        </div>

        {/* Equipos y resultado */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <img
              src={match.teams.home.logo || "/placeholder.svg"}
              alt={match.teams.home.name}
              className="h-8 w-8"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <span className="font-semibold text-white truncate">{match.teams.home.name}</span>
          </div>

          <div className="text-2xl font-bold text-green-400 mx-4">
            {match.goals.home !== null ? `${match.goals.home} - ${match.goals.away}` : "vs"}
          </div>

          <div className="flex items-center gap-3 flex-1 justify-end">
            <span className="font-semibold text-white truncate">{match.teams.away.name}</span>
            <img
              src={match.teams.away.logo || "/placeholder.svg"}
              alt={match.teams.away.name}
              className="h-8 w-8"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
          </div>
        </div>

        {/* Información del partido */}
        <div className="flex items-center justify-center gap-4 text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(match.fixture.date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(match.fixture.date)}</span>
          </div>
          {match.fixture.venue.name && (
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span className="truncate max-w-24">{match.fixture.venue.name}</span>
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-2">
          {/* Primera fila */}
          <div className="flex gap-2">
            {isMatchFinished(match.fixture.status.short) && (
              <Button
                onClick={() => handleAction(match, "view")}
                variant="outline"
                size="sm"
                className={`flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 ${
                  hasMatchView(match.fixture.id) ? "bg-blue-500/20 border-blue-500/30 text-blue-400" : ""
                }`}
              >
                <Eye className="h-4 w-4 mr-1" />
                {hasMatchView(match.fixture.id) ? "Visto" : "Lo vi"}
              </Button>
            )}

            {isMatchFinished(match.fixture.status.short) && (
              <Button
                onClick={() => handleAction(match, "opinion")}
                variant="outline"
                size="sm"
                className={`flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 ${
                  hasMatchOpinion(match.fixture.id) ? "bg-green-500/20 border-green-500/30 text-green-400" : ""
                }`}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                {hasMatchOpinion(match.fixture.id) ? "Opiné" : "Opinar"}
              </Button>
            )}

            {isMatchScheduled(match.fixture.status.short) && (
              <Button
                onClick={() => handleToggleReminder(match)}
                variant="outline"
                size="sm"
                className={`flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 ${
                  hasMatchReminder(match.fixture.id) ? "bg-yellow-500/20 border-yellow-500/30 text-yellow-400" : ""
                }`}
              >
                <Bell className="h-4 w-4 mr-1" />
                {hasMatchReminder(match.fixture.id) ? "Recordando" : "Recordar"}
              </Button>
            )}
          </div>

          {/* Segunda fila */}
          <div className="flex gap-2">
            <Button
              onClick={() => handleToggleFavorite(match)}
              variant="outline"
              size="sm"
              className={`flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 ${
                isMatchFavorite(match.fixture.id) ? "bg-red-500/20 border-red-500/30 text-red-400" : ""
              }`}
            >
              <Heart className={`h-4 w-4 mr-1 ${isMatchFavorite(match.fixture.id) ? "fill-current" : ""}`} />
              {isMatchFavorite(match.fixture.id) ? "Favorito" : "Favorito"}
            </Button>

            <Button
              onClick={() => handleAction(match, "opinions-list")}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
            >
              <Users className="h-4 w-4 mr-1" />
              Opiniones
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

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
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-8 bg-gray-800" />
              <Skeleton className="h-8 bg-gray-800" />
              <Skeleton className="h-8 bg-gray-800" />
              <Skeleton className="h-8 bg-gray-800" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Partidos</h1>
          <p className="text-gray-400">Descubre, sigue y opina sobre los partidos de fútbol</p>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-800">
            <TabsTrigger value="today" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
              Hoy ({todayMatches.length})
            </TabsTrigger>
            <TabsTrigger value="featured" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
              Destacados ({featuredMatches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="mt-6">
            {todayMatches.length === 0 ? (
              renderEmptyState("No hay partidos programados para hoy")
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayMatches.map(renderMatchCard)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="mt-6">
            {featuredMatches.length === 0 ? (
              renderEmptyState("No hay partidos destacados disponibles")
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredMatches.map(renderMatchCard)}
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
    </div>
  )
}
