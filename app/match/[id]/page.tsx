"use client"

import { useEffect, useState } from "react"
import { ArrowLeft, MapPin, Calendar, Users, BarChart3, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navigation from "@/components/navigation"
import DesktopSidebar from "@/components/desktop-sidebar"
import { FootballAPI, type MatchDetails } from "@/lib/football-api"
import Link from "next/link"

interface MatchPageProps {
  params: {
    id: string
  }
}

export default function MatchPage({ params }: MatchPageProps) {
  const [match, setMatch] = useState<MatchDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMatchDetails()
  }, [params.id])

  const loadMatchDetails = async () => {
    try {
      const matchDetails = await FootballAPI.getMatchById(Number.parseInt(params.id))
      setMatch(matchDetails)
    } catch (error) {
      console.error("Error loading match details:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando detalles del partido...</p>
        </div>
      </div>
    )
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">Partido no encontrado</p>
          <Link href="/">
            <Button className="mt-4 bg-green-500 hover:bg-green-600 text-black">Volver al inicio</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <DesktopSidebar />

        <div className="flex-1 max-w-4xl border-x border-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div>
                  <h1 className="text-xl font-bold text-white">
                    {match.homeTeam.name} vs {match.awayTeam.name}
                  </h1>
                  <p className="text-sm text-gray-500">{match.league.name}</p>
                </div>
              </div>
            </div>
          </div>

          <MatchContent match={match} />
        </div>

        <div className="w-80"></div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-bold text-white">
                {match.homeTeam.name} vs {match.awayTeam.name}
              </h1>
              <p className="text-xs text-gray-500">{match.league.name}</p>
            </div>
          </div>
        </div>

        <div className="pb-20">
          <MatchContent match={match} />
        </div>

        <Navigation />
      </div>
    </div>
  )
}

function MatchContent({ match }: { match: MatchDetails }) {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Match Header */}
      <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
        <div className="flex items-center justify-between mb-6">
          <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
            {match.league.name}
          </Badge>
          <div className="text-sm text-gray-400">
            {match.status === "finished" ? "Finalizado" : match.status === "live" ? "En vivo" : "Programado"}
          </div>
        </div>

        {/* Teams and Score */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-center flex-1">
            <div className="text-6xl mb-3">{match.homeTeam.logo}</div>
            <h2 className="font-bold text-xl text-white mb-1">{match.homeTeam.name}</h2>
            <p className="text-sm text-gray-400">{match.homeTeam.country}</p>
          </div>

          <div className="text-center px-8">
            {match.status === "finished" ? (
              <div className="text-5xl font-bold text-white mb-2">
                {match.homeScore} - {match.awayScore}
              </div>
            ) : (
              <div className="text-2xl text-gray-400 mb-2">{match.time}</div>
            )}
            <div className="text-sm text-gray-500 uppercase tracking-wide">
              {match.status === "finished" ? "Final" : match.status === "live" ? "En vivo" : "Programado"}
            </div>
          </div>

          <div className="text-center flex-1">
            <div className="text-6xl mb-3">{match.awayTeam.logo}</div>
            <h2 className="font-bold text-xl text-white mb-1">{match.awayTeam.name}</h2>
            <p className="text-sm text-gray-400">{match.awayTeam.country}</p>
          </div>
        </div>

        {/* Match Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-400">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(match.date).toLocaleDateString("es-AR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <Clock className="h-4 w-4" />
            <span>{match.time}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin className="h-4 w-4" />
            <span>{match.venue}</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold px-8">+ Marcar como visto</Button>
      </div>

      {/* Match Details Tabs */}
      <Tabs defaultValue="stats" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800 h-12">
          <TabsTrigger value="stats" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
            Estadísticas
          </TabsTrigger>
          <TabsTrigger value="events" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
            Eventos
          </TabsTrigger>
          <TabsTrigger value="community" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
            Comunidad
          </TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-4">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-500" />
              Estadísticas del partido
            </h3>

            <div className="space-y-4">
              {/* Possession */}
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-400">Posesión</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white font-semibold w-8">{match.stats.possession.home}%</span>
                  <div className="flex-1 bg-gray-800 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${match.stats.possession.home}%` }}
                    ></div>
                  </div>
                  <span className="text-white font-semibold w-8">{match.stats.possession.away}%</span>
                </div>
              </div>

              {/* Shots */}
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">{match.stats.shots.home}</span>
                <span className="text-gray-400">Remates</span>
                <span className="text-white font-semibold">{match.stats.shots.away}</span>
              </div>

              {/* Shots on Target */}
              <div className="flex justify-between items-center">
                <span className="text-white font-semibold">{match.stats.shotsOnTarget.home}</span>
                <span className="text-gray-400">Remates al arco</span>
                <span className="text-white font-semibold">{match.stats.shotsOnTarget.away}</span>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="font-bold text-white mb-4">Eventos del partido</h3>

            <div className="space-y-4">
              {match.events.map((event, index) => (
                <div key={index} className="flex items-center gap-4 p-3 bg-gray-800 rounded-lg">
                  <div className="text-green-500 font-bold text-sm w-8">{event.time}'</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {event.type === "goal" ? "⚽" : event.type === "card" ? "🟨" : "🔄"}
                      </span>
                      <span className="text-white font-medium">{event.player}</span>
                      {event.detail && <span className="text-gray-400 text-sm">({event.detail})</span>}
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">
                    {event.team === "home" ? match.homeTeam.name : match.awayTeam.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="community" className="space-y-4">
          <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-green-500" />
              En la comunidad
            </h3>

            <div className="space-y-4">
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">2,847 usuarios vieron este partido</p>
                <div className="flex items-center justify-center gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">9.2</div>
                    <div className="text-gray-500">Rating promedio</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">892</div>
                    <div className="text-gray-500">Reseñas</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
