"use client"

import { useState } from "react"
import { Star, Heart, MessageCircle, Calendar, Clock, MapPin, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Team {
  name: string
  logo: string
  score: number
}

interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  date: string
  time: string
  stadium: string
  league: string
  status: string
}

interface UserOpinion {
  id: string
  username: string
  avatar?: string
  rating: number
  comment: string
  date: string
  likes: number
}

interface MatchDetailViewProps {
  match: Match
  averageRating?: number
  totalReviews?: number
  userOpinions?: UserOpinion[]
}

export default function MatchDetailView({
  match,
  averageRating = 0,
  totalReviews = 0,
  userOpinions = [],
}: MatchDetailViewProps) {
  const [showOpinions, setShowOpinions] = useState(false)
  const [likedOpinions, setLikedOpinions] = useState<Set<string>>(new Set())

  const renderStars = (rating: number, size = "w-5 h-5") => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${size} ${
          i < Math.floor(rating)
            ? "text-yellow-400 fill-yellow-400"
            : i < rating
              ? "text-yellow-400 fill-yellow-400/50"
              : "text-gray-600"
        }`}
      />
    ))
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "live":
        return <Badge className="bg-red-500 text-white animate-pulse">EN VIVO</Badge>
      case "finished":
        return <Badge className="bg-green-500 text-black">FINALIZADO</Badge>
      case "scheduled":
        return <Badge className="bg-blue-500 text-white">PROGRAMADO</Badge>
      default:
        return <Badge variant="secondary">{status.toUpperCase()}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleLike = (opinionId: string) => {
    setLikedOpinions((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(opinionId)) {
        newSet.delete(opinionId)
      } else {
        newSet.add(opinionId)
      }
      return newSet
    })
  }

  return (
    <div className="space-y-8">
      {/* Match Header */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-8">
          {/* League and Status */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-3">
              <Trophy className="h-6 w-6 text-yellow-500" />
              <h2 className="text-xl font-semibold text-white">{match.league}</h2>
            </div>
            {getStatusBadge(match.status)}
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-between mb-8">
            {/* Home Team */}
            <div className="flex items-center space-x-6 flex-1">
              <div className="text-6xl">{match.homeTeam.logo}</div>
              <div>
                <h3 className="text-2xl font-bold text-white mb-1">{match.homeTeam.name}</h3>
                <p className="text-gray-400">Local</p>
              </div>
            </div>

            {/* Score */}
            <div className="text-center px-8">
              {match.status === "finished" ? (
                <div className="text-5xl font-bold text-green-400 mb-2">
                  {match.homeTeam.score} - {match.awayTeam.score}
                </div>
              ) : (
                <div className="text-3xl text-gray-400 mb-2">vs</div>
              )}
              <p className="text-sm text-gray-500">
                {match.status === "finished" ? "Resultado final" : "Próximamente"}
              </p>
            </div>

            {/* Away Team */}
            <div className="flex items-center space-x-6 flex-1 justify-end">
              <div className="text-right">
                <h3 className="text-2xl font-bold text-white mb-1">{match.awayTeam.name}</h3>
                <p className="text-gray-400">Visitante</p>
              </div>
              <div className="text-6xl">{match.awayTeam.logo}</div>
            </div>
          </div>

          {/* Match Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(match.date)}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <Clock className="h-5 w-5" />
              <span>{match.time}</span>
            </div>
            <div className="flex items-center justify-center space-x-2 text-gray-400">
              <MapPin className="h-5 w-5" />
              <span>{match.stadium}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* User Opinions Section */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white">Opiniones de usuarios</CardTitle>
            <div className="flex items-center space-x-4">
              {/* Average Rating */}
              <div className="flex items-center space-x-2">
                <div className="flex">{renderStars(averageRating)}</div>
                <span className="text-white font-semibold">{averageRating.toFixed(1)}/5</span>
                <span className="text-gray-400">({totalReviews} opiniones)</span>
              </div>

              {/* Toggle Button */}
              <Button
                onClick={() => setShowOpinions(!showOpinions)}
                className="bg-green-500 hover:bg-green-600 text-black font-semibold"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                {showOpinions ? "Ocultar opiniones" : "Ver opiniones de usuarios"}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showOpinions && (
          <CardContent className="space-y-6">
            {userOpinions.length === 0 ? (
              <div className="text-center py-8">
                <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Aún no hay opiniones para este partido</p>
                <p className="text-gray-500 text-sm">¡Sé el primero en compartir tu opinión!</p>
              </div>
            ) : (
              userOpinions.map((opinion) => (
                <Card key={opinion.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* User Avatar */}
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={opinion.avatar || "/placeholder.svg"} alt={opinion.username} />
                        <AvatarFallback className="bg-gray-700 text-white">
                          {opinion.username.slice(1, 3).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        {/* User Info and Rating */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-white">{opinion.username}</h4>
                            <div className="flex">{renderStars(opinion.rating, "w-4 h-4")}</div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(opinion.date).toLocaleDateString("es-ES")}
                          </span>
                        </div>

                        {/* Comment */}
                        <p className="text-gray-300 mb-4 leading-relaxed">{opinion.comment}</p>

                        {/* Actions */}
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(opinion.id)}
                            className={`text-gray-400 hover:text-red-400 ${
                              likedOpinions.has(opinion.id) ? "text-red-400" : ""
                            }`}
                          >
                            <Heart className={`h-4 w-4 mr-1 ${likedOpinions.has(opinion.id) ? "fill-red-400" : ""}`} />
                            {opinion.likes + (likedOpinions.has(opinion.id) ? 1 : 0)}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}
