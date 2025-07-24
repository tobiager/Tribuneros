"use client"

import { useState, useEffect } from "react"
import { Play, Heart, MessageCircle, Share2, Upload, Filter, TrendingUp, Clock, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import NavbarEnhanced from "@/components/navbar-enhanced"
import { useAuth } from "@/lib/auth"

interface Moment {
  id: string
  title: string
  description: string
  video_url?: string
  thumbnail_url: string
  match: {
    homeTeam: string
    awayTeam: string
    homeScore: number
    awayScore: number
    competition: string
    date: string
  }
  user: {
    username: string
    avatar_url: string
  }
  minute: number
  likes: number
  comments: number
  created_at: string
  isLiked: boolean
}

export default function MomentsPage() {
  const { user } = useAuth()
  const [moments, setMoments] = useState<Moment[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState("recent")

  // Mock data
  const mockMoments: Moment[] = [
    {
      id: "1",
      title: "Gol de Messi en la final del Mundial",
      description: "El momento que cambió todo. La definición perfecta del GOAT en el momento más importante.",
      video_url: "https://example.com/video1.mp4",
      thumbnail_url: "/placeholder.svg?height=300&width=400&text=Gol+Messi",
      match: {
        homeTeam: "Argentina",
        awayTeam: "Francia",
        homeScore: 3,
        awayScore: 3,
        competition: "Copa del Mundo",
        date: "2022-12-18",
      },
      user: {
        username: "messihincha",
        avatar_url: "/placeholder.svg?height=40&width=40",
      },
      minute: 108,
      likes: 2847,
      comments: 456,
      created_at: "2022-12-18T20:30:00Z",
      isLiked: false,
    },
    {
      id: "2",
      title: "Atajada imposible de Dibu Martínez",
      description: "Cómo puede atajar eso... Dibu nos salvó una vez más. Momento épico de nuestro arquero.",
      video_url: "https://example.com/video2.mp4",
      thumbnail_url: "/placeholder.svg?height=300&width=400&text=Atajada+Dibu",
      match: {
        homeTeam: "Argentina",
        awayTeam: "Francia",
        homeScore: 3,
        awayScore: 3,
        competition: "Copa del Mundo",
        date: "2022-12-18",
      },
      user: {
        username: "dibupower",
        avatar_url: "/placeholder.svg?height=40&width=40",
      },
      minute: 123,
      likes: 1934,
      comments: 287,
      created_at: "2022-12-18T21:15:00Z",
      isLiked: true,
    },
    {
      id: "3",
      title: "Gol de Julián en el Superclásico",
      description: "Qué golazo de Julián! Así se define un Superclásico. River campeón!",
      video_url: "https://example.com/video3.mp4",
      thumbnail_url: "/placeholder.svg?height=300&width=400&text=Gol+Julian",
      match: {
        homeTeam: "River Plate",
        awayTeam: "Boca Juniors",
        homeScore: 2,
        awayScore: 1,
        competition: "Liga Profesional",
        date: "2023-10-15",
      },
      user: {
        username: "riverplate",
        avatar_url: "/placeholder.svg?height=40&width=40",
      },
      minute: 67,
      likes: 1567,
      comments: 234,
      created_at: "2023-10-15T19:45:00Z",
      isLiked: false,
    },
  ]

  useEffect(() => {
    loadMoments()
  }, [sortBy])

  const loadMoments = async () => {
    setLoading(true)
    // Simulate API call
    setTimeout(() => {
      const sortedMoments = [...mockMoments]

      if (sortBy === "popular") {
        sortedMoments.sort((a, b) => b.likes - a.likes)
      } else {
        sortedMoments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      }

      setMoments(sortedMoments)
      setLoading(false)
    }, 1000)
  }

  const handleLike = (momentId: string) => {
    setMoments((prev) =>
      prev.map((moment) =>
        moment.id === momentId
          ? {
              ...moment,
              isLiked: !moment.isLiked,
              likes: moment.isLiked ? moment.likes - 1 : moment.likes + 1,
            }
          : moment,
      ),
    )
  }

  const MomentCard = ({ moment }: { moment: Moment }) => (
    <Card className="bg-gray-900 border-gray-800 hover:border-green-500/30 transition-all duration-300 overflow-hidden group">
      <CardContent className="p-0">
        {/* Video Thumbnail */}
        <div className="relative aspect-video bg-gray-800 overflow-hidden">
          <img
            src={moment.thumbnail_url || "/placeholder.svg"}
            alt={moment.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Button size="lg" className="bg-green-500/90 hover:bg-green-600 text-black rounded-full p-4">
              <Play className="h-6 w-6" />
            </Button>
          </div>

          {/* Match Info Overlay */}
          <div className="absolute top-4 left-4">
            <Badge className="bg-black/70 text-white border-0">{moment.match.competition}</Badge>
          </div>

          {/* Minute Badge */}
          <div className="absolute top-4 right-4">
            <Badge className="bg-green-500 text-black font-bold">{moment.minute}'</Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* User Info */}
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={moment.user.avatar_url || "/placeholder.svg"} />
              <AvatarFallback className="bg-green-600 text-black text-xs font-semibold">
                {moment.user.username[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-medium text-white text-sm">{moment.user.username}</div>
              <div className="text-xs text-gray-500">{new Date(moment.created_at).toLocaleDateString("es-AR")}</div>
            </div>
          </div>

          {/* Match Score */}
          <div className="text-center mb-3 p-2 bg-gray-800 rounded-lg">
            <div className="text-sm text-gray-400 mb-1">{moment.match.date}</div>
            <div className="font-bold text-white">
              {moment.match.homeTeam} {moment.match.homeScore} - {moment.match.awayScore} {moment.match.awayTeam}
            </div>
          </div>

          {/* Title and Description */}
          <h3 className="font-bold text-white mb-2 line-clamp-2">{moment.title}</h3>
          <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">{moment.description}</p>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLike(moment.id)}
                className={`p-2 ${
                  moment.isLiked ? "text-red-500 hover:text-red-400" : "text-gray-400 hover:text-red-500"
                }`}
              >
                <Heart className={`h-5 w-5 ${moment.isLiked ? "fill-current" : ""}`} />
                <span className="ml-1 text-sm">{moment.likes.toLocaleString()}</span>
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500 p-2">
                <MessageCircle className="h-5 w-5" />
                <span className="ml-1 text-sm">{moment.comments}</span>
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500 p-2">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black font-semibold">
              Ver completo
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavbarEnhanced />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Cargando momentos...</p>
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Momentos</h1>
            <p className="text-gray-400">Los mejores highlights y videos de la comunidad</p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48 bg-gray-900 border-gray-700 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="recent">Más recientes</SelectItem>
                <SelectItem value="popular">Más populares</SelectItem>
              </SelectContent>
            </Select>

            {user && (
              <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">
                <Upload className="h-4 w-4 mr-2" />
                Subir momento
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-8">
          <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-800/50 h-12 rounded-xl">
            <TabsTrigger
              value="all"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              {sortBy === "recent" ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Recientes
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Populares
                </>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="data-[state=active]:bg-green-500 data-[state=active]:text-black font-semibold rounded-lg"
            >
              <Star className="h-4 w-4 mr-2" />
              Siguiendo
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">
                {sortBy === "recent" ? "Momentos más recientes" : "Momentos más populares"}
              </h2>
              <span className="text-sm text-gray-400">{moments.length} momentos</span>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {moments.map((moment) => (
                <MomentCard key={moment.id} moment={moment} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <div className="text-center py-12">
              <Star className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {user ? "Seguí a otros usuarios" : "Inicia sesión"}
              </h3>
              <p className="text-gray-400 mb-6">
                {user
                  ? "Los momentos de usuarios que sigas aparecerán aquí"
                  : "Inicia sesión para ver momentos de usuarios que sigas"}
              </p>
              {!user && (
                <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">Iniciar sesión</Button>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
