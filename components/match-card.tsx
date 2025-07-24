"use client"

import { Calendar, MapPin, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ApiMatch } from "@/lib/api-football"

interface MatchCardProps {
  match: ApiMatch
  onAddMatch?: (match: ApiMatch) => void
  showAddButton?: boolean
  userRating?: number
  userCount?: number
}

export default function MatchCard({ match, onAddMatch, showAddButton = false, userRating, userCount }: MatchCardProps) {
  const isFinished = match.fixture.status.short === "FT"
  const matchDate = new Date(match.fixture.date)

  return (
    <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800 hover:border-green-500/30 transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          {match.league.name}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          {matchDate.toLocaleDateString("es-AR")}
        </div>
      </div>

      {/* Teams and Score */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-center">
            <img
              src={match.teams.home.logo || "/placeholder.svg"}
              alt={match.teams.home.name}
              className="w-8 h-8 mx-auto mb-1"
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
          <div className="text-xs text-gray-500 uppercase">{isFinished ? "Final" : match.fixture.status.long}</div>
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="text-center">
            <img
              src={match.teams.away.logo || "/placeholder.svg"}
              alt={match.teams.away.name}
              className="w-8 h-8 mx-auto mb-1"
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
        {userCount && (
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{userCount} lo vieron</span>
          </div>
        )}
      </div>

      {/* User Rating */}
      {userRating && (
        <div className="text-center mb-4">
          <span className="text-green-500 font-bold text-lg">{userRating}/10</span>
        </div>
      )}

      {/* Add Button */}
      {showAddButton && onAddMatch && (
        <Button
          onClick={() => onAddMatch(match)}
          className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
        >
          + Agregar a mi perfil
        </Button>
      )}
    </div>
  )
}
