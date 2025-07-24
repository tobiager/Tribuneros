"use client"

import { useState } from "react"
import { Calendar, Clock, MapPin, Eye, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import MatchDetailsModal from "./match-details-modal"

interface MatchCardEnhancedProps {
  match: any
}

export default function MatchCardEnhanced({ match }: MatchCardEnhancedProps) {
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const getStatusText = (status: string) => {
    switch (status) {
      case "FT":
        return "Final"
      case "LIVE":
        return "En vivo"
      case "HT":
        return "Descanso"
      case "NS":
        return "No iniciado"
      case "PST":
        return "Pospuesto"
      case "CANC":
        return "Cancelado"
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FT":
        return "bg-gray-600"
      case "LIVE":
        return "bg-red-500 animate-pulse"
      case "HT":
        return "bg-yellow-500"
      case "NS":
        return "bg-blue-500"
      case "PST":
        return "bg-orange-500"
      case "CANC":
        return "bg-red-600"
      default:
        return "bg-gray-600"
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
    <>
      <Card className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-all duration-200">
        <CardContent className="p-6">
          {/* Header con fecha y estado */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(match.fixture?.date)}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{formatTime(match.fixture?.date)}</span>
            </div>
            <Badge className={`${getStatusColor(match.fixture?.status?.short)} text-white text-xs`}>
              {getStatusText(match.fixture?.status?.short)}
            </Badge>
          </div>

          {/* Equipos y resultado */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <img
                src={match.teams?.home?.logo || "/placeholder.svg"}
                alt={match.teams?.home?.name}
                className="w-8 h-8 object-contain"
              />
              <span className="font-medium text-white truncate">{match.teams?.home?.name}</span>
            </div>

            <div className="flex items-center gap-4 mx-4">
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">
                  {match.goals?.home !== null ? match.goals.home : "-"}
                </div>
              </div>
              <div className="text-gray-500">vs</div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-500">
                  {match.goals?.away !== null ? match.goals.away : "-"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-1 justify-end">
              <span className="font-medium text-white truncate text-right">{match.teams?.away?.name}</span>
              <img
                src={match.teams?.away?.logo || "/placeholder.svg"}
                alt={match.teams?.away?.name}
                className="w-8 h-8 object-contain"
              />
            </div>
          </div>

          {/* Información del estadio */}
          {match.fixture?.venue?.name && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
              <MapPin className="h-4 w-4" />
              <span className="truncate">{match.fixture.venue.name}</span>
              {match.fixture?.venue?.city && <span className="text-gray-500">• {match.fixture.venue.city}</span>}
            </div>
          )}

          {/* Liga */}
          <div className="flex items-center gap-2 mb-4">
            <img
              src={match.league?.logo || "/placeholder.svg"}
              alt={match.league?.name}
              className="w-5 h-5 object-contain"
            />
            <span className="text-sm text-gray-400">{match.league?.name}</span>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2 mt-4">
            <Button
              onClick={() => setShowDetailsModal(true)}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver detalles
            </Button>
            <Button
              onClick={() => setShowDetailsModal(true)}
              variant="outline"
              size="sm"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white bg-transparent"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Opiniones
            </Button>
          </div>
        </CardContent>
      </Card>

      <MatchDetailsModal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} match={match} />
    </>
  )
}
