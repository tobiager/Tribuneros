"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Star, Eye, MessageCircle, Users, Calendar, Clock, MapPin } from "lucide-react"
import { toast } from "sonner"
import { addMatchView, addMatchOpinion, getMatchOpinions } from "@/lib/database-actions"
import type { ApiFootballMatch, MatchOpinion } from "@/lib/types"

interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
  match: ApiFootballMatch | any
  modalType: "view" | "opinion" | "opinions-list" | null
}

export default function MatchModal({ isOpen, onClose, match, modalType }: MatchModalProps) {
  const [viewType, setViewType] = useState<"stadium" | "tv">("tv")
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState("")
  const [loading, setLoading] = useState(false)
  const [opinions, setOpinions] = useState<MatchOpinion[]>([])

  useEffect(() => {
    if (modalType === "opinions-list" && isOpen) {
      loadOpinions()
    }
  }, [modalType, isOpen])

  if (!match) return null

  const isFromAPI = !!match.fixture
  const matchId = isFromAPI ? match.fixture.id : match.id
  const homeTeam = isFromAPI ? match.teams.home : match.home_team || { name: match.manual_home_team }
  const awayTeam = isFromAPI ? match.teams.away : match.away_team || { name: match.manual_away_team }
  const homeScore = isFromAPI ? match.goals.home : match.home_score
  const awayScore = isFromAPI ? match.goals.away : match.away_score
  const matchDate = isFromAPI ? match.fixture.date : match.match_date
  const status = isFromAPI ? match.fixture.status.short : match.status
  const league = isFromAPI ? match.league : { name: match.league_name, logo: match.league_logo_url }
  const venue = isFromAPI ? match.fixture.venue : { name: match.venue_name }

  const handleSubmitView = async () => {
    setLoading(true)
    try {
      const result = await addMatchView(matchId, viewType)
      if (result.success) {
        toast.success("¡Vista registrada correctamente!")
        onClose()
      } else {
        toast.error(result.error || "Error al registrar vista")
      }
    } catch (error) {
      toast.error("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitOpinion = async () => {
    if (!comment.trim()) {
      toast.error("Por favor escribe un comentario")
      return
    }

    setLoading(true)
    try {
      const result = await addMatchOpinion(matchId, rating, comment.trim())
      if (result.success) {
        toast.success("¡Opinión registrada correctamente!")
        onClose()
      } else {
        toast.error(result.error || "Error al registrar opinión")
      }
    } catch (error) {
      toast.error("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const loadOpinions = async () => {
    setLoading(true)
    try {
      const result = await getMatchOpinions(matchId)
      if (result.success) {
        setOpinions(result.data)
      }
    } catch (error) {
      console.error("Error loading opinions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      NS: "Por jugarse",
      "1H": "1er Tiempo",
      HT: "Entretiempo",
      "2H": "2do Tiempo",
      FT: "Finalizado",
      AET: "Finalizado (TE)",
      PEN: "Finalizado (PEN)",
      LIVE: "En Vivo",
      CANC: "Cancelado",
      PST: "Postergado",
    }
    return statusMap[status] || "En Vivo"
  }

  const getStatusColor = (status: string) => {
    if (["1H", "2H", "HT", "LIVE"].includes(status)) return "bg-red-500/20 text-red-400 border-red-500/30"
    if (["FT", "AET", "PEN"].includes(status)) return "bg-green-500/20 text-green-400 border-green-500/30"
    if (["CANC", "PST"].includes(status)) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    return "bg-blue-500/20 text-blue-400 border-blue-500/30"
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {modalType === "view" && <Eye className="h-5 w-5" />}
            {modalType === "opinion" && <MessageCircle className="h-5 w-5" />}
            {modalType === "opinions-list" && <Users className="h-5 w-5" />}

            {modalType === "view" && "Registrar Vista"}
            {modalType === "opinion" && "Agregar Opinión"}
            {modalType === "opinions-list" && "Opiniones del Partido"}
          </DialogTitle>
        </DialogHeader>

        {/* Match Info Header */}
        <div className="border-b border-gray-800 pb-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img
                src={league.logo || "/placeholder.svg"}
                alt={league.name}
                className="h-5 w-5"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <span className="text-sm text-gray-400">{league.name}</span>
            </div>
            <Badge className={getStatusColor(status)}>{getStatusText(status)}</Badge>
          </div>

          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <img
                src={homeTeam.logo || "/placeholder.svg"}
                alt={homeTeam.name}
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <span className="font-semibold">{homeTeam.name}</span>
            </div>

            <div className="text-2xl font-bold text-green-400">
              {homeScore !== null && awayScore !== null ? `${homeScore} - ${awayScore}` : "vs"}
            </div>

            <div className="flex items-center gap-3">
              <span className="font-semibold">{awayTeam.name}</span>
              <img
                src={awayTeam.logo || "/placeholder.svg"}
                alt={awayTeam.name}
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(matchDate)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{formatTime(matchDate)}</span>
            </div>
            {venue?.name && (
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{venue.name}</span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Content */}
        <div className="py-4">
          {modalType === "view" && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block">¿Cómo viste el partido?</Label>
                <RadioGroup value={viewType} onValueChange={(value: "stadium" | "tv") => setViewType(value)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="tv" id="tv" />
                    <Label htmlFor="tv">En TV/Streaming</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="stadium" id="stadium" />
                    <Label htmlFor="stadium">En el estadio</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitView} disabled={loading} className="flex-1">
                  {loading ? "Registrando..." : "Registrar Vista"}
                </Button>
                <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {modalType === "opinion" && (
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium mb-3 block">Calificación del partido</Label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`p-1 rounded ${
                        star <= rating ? "text-yellow-400" : "text-gray-600"
                      } hover:text-yellow-400 transition-colors`}
                    >
                      <Star className={`h-6 w-6 ${star <= rating ? "fill-current" : ""}`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-400">({rating}/5)</span>
                </div>
              </div>

              <div>
                <Label htmlFor="comment" className="text-base font-medium mb-3 block">
                  Tu opinión sobre el partido
                </Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe tu opinión sobre el partido..."
                  className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                  maxLength={500}
                />
                <div className="text-xs text-gray-500 mt-1">{comment.length}/500 caracteres</div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitOpinion} disabled={loading || !comment.trim()} className="flex-1">
                  {loading ? "Enviando..." : "Enviar Opinión"}
                </Button>
                <Button onClick={onClose} variant="outline" className="flex-1 bg-transparent">
                  Cancelar
                </Button>
              </div>
            </div>
          )}

          {modalType === "opinions-list" && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
                  <p className="text-gray-400 mt-2">Cargando opiniones...</p>
                </div>
              ) : opinions.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">No hay opiniones para este partido aún</p>
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto space-y-4">
                  {opinions.map((opinion) => (
                    <div key={opinion.id} className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">
                              {opinion.profiles?.username?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                          <span className="font-medium">{opinion.profiles?.username || "Usuario"}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= opinion.rating ? "text-yellow-400 fill-current" : "text-gray-600"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-sm text-gray-400">({opinion.rating}/5)</span>
                        </div>
                      </div>
                      <p className="text-gray-300 text-sm">{opinion.comment}</p>
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(opinion.created_at).toLocaleDateString("es-AR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-4">
                <Button onClick={onClose} variant="outline" className="w-full bg-transparent">
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
