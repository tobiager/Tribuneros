"use client"

import { useState, useEffect } from "react"
import { Users, Target, Clock, MapPin, Calendar, Star, Heart, MessageCircle, TrendingUp, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth"
import { supabase } from "@/lib/supabase"

interface MatchDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  match: any
}

interface MatchDetails {
  home_formation?: string
  away_formation?: string
  home_lineup?: any[]
  away_lineup?: any[]
  goals?: any[]
  cards?: any[]
  substitutions?: any[]
  statistics?: any[]
}

interface Comment {
  id: string
  content: string
  likes_count: number
  created_at: string
  user_id: string
  users: {
    username: string
    foto_perfil?: string
  }
  user_liked?: boolean
}

export default function MatchDetailsModal({ isOpen, onClose, match }: MatchDetailsModalProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState("details")
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [userRating, setUserRating] = useState<number | null>(null)
  const [averageRating, setAverageRating] = useState<number>(0)
  const [totalRatings, setTotalRatings] = useState<number>(0)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState("")
  const [sortBy, setSortBy] = useState<"recent" | "popular">("recent")
  const [submittingComment, setSubmittingComment] = useState(false)

  useEffect(() => {
    if (isOpen && match) {
      loadMatchDetails()
      loadRatings()
      loadComments()
    }
  }, [isOpen, match])

  useEffect(() => {
    if (isOpen && match && sortBy) {
      loadComments()
    }
  }, [sortBy])

  const loadMatchDetails = async () => {
    if (!match?.fixture?.id) return

    setLoading(true)
    try {
      const response = await fetch(`/api/matches/${match.fixture.id}/details`)
      if (response.ok) {
        const data = await response.json()
        setMatchDetails(data)
      }
    } catch (error) {
      console.error("Error loading match details:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadRatings = async () => {
    if (!match?.fixture?.id) return

    try {
      // Cargar rating del usuario actual
      if (user) {
        const { data: userRatingData } = await supabase
          .from("match_ratings")
          .select("rating")
          .eq("api_match_id", match.fixture.id)
          .eq("user_id", user.id)
          .single()

        if (userRatingData) {
          setUserRating(userRatingData.rating)
        }
      }

      // Cargar estadísticas generales
      const { data: ratingsData } = await supabase
        .from("match_ratings")
        .select("rating")
        .eq("api_match_id", match.fixture.id)

      if (ratingsData && ratingsData.length > 0) {
        const total = ratingsData.length
        const sum = ratingsData.reduce((acc, r) => acc + r.rating, 0)
        setTotalRatings(total)
        setAverageRating(Math.round((sum / total) * 10) / 10)
      }
    } catch (error) {
      console.error("Error loading ratings:", error)
    }
  }

  const loadComments = async () => {
    if (!match?.fixture?.id) return

    try {
      const orderBy = sortBy === "recent" ? "created_at" : "likes_count"
      const ascending = sortBy === "recent" ? false : false

      const { data: commentsData, error } = await supabase
        .from("match_comments")
        .select(`
          id,
          content,
          likes_count,
          created_at,
          user_id,
          users (
            username,
            foto_perfil
          )
        `)
        .eq("api_match_id", match.fixture.id)
        .order(orderBy, { ascending })

      if (error) throw error

      // Verificar qué comentarios le gustan al usuario actual
      let commentsWithLikes = commentsData || []
      if (user && commentsData) {
        const commentIds = commentsData.map((c) => c.id)
        const { data: likesData } = await supabase
          .from("comment_likes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in("comment_id", commentIds)

        const likedCommentIds = new Set(likesData?.map((l) => l.comment_id) || [])
        commentsWithLikes = commentsData.map((comment) => ({
          ...comment,
          user_liked: likedCommentIds.has(comment.id),
        }))
      }

      setComments(commentsWithLikes)
    } catch (error) {
      console.error("Error loading comments:", error)
    }
  }

  const handleRating = async (rating: number) => {
    if (!user || !match?.fixture?.id) return

    try {
      const { error } = await supabase.from("match_ratings").upsert({
        user_id: user.id,
        api_match_id: match.fixture.id,
        rating,
      })

      if (error) throw error

      setUserRating(rating)
      loadRatings() // Recargar estadísticas
    } catch (error) {
      console.error("Error saving rating:", error)
    }
  }

  const handleSubmitComment = async () => {
    if (!user || !match?.fixture?.id || !newComment.trim()) return

    setSubmittingComment(true)
    try {
      const { error } = await supabase.from("match_comments").insert({
        user_id: user.id,
        api_match_id: match.fixture.id,
        content: newComment.trim(),
      })

      if (error) throw error

      setNewComment("")
      loadComments() // Recargar comentarios
    } catch (error) {
      console.error("Error submitting comment:", error)
    } finally {
      setSubmittingComment(false)
    }
  }

  const handleLikeComment = async (commentId: string, isLiked: boolean) => {
    if (!user) return

    try {
      if (isLiked) {
        // Quitar like
        const { error } = await supabase
          .from("comment_likes")
          .delete()
          .eq("user_id", user.id)
          .eq("comment_id", commentId)

        if (error) throw error
      } else {
        // Agregar like
        const { error } = await supabase.from("comment_likes").insert({
          user_id: user.id,
          comment_id: commentId,
        })

        if (error) throw error
      }

      loadComments() // Recargar comentarios
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const renderStars = (rating: number, interactive = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= rating ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
            } ${interactive ? "cursor-pointer hover:text-yellow-400" : ""}`}
            onClick={interactive ? () => handleRating(star) : undefined}
          />
        ))}
      </div>
    )
  }

  if (!match) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-green-500">
            {match.teams?.home?.name} vs {match.teams?.away?.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="details" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
              <Target className="h-4 w-4 mr-2" />
              Ver detalles
            </TabsTrigger>
            <TabsTrigger value="opinions" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
              <MessageCircle className="h-4 w-4 mr-2" />
              Opiniones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Información básica del partido */}
                <Card className="bg-gray-800 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={match.teams?.home?.logo || "/placeholder.svg"}
                          alt={match.teams?.home?.name}
                          className="w-12 h-12"
                        />
                        <div className="text-center">
                          <div className="text-2xl font-bold">
                            {match.goals?.home || 0} - {match.goals?.away || 0}
                          </div>
                          <div className="text-sm text-gray-400">
                            {match.fixture?.status?.short === "FT" ? "Final" : match.fixture?.status?.long}
                          </div>
                        </div>
                        <img
                          src={match.teams?.away?.logo || "/placeholder.svg"}
                          alt={match.teams?.away?.name}
                          className="w-12 h-12"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span>{match.fixture?.venue?.name || "Estadio no disponible"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span>
                          {new Date(match.fixture?.date).toLocaleDateString("es-AR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-green-500" />
                        <span>
                          {new Date(match.fixture?.date).toLocaleTimeString("es-AR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Formaciones */}
                {matchDetails?.home_formation && matchDetails?.away_formation && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-green-500 flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Formaciones
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-8">
                        <div className="text-center">
                          <h3 className="font-semibold mb-2">{match.teams?.home?.name}</h3>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {matchDetails.home_formation}
                          </Badge>
                        </div>
                        <div className="text-center">
                          <h3 className="font-semibold mb-2">{match.teams?.away?.name}</h3>
                          <Badge variant="outline" className="text-green-400 border-green-400">
                            {matchDetails.away_formation}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Goles */}
                {matchDetails?.goals && matchDetails.goals.length > 0 && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-green-500">⚽ Goles</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {matchDetails.goals.map((goal: any, index: number) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-green-400 border-green-400">
                                {goal.time?.elapsed}'
                              </Badge>
                              <span className="font-medium">{goal.player?.name}</span>
                              {goal.detail === "Penalty" && <span className="text-yellow-400">(Penal)</span>}
                            </div>
                            <div className="text-sm text-gray-400">{goal.team?.name}</div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Estadísticas */}
                {matchDetails?.statistics && matchDetails.statistics.length > 0 && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-green-500 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Estadísticas
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {matchDetails.statistics[0]?.statistics?.map((stat: any, index: number) => {
                          const homeStat = matchDetails.statistics?.[0]?.statistics?.[index]
                          const awayStat = matchDetails.statistics?.[1]?.statistics?.[index]

                          return (
                            <div key={index} className="flex items-center justify-between">
                              <div className="text-right w-20">{homeStat?.value || "0"}</div>
                              <div className="flex-1 text-center text-sm text-gray-400">{stat.type}</div>
                              <div className="text-left w-20">{awayStat?.value || "0"}</div>
                            </div>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="opinions" className="space-y-6">
            {/* Rating del partido */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-500 flex items-center gap-2">
                  <Star className="h-5 w-5" />
                  Calificación del partido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">
                      {averageRating > 0 ? averageRating : "Sin calificar"}
                    </div>
                    <div className="text-sm text-gray-400">
                      {totalRatings} {totalRatings === 1 ? "calificación" : "calificaciones"}
                    </div>
                  </div>
                  {averageRating > 0 && renderStars(averageRating)}
                </div>

                {user ? (
                  <div>
                    <p className="text-sm text-gray-400 mb-2">Tu calificación:</p>
                    {renderStars(userRating || 0, true)}
                  </div>
                ) : (
                  <p className="text-sm text-gray-400">Inicia sesión para calificar este partido</p>
                )}
              </CardContent>
            </Card>

            {/* Comentarios */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-500 flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Comentarios ({comments.length})
                  </CardTitle>
                  <Select value={sortBy} onValueChange={(value: "recent" | "popular") => setSortBy(value)}>
                    <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="recent">Más recientes</SelectItem>
                      <SelectItem value="popular">Más votados</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Agregar comentario */}
                {user ? (
                  <div className="space-y-3">
                    <Textarea
                      placeholder="Escribe tu opinión sobre el partido..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="bg-gray-700 border-gray-600 text-white resize-none"
                      rows={3}
                    />
                    <Button
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submittingComment}
                      className="bg-green-500 hover:bg-green-600 text-black font-semibold"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {submittingComment ? "Enviando..." : "Comentar"}
                    </Button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-4">Inicia sesión para comentar</p>
                )}

                {/* Lista de comentarios */}
                <div className="space-y-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-4 bg-gray-700 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={comment.users?.foto_perfil || "/placeholder.svg"} />
                          <AvatarFallback className="bg-green-600 text-black text-sm">
                            {comment.users?.username?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">{comment.users?.username}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.created_at).toLocaleDateString("es-AR")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-200 mb-2">{comment.content}</p>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLikeComment(comment.id, comment.user_liked || false)}
                              disabled={!user}
                              className={`h-8 px-2 ${
                                comment.user_liked
                                  ? "text-red-400 hover:text-red-300"
                                  : "text-gray-400 hover:text-red-400"
                              }`}
                            >
                              <Heart className={`h-4 w-4 mr-1 ${comment.user_liked ? "fill-current" : ""}`} />
                              {comment.likes_count}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {comments.length === 0 && (
                    <p className="text-center text-gray-400 py-8">Aún no hay comentarios. ¡Sé el primero en opinar!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
