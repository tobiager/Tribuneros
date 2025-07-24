import { Search, TrendingUp, Trophy, Calendar } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navigation from "@/components/navigation"
import DesktopNavbar from "@/components/desktop-navbar"

export default function ExplorePage() {
  const trendingMatches = [
    {
      teams: "Argentina vs Brasil",
      logos: "🇦🇷🇧🇷",
      competition: "Eliminatorias",
      viewers: 2847,
      avgRating: 9.2,
      date: "21 nov 2023",
    },
    {
      teams: "Real Madrid vs Barcelona",
      logos: "⚪🔵🔴",
      competition: "El Clásico",
      viewers: 1934,
      avgRating: 8.8,
      date: "28 oct 2023",
    },
    {
      teams: "River vs Boca",
      logos: "🔴⚪🔵🟡",
      competition: "Superclásico",
      viewers: 1567,
      avgRating: 9.1,
      date: "15 oct 2023",
    },
  ]

  const topTeams = [
    { name: "Argentina", logo: "🇦🇷", followers: 15420, matches: 234 },
    { name: "Real Madrid", logo: "⚪", followers: 12890, matches: 189 },
    { name: "River Plate", logo: "🔴⚪", followers: 8934, matches: 156 },
    { name: "Barcelona", logo: "🔵🔴", followers: 7823, matches: 143 },
  ]

  const upcomingMatches = [
    {
      teams: "Argentina vs Uruguay",
      logos: "🇦🇷🇺🇾",
      date: "16 nov 2023",
      time: "21:00",
      competition: "Eliminatorias",
      interested: 1234,
    },
    {
      teams: "River vs Racing",
      logos: "🔴⚪⚫⚪",
      date: "19 nov 2023",
      time: "17:00",
      competition: "Liga Profesional",
      interested: 567,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Desktop Navbar */}
      <div className="hidden lg:block">
        <DesktopNavbar />
      </div>

      <div className="max-w-6xl mx-auto">
        {/* Mobile Header */}
        <div className="lg:hidden sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 p-4">
          <h1 className="text-xl font-bold text-green-500">Explorar</h1>
          <p className="text-sm text-gray-400">Descubre partidos y equipos</p>
        </div>

        <div className="p-4 lg:p-8 pb-20 lg:pb-8">
          {/* Search */}
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar partidos, equipos, ligas..."
                className="pl-12 h-12 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 focus:border-green-500 text-lg"
              />
            </div>
          </div>

          <Tabs defaultValue="trending" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800 h-12">
              <TabsTrigger value="trending" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                🔥 Trending
              </TabsTrigger>
              <TabsTrigger value="teams" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                🏆 Equipos
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
                📅 Próximos
              </TabsTrigger>
            </TabsList>

            <TabsContent value="trending" className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-bold">Partidos más vistos</h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {trendingMatches.map((match, index) => (
                  <Card
                    key={index}
                    className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{match.logos}</span>
                          <div>
                            <h3 className="font-bold text-lg">{match.teams}</h3>
                            <p className="text-sm text-gray-400">{match.competition}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-500">{match.avgRating}/10</div>
                          <div className="text-xs text-gray-400">Rating</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{match.date}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-green-500">{match.viewers.toLocaleString()} lo vieron</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Trophy className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-bold">Equipos populares</h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {topTeams.map((team, index) => (
                  <Card
                    key={index}
                    className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="text-4xl">{team.logo}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{team.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                            <span>{team.followers.toLocaleString()} seguidores</span>
                            <span>{team.matches} partidos registrados</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black font-semibold">
                          Seguir
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="upcoming" className="space-y-4">
              <div className="flex items-center gap-2 mb-6">
                <Calendar className="h-6 w-6 text-green-500" />
                <h2 className="text-xl font-bold">Próximos partidos</h2>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {upcomingMatches.map((match, index) => (
                  <Card
                    key={index}
                    className="bg-gray-900 border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{match.logos}</span>
                          <div>
                            <h3 className="font-bold text-lg">{match.teams}</h3>
                            <p className="text-sm text-gray-400">{match.competition}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-500">{match.time}</div>
                          <div className="text-sm text-gray-400">{match.date}</div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">{match.interested} interesados</span>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black bg-transparent"
                        >
                          Me interesa
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden">
        <Navigation />
      </div>
    </div>
  )
}
