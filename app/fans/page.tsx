import { Search, UserPlus, Users, Trophy, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Navigation from "@/components/navigation"

export default function FansPage() {
  const topUsers = [
    {
      name: "Carlos Futbolero",
      username: "carlosfutbol",
      avatar: "/placeholder.svg?height=40&width=40",
      team: "Racing",
      matches: 127,
      followers: 2341,
      avgRating: 8.9,
      isFollowing: false,
    },
    {
      name: "María Hincha",
      username: "mariahincha",
      avatar: "/placeholder.svg?height=40&width=40",
      team: "Boca",
      matches: 98,
      followers: 1876,
      avgRating: 9.1,
      isFollowing: true,
    },
    {
      name: "Diego Pasión",
      username: "diegopasion",
      avatar: "/placeholder.svg?height=40&width=40",
      team: "San Lorenzo",
      matches: 156,
      followers: 3421,
      avgRating: 8.7,
      isFollowing: false,
    },
  ]

  const suggestedUsers = [
    {
      name: "Ana Futbol",
      username: "anafutbol",
      avatar: "/placeholder.svg?height=40&width=40",
      team: "Independiente",
      matches: 67,
      mutualFollows: 12,
    },
    {
      name: "Martín Cancha",
      username: "martincancha",
      avatar: "/placeholder.svg?height=40&width=40",
      team: "Estudiantes",
      matches: 89,
      mutualFollows: 8,
    },
  ]

  const recentActivity = [
    {
      user: "María Hincha",
      username: "mariahincha",
      avatar: "/placeholder.svg?height=32&width=32",
      action: "puntuó",
      match: "Boca 2-1 River",
      rating: 9,
      timeAgo: "2h",
    },
    {
      user: "Carlos Futbolero",
      username: "carlosfutbol",
      avatar: "/placeholder.svg?height=32&width=32",
      action: "agregó a su lista",
      match: "Racing 1-0 Independiente",
      list: "Clásicos de Avellaneda",
      timeAgo: "4h",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-md mx-auto bg-gray-950">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 p-4">
          <h1 className="text-xl font-bold text-green-500">Comunidad</h1>
          <p className="text-sm text-gray-400">Conecta con otros hinchas</p>
        </div>

        <div className="p-4 pb-20">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar hinchas..."
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
          </div>

          <Tabs defaultValue="top" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3 bg-gray-800">
              <TabsTrigger value="top" className="data-[state=active]:bg-green-600">
                Top
              </TabsTrigger>
              <TabsTrigger value="suggested" className="data-[state=active]:bg-green-600">
                Sugeridos
              </TabsTrigger>
              <TabsTrigger value="activity" className="data-[state=active]:bg-green-600">
                Actividad
              </TabsTrigger>
            </TabsList>

            <TabsContent value="top" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="h-5 w-5 text-green-500" />
                <span className="text-green-500 font-semibold">Tribuneros más activos</span>
              </div>

              {topUsers.map((user, index) => (
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-green-600">{user.name[0]}</AvatarFallback>
                        </Avatar>
                        {index < 3 && (
                          <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-green-600 text-xs">
                            {index + 1}
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{user.name}</span>
                          <span className="text-sm text-gray-400">@{user.username}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <span>❤️ {user.team}</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span>{user.matches} partidos</span>
                          <span>{user.followers} seguidores</span>
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-green-500 text-green-500" />
                            <span>{user.avgRating}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        variant={user.isFollowing ? "outline" : "default"}
                        className={
                          user.isFollowing
                            ? "border-green-500 text-green-500 hover:bg-green-500 hover:text-black"
                            : "bg-green-600 hover:bg-green-700 text-black"
                        }
                      >
                        {user.isFollowing ? "Siguiendo" : "Seguir"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="suggested" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="h-5 w-5 text-green-500" />
                <span className="text-green-500 font-semibold">Hinchas que podrían interesarte</span>
              </div>

              {suggestedUsers.map((user, index) => (
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={user.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-green-600">{user.name[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{user.name}</span>
                          <span className="text-sm text-gray-400">@{user.username}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <span>❤️ {user.team}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {user.matches} partidos • {user.mutualFollows} amigos en común
                        </div>
                      </div>

                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-black">
                        Seguir
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-green-500" />
                <span className="text-green-500 font-semibold">Actividad reciente</span>
              </div>

              {recentActivity.map((activity, index) => (
                <Card key={index} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={activity.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-green-600 text-xs">{activity.user[0]}</AvatarFallback>
                      </Avatar>

                      <div className="flex-1">
                        <div className="text-sm">
                          <span className="font-semibold">{activity.user}</span>
                          <span className="text-gray-400"> {activity.action} </span>
                          <span className="font-semibold">{activity.match}</span>
                          {activity.rating && <span className="text-green-500"> {activity.rating}/10</span>}
                          {activity.list && <span className="text-green-500"> "{activity.list}"</span>}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{activity.timeAgo}</div>
                      </div>
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
