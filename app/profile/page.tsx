"use client"

import { useEffect, useState } from "react"
import { Edit, Camera, MapPin, Calendar, Trophy, BarChart3, Eye, Star, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth"
import { Database } from "@/lib/database"

export default function ProfilePage() {
  const { user } = useAuth()
  const [editing, setEditing] = useState(false)
  const [userStats, setUserStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Mock user data - in real app, get from database
  const [profileData, setProfileData] = useState({
    name: "Juan Pérez",
    username: "juanhincha",
    bio: "Hincha de River desde la cuna 🔴⚪ | Viví el Mundial en Qatar 🏆 | El fútbol es pasión",
    location: "Buenos Aires, Argentina",
    avatar_url: "/placeholder.svg?height=120&width=120",
    favorite_teams: [
      { name: "River Plate", logo: "🔴⚪", matches: 45 },
      { name: "Argentina", logo: "🇦🇷", matches: 23 },
      { name: "Real Madrid", logo: "⚪", matches: 18 },
    ],
    joined_date: "2022-03-15",
  })

  useEffect(() => {
    if (user) {
      loadUserData()
    }
  }, [user])

  const loadUserData = async () => {
    if (!user) return

    setLoading(true)
    try {
      const stats = await Database.getUserStats(user.id)
      setUserStats(stats)
    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveProfile = () => {
    // Save profile data to database
    setEditing(false)
  }

  const stats = {
    totalMatches: userStats?.totalMatches || 127,
    averageRating: userStats?.averageRating || 8.4,
    stadiumMatches: userStats?.contextoStats?.estadio || 23,
    tvMatches: userStats?.contextoStats?.tv || 104,
    topEmotion: userStats?.topEmociones?.[0]?.emocion || "Épico",
    followers: 2847,
    following: 1234,
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-gray-400 text-lg">Debes iniciar sesión para ver tu perfil</p>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Cargando perfil...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="bg-gray-900 border-gray-800 mb-8">
          <CardContent className="p-0">
            {/* Cover Image */}
            <div className="relative h-48 bg-gradient-to-r from-green-600/20 to-green-800/20 rounded-t-lg">
              <div className="absolute inset-0 bg-black/20 rounded-t-lg" />
              <div className="absolute bottom-4 right-4">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-600 text-white hover:bg-gray-800 bg-black/50 backdrop-blur-sm"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Cambiar portada
                </Button>
              </div>
            </div>

            <div className="px-6 pb-6">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col sm:flex-row items-start sm:items-end gap-6 -mt-16 mb-6">
                <div className="relative">
                  <Avatar className="h-32 w-32 border-4 border-gray-900">
                    <AvatarImage src={profileData.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="bg-green-600 text-black text-4xl font-bold">
                      {profileData.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full p-2 border-gray-600 bg-gray-900 hover:bg-gray-800"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex-1">
                  {editing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="name">Nombre</Label>
                        <Input
                          id="name"
                          value={profileData.name}
                          onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="username">Nombre de usuario</Label>
                        <Input
                          id="username"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio">Biografía</Label>
                        <Textarea
                          id="bio"
                          value={profileData.bio}
                          onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Ubicación</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => setProfileData({ ...profileData, location: e.target.value })}
                          className="bg-gray-800 border-gray-700 text-white"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h1 className="text-3xl font-bold text-white mb-2">{profileData.name}</h1>
                      <p className="text-gray-400 mb-4">@{profileData.username}</p>
                      <p className="text-gray-300 mb-4 leading-relaxed">{profileData.bio}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span>{profileData.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Se unió en{" "}
                            {new Date(profileData.joined_date).toLocaleDateString("es-AR", {
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Favorite Teams */}
                  <div className="flex items-center gap-3 mb-6">
                    {profileData.favorite_teams.map((team, index) => (
                      <div key={index} className="flex items-center gap-2 bg-gray-800 rounded-full px-3 py-1">
                        <span className="text-xl">{team.logo}</span>
                        <span className="text-sm font-medium">{team.name}</span>
                        <Badge variant="secondary" className="bg-green-500/20 text-green-400 text-xs">
                          {team.matches}
                        </Badge>
                      </div>
                    ))}
                  </div>

                  {/* Follow Stats */}
                  <div className="flex items-center gap-6 text-sm mb-6">
                    <div>
                      <span className="font-semibold text-white">{stats.following.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">Siguiendo</span>
                    </div>
                    <div>
                      <span className="font-semibold text-white">{stats.followers.toLocaleString()}</span>
                      <span className="text-gray-500 ml-1">Seguidores</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  {editing ? (
                    <>
                      <Button
                        onClick={handleSaveProfile}
                        className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                      >
                        Guardar cambios
                      </Button>
                      <Button
                        onClick={() => setEditing(false)}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        Cancelar
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => setEditing(true)}
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar perfil
                      </Button>
                      <Button
                        variant="outline"
                        className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">{stats.totalMatches}</div>
              <div className="text-sm text-gray-500">Partidos vistos</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">{stats.averageRating}</div>
              <div className="text-sm text-gray-500">Rating promedio</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">{stats.stadiumMatches}</div>
              <div className="text-sm text-gray-500">En estadio</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-500 mb-1">{stats.tvMatches}</div>
              <div className="text-sm text-gray-500">Por TV</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="p-4 text-center">
              <div className="text-lg font-bold text-green-500 mb-1">{stats.topEmotion}</div>
              <div className="text-sm text-gray-500">Emoción frecuente</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="activity" className="space-y-6">
          <TabsList className="grid w-full max-w-2xl grid-cols-4 bg-gray-800/50 h-12 rounded-xl">
            <TabsTrigger
              value="activity"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              <Eye className="h-4 w-4 mr-2" />
              Actividad
            </TabsTrigger>
            <TabsTrigger
              value="stats"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger
              value="moments"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              <Star className="h-4 w-4 mr-2" />
              Momentos
            </TabsTrigger>
            <TabsTrigger
              value="teams"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Equipos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-500">Actividad reciente</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <p className="text-gray-400">Tu actividad reciente aparecerá aquí</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-green-500">Contexto de visualización</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      🏟️ <span>Estadio</span>
                    </span>
                    <span className="text-green-500 font-semibold">{stats.stadiumMatches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2">
                      📺 <span>TV</span>
                    </span>
                    <span className="text-green-500 font-semibold">{stats.tvMatches}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-800">
                <CardHeader>
                  <CardTitle className="text-green-500">Resumen general</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total partidos:</span>
                    <span className="text-green-500 font-semibold">{stats.totalMatches}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Rating promedio:</span>
                    <span className="text-green-500 font-semibold">{stats.averageRating}/10</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Emoción frecuente:</span>
                    <span className="text-green-500 font-semibold">{stats.topEmotion}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="moments" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-500">Galería de momentos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400 mb-4">Aún no has guardado momentos especiales</p>
                  <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">
                    Subir primer momento
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-green-500">Equipos favoritos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profileData.favorite_teams.map((team, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{team.logo}</span>
                        <div>
                          <div className="font-semibold text-white">{team.name}</div>
                          <div className="text-sm text-gray-400">{team.matches} partidos registrados</div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
                      >
                        Ver partidos
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
