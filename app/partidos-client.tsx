"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Eye, MessageCircle, Bell, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import MatchModal from "@/components/match-modal"
import type { ApiFootballMatch } from "@/lib/types"

interface MatchCardProps {
  match: ApiFootballMatch
  onOpenModal: (match: ApiFootballMatch, type: "view" | "opinion" | "opinions-list") => void
  isLoggedIn: boolean
}

function MatchCard({ match, onOpenModal, isLoggedIn }: MatchCardProps) {
  const isFinished = match.fixture.status.short === "FT"
  const isScheduled = match.fixture.status.short === "NS"
  const isLive = !isFinished && !isScheduled

  const getStatusText = (status: string) => {
    switch (status) {
      case "FT":
        return "Finalizado"
      case "NS":
        return "Programado"
      case "1H":
        return "1er Tiempo"
      case "HT":
        return "Entretiempo"
      case "2H":
        return "2do Tiempo"
      case "ET":
        return "Tiempo Extra"
      case "P":
        return "Penales"
      default:
        return "En Vivo"
    }
  }

  const getStatusColor = (status: string) => {
    if (status === "FT") {
      return "bg-green-500/20 text-green-500 border-green-500/30"
    } else if (status === "NS") {
      return "bg-gray-800 text-gray-400 border-gray-700"
    } else {
      return "bg-red-500/20 text-red-500 border-red-500/30 animate-pulse"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-green-500/30 transition-all duration-200">
      <CardContent className="p-4">
        {/* Header with League and Status */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
            <img
              src={match.league.logo || "/placeholder.svg"}
              alt={match.league.name}
              className="h-4 w-4 object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <span className="font-medium truncate">{match.league.name}</span>
          </div>
          <Badge className={`${getStatusColor(match.fixture.status.short)} text-xs border`}>
            {getStatusText(match.fixture.status.short)}
          </Badge>
        </div>

        {/* Teams and Score */}
        <div className="flex items-center justify-between my-4">
          <div className="flex flex-col items-center text-center w-1/3">
            <img
              src={match.teams.home.logo || "/placeholder.svg"}
              alt={match.teams.home.name}
              className="h-10 w-10 mb-2 object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <span className="font-bold text-white text-sm leading-tight truncate w-full">{match.teams.home.name}</span>
          </div>

          <div className="text-center px-2">
            <div className="text-2xl font-bold text-green-400">
              {match.goals.home !== null && match.goals.away !== null
                ? `${match.goals.home} - ${match.goals.away}`
                : "vs"}
            </div>
            {isLive && match.fixture.status.elapsed && (
              <div className="text-xs text-red-400 font-medium">{match.fixture.status.elapsed}'</div>
            )}
          </div>

          <div className="flex flex-col items-center text-center w-1/3">
            <img
              src={match.teams.away.logo || "/placeholder.svg"}
              alt={match.teams.away.name}
              className="h-10 w-10 mb-2 object-contain"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
            <span className="font-bold text-white text-sm leading-tight truncate w-full">{match.teams.away.name}</span>
          </div>
        </div>

        {/* Match Details */}
        <div className="text-xs text-gray-500 text-center mb-4 space-y-1">
          <div className="flex items-center justify-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{formatDate(match.fixture.date)}</span>
            <Clock className="h-3 w-3 ml-2" />
            <span>{formatTime(match.fixture.date)}</span>
          </div>
          {match.fixture.venue.name && (
            <div className="flex items-center justify-center gap-1 truncate">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{match.fixture.venue.name}</span>
              {match.fixture.venue.city && <span className="truncate">, {match.fixture.venue.city}</span>}
            </div>
          )}
          {match.league.round && <div className="text-gray-600 text-xs">{match.league.round}</div>}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-2">
          <Button
            onClick={() => onOpenModal(match, "view")}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800"
          >
            <Eye className="h-4 w-4 mr-1" /> Lo vi
          </Button>
          <Button
            onClick={() => onOpenModal(match, "opinion")}
            disabled={!isFinished}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4 mr-1" /> Opinar
          </Button>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
          >
            <Heart className="h-4 w-4 mr-1" /> Favorito
          </Button>
          <Button
            disabled={!isScheduled}
            variant="outline"
            size="sm"
            className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 disabled:opacity-50 bg-transparent"
          >
            <Bell className="h-4 w-4 mr-1" /> Recordar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface PartidosClientProps {
  todayMatches: ApiFootballMatch[]
  featuredMatches: ApiFootballMatch[]
}

export default function PartidosClient({ todayMatches, featuredMatches }: PartidosClientProps) {
  const { user } = useAuth()
  const [selectedMatch, setSelectedMatch] = useState<ApiFootballMatch | null>(null)
  const [modalType, setModalType] = useState<"view" | "opinion" | "opinions-list" | null>(null)

  const handleOpenModal = (match: ApiFootballMatch, type: "view" | "opinion" | "opinions-list") => {
    setSelectedMatch(match)
    setModalType(type)
  }

  const handleCloseModal = () => {
    setSelectedMatch(null)
    setModalType(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-green-500 mb-2">PARTIDOS</h1>
          <p className="text-gray-400 text-lg">Descubre, puntúa y comenta los mejores partidos</p>
        </div>

        <Tabs defaultValue="today" className="space-y-6">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 bg-gray-800/50 h-12 rounded-xl">
            <TabsTrigger
              value="today"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              Partidos de Hoy ({todayMatches.length})
            </TabsTrigger>
            <TabsTrigger
              value="featured"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              Destacados ({featuredMatches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today" className="space-y-6">
            {todayMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayMatches.map((match) => (
                  <MatchCard key={match.fixture.id} match={match} onOpenModal={handleOpenModal} isLoggedIn={!!user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">No hay partidos programados para hoy</div>
                <p className="text-gray-500">Revisa la sección de destacados para ver partidos recientes</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured" className="space-y-6">
            {featuredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredMatches.map((match) => (
                  <MatchCard key={match.fixture.id} match={match} onOpenModal={handleOpenModal} isLoggedIn={!!user} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-4">No se pudieron cargar los partidos destacados</div>
                <p className="text-gray-500">Intenta recargar la página o revisa tu conexión</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {selectedMatch && (
        <MatchModal isOpen={!!selectedMatch} onClose={handleCloseModal} match={selectedMatch} modalType={modalType} />
      )}
    </div>
  )
}
