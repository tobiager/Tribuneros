"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, Tv, MapPin, Calendar, Clock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth"
import { addMatchView, addMatchOpinion, getMatchOpinions } from "@/lib/database-actions"
import type { ApiFootballMatch, MatchOpinion } from "@/lib/types"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"

interface MatchModalProps {
  isOpen: boolean
  onClose: () => void
  match: ApiFootballMatch
  modalType: "view" | "opinion" | "opinions-list" | null
}

export default function MatchModal({ isOpen, onClose, match, modalType }: MatchModalProps) {
  const { user } = useAuth()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [viewingType, setViewingType] = useState<"tv" | "stadium">("tv")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [opinions, setOpinions] = useState<MatchOpinion[]>([])
  const [loadingOpinions, setLoadingOpinions] = useState(false)

  useEffect(() => {
    if (modalType === "opinions-list" && isOpen) {
      loadOpinions()
    }
  }, [modalType, isOpen, match.fixture.id])

  const loadOpinions = async () => {
    setLoadingOpinions(true)
    try {
      const result = await getMatchOpinions(match.fixture.id)
      if (result.success) {
        setOpinions(result.data as MatchOpinion[])
      } else {
        toast.error(result.error || "Error al cargar opiniones")
      }
    } catch (error) {
      toast.error("Error al cargar opiniones")
    } finally {
      setLoadingOpinions(false)
    }
  }

  const handleSubmitView = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await addMatchView(match.fixture.id, viewingType)
      if (result.success) {
        toast.success(`¡Partido marcado como visto ${viewingType === "tv" ? "por TV" : "en la cancha"}!`)
        onClose()
      } else {
        toast.error(result.error || "Error al guardar")
      }
    } catch (error) {
      toast.error("Error inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSubmitOpinion = async () => {
    if (!user) {
      toast.error("Debes iniciar sesión")
      return
    }

    if (rating === 0) {
      toast.error("Debes seleccionar una calificación")
      return
    }

    setIsSubmitting(true)
    try {
      const result = await addMatchOpinion(match.fixture.id, rating, comment)
      if (result.success) {
        toast.success("¡Opinión guardada!")
        setRating(0)
        setComment("")
        onClose()
      } else {
        toast.error(result.error || "Error al guardar opinión")
      }
    } catch (error) {
      toast.error("Error inesperado")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (
    currentRating: number,
    onStarClick?: (rating: number) => void,
    size: "sm" | "md" | "lg" = "md",
  ) => {
    const sizeClasses = {
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
    }

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} transition-colors ${onStarClick ? "cursor-pointer" : ""} ${
              star <= currentRating ? "fill-yellow-400 text-yellow-400" : "text-gray-400 hover:text-yellow-400"
            }`}
            onClick={() => onStarClick?.(star)}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      NS: "Programado",
      "1H": "1er Tiempo",
      HT: "Entretiempo",
      "2H": "2do Tiempo",
      FT: "Finalizado",
      AET: "Finalizado (Tiempo Extra)",
      PEN: "Finalizado (Penales)",
      LIVE: "En Vivo",
    }
    return statusMap[status] || "En Vivo"
  }

  if (!match) return null

  const getModalTitle = () => {
    switch (modalType) {
      case "view":
        return "Marcar como visto"
      case "opinion":
        return "Dejar opinión"
      case "opinions-list":
        return "Opiniones del partido"
      default:
        return "Detalles del partido"
    }
  }

  const averageRating = opinions.length > 0 ? opinions.reduce((sum, op) => sum + op.rating, 0) / opinions.length : 0

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-green-500">{getModalTitle()}</DialogTitle>
        </DialogHeader>

        {/* Match Info */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <img
                src={match.teams.home.logo || "/placeholder.svg"}
                alt={match.teams.home.name}
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <span className="font-semibold text-sm">{match.teams.home.name}</span>
            </div>
            <div className="text-2xl font-bold text-green-400">
              {match.goals.home !== null ? `${match.goals.home} - ${match.goals.away}` : "vs"}
            </div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{match.teams.away.name}</span>
              <img
                src={match.teams.away.logo || "/placeholder.svg"}
                alt={match.teams.away.name}
                className="h-8 w-8"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(match.fixture.date)}</span>
              <Clock className="h-4 w-4 ml-2" />
              <span>{formatTime(match.fixture.date)}</span>
            </div>
            {match.fixture.venue.name && (
              <div className="flex items-center justify-center gap-1 text-sm text-gray-400">
                <MapPin className="h-4 w-4" />
                <span>{match.fixture.venue.name}</span>
              </div>
            )}
            <div className="text-sm text-green-400 font-medium">{getStatusText(match.fixture.status.short)}</div>
          </div>
        </div>

        {/* Modal Content */}
        {modalType === "view" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">¿Dónde viste el partido?</label>
              <div className="flex gap-2">
                <Button
                  variant={viewingType === "tv" ? "default" : "outline"}
                  onClick={() => setViewingType("tv")}
                  className={`flex-1 ${
                    viewingType === "tv"
                      ? "bg-green-500 text-black hover:bg-green-600"
                      : "border-gray-700 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <Tv className="h-4 w-4 mr-2" />
                  TV
                </Button>
                <Button
                  variant={viewingType === "stadium" ? "default" : "outline"}
                  onClick={() => setViewingType("stadium")}
                  className={`flex-1 ${
                    viewingType === "stadium"
                      ? "bg-green-500 text-black hover:bg-green-600"
                      : "border-gray-700 text-gray-300 hover:bg-gray-800"
                  }`}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Cancha
                </Button>
              </div>
            </div>
            <Button
              onClick={handleSubmitView}
              disabled={isSubmitting}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Marcar como visto"
              )}
            </Button>
          </div>
        )}

        {modalType === "opinion" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Calificación</label>
              <div className="flex justify-center">{renderStars(rating, setRating, "lg")}</div>
              {rating > 0 && <div className="text-center text-sm text-gray-400 mt-1">{rating} de 5 estrellas</div>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Comentario (opcional)</label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué te pareció el partido?"
                className="bg-gray-800 border-gray-700 text-white"
                rows={3}
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">{comment.length}/500 caracteres</div>
            </div>
            <Button
              onClick={handleSubmitOpinion}
              disabled={rating === 0 || isSubmitting}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Enviar opinión"
              )}
            </Button>
          </div>
        )}

        {modalType === "opinions-list" && (
          <div className="space-y-4">
            {opinions.length > 0 && (
              <div className="text-center bg-gray-800 p-4 rounded-lg">
                <div className="text-3xl font-bold text-yellow-400 mb-1">{averageRating.toFixed(1)}</div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(averageRating), undefined, "md")}
                </div>
                <div className="text-sm text-gray-400">
                  Basado en {opinions.length} opinión{opinions.length !== 1 ? "es" : ""}
                </div>
              </div>
            )}

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {loadingOpinions ? (
                <div className="flex justify-center p-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : opinions.length === 0 ? (
                <p className="text-center text-gray-400 p-8">No hay opiniones para este partido.</p>
              ) : (
                opinions.map((opinion) => (
                  <div key={opinion.id} className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={opinion.profiles?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {opinion.profiles?.username?.slice(0, 2).toUpperCase() || "??"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-semibold text-sm">{opinion.profiles?.username || "Usuario"}</span>
                      </div>
                      <div className="flex">{renderStars(opinion.rating, undefined, "sm")}</div>
                    </div>
                    {opinion.comment && <p className="text-sm text-gray-300">{opinion.comment}</p>}
                    <div className="text-xs text-gray-500 mt-1">
                      {new Date(opinion.created_at).toLocaleDateString("es-AR")}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
