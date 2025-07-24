import { MapPin, Users, TrendingUp, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navigation from "@/components/navigation"

export default function ScoresPage() {
  const liveMatches = [
    {
      teams: "River vs Estudiantes",
      score: "2-1",
      time: "78'",
      competition: "Liga Profesional",
      viewers: 234,
    },
    {
      teams: "Barcelona vs Real Madrid",
      score: "1-1",
      time: "45+2'",
      competition: "La Liga",
      viewers: 1247,
    },
  ]

  const todayMatches = [
    {
      teams: "Boca vs Racing",
      time: "21:30",
      competition: "Liga Profesional",
      stadium: "La Bombonera",
      viewers: 89,
    },
    {
      teams: "Argentina vs Uruguay",
      time: "20:00",
      competition: "Eliminatorias",
      stadium: "Monumental",
      viewers: 456,
    },
  ]

  const popularMatches = [
    {
      teams: "Argentina 3-3 Francia",
      date: "18 dic 2022",
      viewers: 2847,
      avgRating: 9.8,
      reviews: 1205,
    },
    {
      teams: "River 2-1 Boca",
      date: "15 oct 2023",
      viewers: 892,
      avgRating: 8.9,
      reviews: 456,
    },
    {
      teams: "Real Madrid 5-0 Barcelona",
      date: "28 oct 2023",
      viewers: 1234,
      avgRating: 9.2,
      reviews: 678,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-md mx-auto bg-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 p-4">
          <h1 className="text-xl font-bold text-green-500">Scores</h1>
          <p className="text-sm text-gray-400">Partidos en vivo y populares</p>
        </div>

        <div className="p-4 pb-20">
          <Tabs defaultValue="live" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="live" className="data-[state=active]:bg-green-600">
                En Vivo
              </TabsTrigger>
              <TabsTrigger value="today" className="data-[state=active]:bg-green-600">
                Hoy
              </TabsTrigger>
              <TabsTrigger value="popular" className="data-[state=active]:bg-green-600">
                Popular
              </TabsTrigger>
            </TabsList>

            <TabsContent value="live" className="space-y-4">
              {liveMatches.length > 0 ? (
                liveMatches.map((match, index) => (
                  <Card key={index} className="bg-gray-900 border-gray-800 border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-bold text-lg">{match.teams}</h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive" className="animate-pulse">
                            LIVE
                          </Badge>
                          <span className="text-red-500 font-bold">{match.time}</span>
                        </div>
                      </div>

                      <div className="text-center mb-3">
                        <span className="text-3xl font-bold text-green-500">{match.score}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <span>{match.competition}</span>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{match.viewers} viendo</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-8 text-center">
                    <Clock className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No hay partidos en vivo ahora</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="today" className="space-y-4">
              {todayMatches.map((match, index) => (
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{match.teams}</h3>
                      <span className="text-green-500 font-bold">{match.time}</span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                      <span>{match.competition}</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {match.stadium}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-sm text-gray-400">
                      <Users className="h-4 w-4" />
                      <span>{match.viewers} planean verlo</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="popular" className="space-y-4">
              {popularMatches.map((match, index) => (
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{match.teams}</h3>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4 text-green-500" />
                        <span className="text-green-500 font-bold">{match.avgRating}/10</span>
                      </div>
                    </div>

                    <div className="text-sm text-gray-400 mb-3">{match.date}</div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Users className="h-4 w-4" />
                        <span>{match.viewers} lo vieron</span>
                      </div>
                      <span className="text-green-500">{match.reviews} reseñas</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <Navigation />
      </div>
    </div>
  )
}
