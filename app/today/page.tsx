"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, MapPin, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import NavbarEnhanced from "@/components/navbar-enhanced"
import { FootballAPI, type Match } from "@/lib/football-api"

export default function TodayPage() {
  const router = useRouter()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTodayMatches = async () => {
      try {
        // Get recent and upcoming matches
        const [recentMatches, upcomingMatches] = await Promise.all([
          FootballAPI.getRecentMatches(5),
          FootballAPI.getUpcomingMatches(5),
        ])

        // Combine and sort by date
        const allMatches = [...recentMatches, ...upcomingMatches].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        )

        setMatches(allMatches)
      } catch (error) {
        console.error("Error loading matches:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTodayMatches()
  }, [])

  const handleViewDetails = (matchId: number) => {
    router.push(`/match/${matchId}/detail`)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavbarEnhanced />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Partidos de Hoy</h1>
            <p className="text-gray-400">Los partidos más importantes del día</p>
          </div>

          <div className="grid gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-gray-900 border-gray-800 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-gray-800 rounded mb-4"></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-800 rounded"></div>
                      <div className="h-6 w-24 bg-gray-800 rounded"></div>
                    </div>
                    <div className="h-8 w-16 bg-gray-800 rounded"></div>
                    <div className="flex items-center space-x-4">
                      <div className="h-6 w-24 bg-gray-800 rounded"></div>
                      <div className="w-12 h-12 bg-gray-800 rounded"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <NavbarEnhanced />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Partidos de Hoy</h1>
          <p className="text-gray-400">Los partidos más importantes del día</p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-400 mb-2">No hay partidos programados</h2>
            <p className="text-gray-500">Vuelve más tarde para ver los próximos encuentros</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {matches.map((match) => (
              <Card key={match.id} className="bg-gray-900 border-gray-800 hover:border-gray-700 transition-colors">
                <CardContent className="p-6">
                  {/* Header with league and status */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{match.league.logo}</span>
                      <div>
                        <h3 className="font-semibold text-white">{match.league.name}</h3>
                        {match.round && <p className="text-sm text-gray-400">{match.round}</p>}
                      </div>
                    </div>
                    {getStatusBadge(match.status)}
                  </div>

                  {/* Teams and score */}
                  <div className="flex items-center justify-between mb-6">
                    {/* Home team */}
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="text-3xl">{match.homeTeam.logo}</div>
                      <div>
                        <h4 className="font-semibold text-white text-lg">{match.homeTeam.name}</h4>
                        <p className="text-sm text-gray-400">{match.homeTeam.country}</p>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="text-center px-6">
                      {match.status === "finished" ? (
                        <div className="text-3xl font-bold text-green-400">
                          {match.homeScore} - {match.awayScore}
                        </div>
                      ) : (
                        <div className="text-xl text-gray-400">vs</div>
                      )}
                    </div>

                    {/* Away team */}
                    <div className="flex items-center space-x-4 flex-1 justify-end">
                      <div className="text-right">
                        <h4 className="font-semibold text-white text-lg">{match.awayTeam.name}</h4>
                        <p className="text-sm text-gray-400">{match.awayTeam.country}</p>
                      </div>
                      <div className="text-3xl">{match.awayTeam.logo}</div>
                    </div>
                  </div>

                  {/* Match details */}
                  <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(match.date)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4" />
                        <span>{match.time}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{match.venue}</span>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex justify-end">
                    <Button
                      onClick={() => handleViewDetails(match.id)}
                      className="bg-gray-800 hover:bg-green-500 hover:text-black text-white border border-gray-700 hover:border-green-500 transition-all duration-200"
                    >
                      Ver detalles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
