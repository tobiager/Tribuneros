"use client"

import { Calendar, Clock, MapPin, Eye, MessageCircle, Bell, BellRing, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import type { ApiFootballMatch, MatchOpinion, MatchView } from "@/lib/types"
import { toggleFavorite, toggleReminder } from "@/app/matches/actions"
import { useRouter } from "next/navigation"

interface UserInteractions {
  views: Map<number, MatchView>
  opinions: Map<number, MatchOpinion>
  favorites: Set<number>
  reminders: Set<number>
}

interface MatchCardProps {
  match: ApiFootballMatch
  onOpenModal: (match: ApiFootballMatch, type: "view" | "opinion" | "opinions-list") => void
  isLoggedIn: boolean
  userInteractions: UserInteractions
}

export default function MatchCard({ match, onOpenModal, isLoggedIn, userInteractions }: MatchCardProps) {
  const router = useRouter()
  const matchId = match.fixture.id
  const userView = userInteractions.views?.get(matchId)
  const userOpinion = userInteractions.opinions?.get(matchId)
  const isFavorite = userInteractions.favorites?.has(matchId)
  const hasReminder = userInteractions.reminders?.has(matchId)

  const isFinished = match.fixture.status.short === "FT"
  const isScheduled = match.fixture.status.short === "NS"

  const handleToggle = async (action: "favorite" | "reminder") => {
    if (!isLoggedIn) {
      onOpenModal(match, "view") // This will trigger auth modal
      return
    }
    const promise = action === "favorite" ? toggleFavorite(matchId) : toggleReminder(matchId)
    toast.promise(promise, {
      loading: "Actualizando...",
      success: `¡${action === "favorite" ? "Favorito" : "Recordatorio"} actualizado!`,
      error: "Ocurrió un error.",
    })
    router.refresh()
  }

  const getStatusText = (status: string) => {
    return status === "FT" ? "Finalizado" : status === "NS" ? "Programado" : "En Vivo"
  }
  const getStatusColor = (status: string) => {
    return status === "FT"
      ? "bg-green-500/20 text-green-500 border-green-500/30"
      : status === "NS"
        ? "bg-gray-800 text-gray-400 border-gray-700"
        : "bg-red-500/20 text-red-500 border-red-500/30 animate-pulse"
  }

  return (
    <Card className="bg-gray-900 border-gray-800 hover:border-green-500/30 transition-all duration-200 flex flex-col">
      <CardContent className="p-4 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
            <img
              src={match.league.logo || "/placeholder.svg"}
              alt={match.league.name}
              className="h-4 w-4 object-contain"
            />
            <span className="font-medium truncate">{match.league.name}</span>
          </div>
          <Badge className={`${getStatusColor(match.fixture.status.short)} text-xs border`}>
            {getStatusText(match.fixture.status.short)}
          </Badge>
        </div>

        <div className="flex items-center justify-between my-2 flex-grow">
          <div className="flex flex-col items-center text-center w-1/3">
            <img
              src={match.teams.home.logo || "/placeholder.svg"}
              alt={match.teams.home.name}
              className="h-10 w-10 mb-2 object-contain"
            />
            <span className="font-bold text-white text-sm leading-tight truncate">{match.teams.home.name}</span>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {match.goals.home !== null ? `${match.goals.home} - ${match.goals.away}` : "vs"}
            </div>
          </div>
          <div className="flex flex-col items-center text-center w-1/3">
            <img
              src={match.teams.away.logo || "/placeholder.svg"}
              alt={match.teams.away.name}
              className="h-10 w-10 mb-2 object-contain"
            />
            <span className="font-bold text-white text-sm leading-tight truncate">{match.teams.away.name}</span>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center mb-3 space-y-1">
          <div className="flex items-center justify-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(match.fixture.date).toLocaleDateString("es-AR")}</span>
            <Clock className="h-3 w-3 ml-2" />
            <span>
              {new Date(match.fixture.date).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          {match.fixture.venue.name && (
            <div className="flex items-center justify-center gap-1 truncate">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{match.fixture.venue.name}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap gap-1 justify-center mb-3 h-5">
          {userView && (
            <Badge variant="outline" className="text-blue-400 border-blue-400/50 text-xs">
              Visto en {userView.view_type === "stadium" ? "Cancha" : "TV"}
            </Badge>
          )}
          {userOpinion && (
            <Badge variant="outline" className="text-purple-400 border-purple-400/50 text-xs">
              {userOpinion.rating} ★
            </Badge>
          )}
          {isFavorite && (
            <Badge variant="outline" className="text-red-400 border-red-400/50 text-xs">
              Favorito
            </Badge>
          )}
          {hasReminder && isScheduled && (
            <Badge variant="outline" className="text-yellow-400 border-yellow-400/50 text-xs">
              Recordatorio
            </Badge>
          )}
        </div>

        <div className="flex gap-2 mt-auto">
          <Button onClick={() => onOpenModal(match, "view")} variant="outline" size="sm" className="flex-1">
            <Eye className="h-4 w-4 mr-1" /> Lo vi
          </Button>
          <Button
            onClick={() => onOpenModal(match, "opinion")}
            disabled={!isFinished}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            <MessageCircle className="h-4 w-4 mr-1" /> Opinar
          </Button>
        </div>
        <div className="flex gap-2 mt-2">
          <Button onClick={() => handleToggle("favorite")} variant="outline" size="sm" className="flex-1">
            <Heart className={`h-4 w-4 mr-1 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} /> Favorito
          </Button>
          <Button
            onClick={() => handleToggle("reminder")}
            disabled={!isScheduled}
            variant="outline"
            size="sm"
            className="flex-1"
          >
            {hasReminder ? <BellRing className="h-4 w-4 mr-1 text-yellow-400" /> : <Bell className="h-4 w-4 mr-1" />}
            Recordar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
