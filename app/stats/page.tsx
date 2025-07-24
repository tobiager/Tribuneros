"use client"

import { useEffect, useState } from "react"
import { Trophy, Users, Heart, TrendingUp, Award, Star, BarChart3, Target } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NavbarEnhanced from "@/components/navbar-enhanced"

interface TopUser {
  id: string
  username: string
  avatar_url: string
  matches_count: number
  average_rating: number
  favorite_team: string
}

interface TopTeam {
  id: number
  name: string
  logo: string
  followers_count: number
  matches_registered: number
  average_rating: number
}

interface GlobalStats {
  total_users: number
  total_matches: number
  total_comments: number
  average_rating: number
  most_popular_emotion: string
  most_watched_match: string
}

export default function StatsPage() {
  const [loading, setLoading] = useState(true)
  const [globalStats, setGlobalStats] = useState<GlobalStats | null>(null)
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [topTeams, setTopTeams] = useState<TopTeam[]>([])

  // Mock data
  const mockGlobalStats: GlobalStats = {
    total_users: 12547,
    total_matches: 89234,
    total_comments: 156789,
    average_rating: 7.8,
    most_popular_emotion: "Épico",
    most_watched_match: "Argentina 3-3 Francia (Final Mundial)",
  }

  const mockTopUsers: TopUser[] = [
    {
      id: "1",
      username: "futbolero_arg",
      avatar_url: "/placeholder.svg?height=40&width=40",
      matches_count: 1247,
      average_rating: 8.9,
      favorite_team: "Argentina",
    },
    {
      id: "2",
      username: "riverplate_fan",
      avatar_url: "/placeholder.svg?height=40&width=40",
      matches_count: 1156,
      average_rating: 8.7,
      favorite_team: "River Plate",
    },
    {
      id: "3",
      username: "messi_lover",
      avatar_url: "/placeholder.svg?height=40&width=40",
      matches_count: 1089,
      average_rating: 9.2,
      favorite_team: "Barcelona",
    },
    {
      id: "4",
      username: "boca_pasion",
      avatar_url: "/placeholder.svg?height=40&width=40",
      matches_count: 987,
      average_rating: 8.4,
      favorite_team: "Boca Juniors",
    },
    {
      id: "5",
      username: "real_madrid_fan",
      avatar_url: "/placeholder.svg?height=40&width=40",
      matches_count: 934,
      average_rating: 8.6,
      favorite_team: "Real Madrid",
    },
  ]

  const mockTopTeams: TopTeam[] = [
    {
      id: 1,
      name: "Argentina",
      logo: "🇦🇷",
      followers_count: 8947,
      matches_registered: 2341,
      average_rating: 9.1,
    },
    {
      id: 2,
      name: "Real Madrid",
      logo: "⚪",
      followers_count: 7823,
      matches_registered: 1987,
      average_rating: 8.8,
    },
    {
      id: 3,
      name: "River Plate",
      logo: "🔴⚪",
      followers_count: 6754,
      matches_registered: 1654,
      average_rating: 8.9,
    },
    {
      id: 4,
      name: "Barcelona",
      logo: "🔵🔴",
      followers_count: 6234,
      matches_registered: 1543,
      average_rating: 8.7,
    },
    {
      id: 5,
      name: "Boca Juniors",
      logo: "🔵🟡",
      followers_count: 5987,
      matches_registered: 1432,
      average_rating: 8.5,
    },
  ]

  const emotions = [
    { name: "Épico", count: 23456, percentage: 28 },
    { name: "Emocionante", count: 19234, percentage: 23 },
    { name: "Histórico", count: 15678, percentage: 19 },
    { name: "Me rompió", count: 12345, percentage: 15 },
    { name: "Aburrido", count: 8901, percentage: 11 },
    { name: "Decepcionante", count: 3456, percentage: 4 },
  ]

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      setGlobalStats(mockGlobalStats)
      setTopUsers(mockTopUsers)
      setTopTeams(mockTopTeams)
      setLoading(false)
    }, 1000)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavbarEnhanced />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Cargando estadísticas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <NavbarEnhanced />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Estadísticas <span className="text-green-500">Globales</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Rankings, métricas y datos de toda la comunidad de TRIBUNEROS
          </p>
        </div>

        {/* Global Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <Users className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{globalStats?.total_users.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Usuarios activos</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <BarChart3 className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{globalStats?.total_matches.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Partidos registrados</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <Heart className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{globalStats?.total_comments.toLocaleString()}</div>
              <div className="text-sm text-gray-500">Comentarios</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800 text-center">
            <CardContent className="p-6">
              <Star className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <div className="text-3xl font-bold text-white mb-1">{globalStats?.average_rating}/10</div>
              <div className="text-sm text-gray-500">Rating promedio</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users" className="space-y-8">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 bg-gray-800/50 h-12 rounded-xl">
            <TabsTrigger
              value="users"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Top Users
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              <Award className="h-4 w-4 mr-2" />
              Equipos
            </TabsTrigger>
            <TabsTrigger
              value="emotions"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              <Target className="h-4 w-4 mr-2" />
              Emociones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-500 flex items-center gap-2">
                  <Trophy className="h-6 w-6" />
                  Top Usuarios con Más Partidos Registrados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topUsers.map((user, index) => (
                    <div key={user.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? "bg-yellow-500 text-black"
                              : index === 1
                                ? "bg-gray-400 text-black"
                                : index === 2
                                  ? "bg-amber-600 text-black"
                                  : "bg-gray-700 text-white"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="bg-green-600 text-black font-semibold">
                            {user.username[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-white">{user.username}</div>
                        <div className="text-sm text-gray-400">❤️ {user.favorite_team}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">{user.matches_count.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">partidos</div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-500">{user.average_rating}/10</div>
                        <div className="text-sm text-gray-400">rating</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-500 flex items-center gap-2">
                  <Award className="h-6 w-6" />
                  Equipos Más Seguidos en la Plataforma
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topTeams.map((team, index) => (
                    <div key={team.id} className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0
                              ? "bg-yellow-500 text-black"
                              : index === 1
                                ? "bg-gray-400 text-black"
                                : index === 2
                                  ? "bg-amber-600 text-black"
                                  : "bg-gray-700 text-white"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="text-4xl">{team.logo}</div>
                      </div>

                      <div className="flex-1">
                        <div className="font-semibold text-white text-lg">{team.name}</div>
                        <div className="text-sm text-gray-400">
                          {team.matches_registered.toLocaleString()} partidos registrados
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-500">{team.followers_count.toLocaleString()}</div>
                        <div className="text-sm text-gray-400">seguidores</div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-500">{team.average_rating}/10</div>
                        <div className="text-sm text-gray-400">rating</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="emotions" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-green-500 flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    Emociones Más Registradas
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {emotions.map((emotion, index) => (
                      <div key={emotion.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-white">{emotion.name}</span>
                          <span className="text-green-500 font-semibold">
                            {emotion.count.toLocaleString()} ({emotion.percentage}%)
                          </span>
                        </div>
                        <Progress value={emotion.percentage} className="h-2 bg-gray-800" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-green-500 flex items-center gap-2">
                    <TrendingUp className="h-6 w-6" />
                    Datos Destacados
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-sm text-gray-400 mb-2">Partido más visto</div>
                    <div className="font-semibold text-white text-lg">{globalStats?.most_watched_match}</div>
                    <div className="text-green-500 text-sm">2,847 usuarios lo vieron</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Emoción de la semana</div>
                    <div className="font-semibold text-white text-lg">{globalStats?.most_popular_emotion}</div>
                    <div className="text-green-500 text-sm">+15% vs semana anterior</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Promedio global</div>
                    <div className="font-semibold text-white text-lg">{globalStats?.average_rating}/10</div>
                    <div className="text-green-500 text-sm">Rating de todos los partidos</div>
                  </div>

                  <div>
                    <div className="text-sm text-gray-400 mb-2">Crecimiento mensual</div>
                    <div className="font-semibold text-white text-lg">+23%</div>
                    <div className="text-green-500 text-sm">Nuevos usuarios este mes</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
