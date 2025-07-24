"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import MatchCard from "./match-card"
import type { ApiMatch } from "@/lib/api-football"

interface AddMatchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  match: ApiMatch | null
  userId: string
  onMatchAdded: () => void
}

export default function AddMatchModal({ open, onOpenChange, match, userId, onMatchAdded }: AddMatchModalProps) {
  const [rating, setRating] = useState(0)
  const [comentario, setComentario] = useState("")
  const [contexto, setContexto] = useState<"TV" | "Estadio" | "Stream" | "Bar">("TV")
  const [emocion, setEmocion] = useState("")
  const [loading, setLoading] = useState(false)

  const emotions = [
    { label: "Épico", emoji: "🔥" },
    { label: "Me rompió", emoji: "💔" },
    { label: "Aburrido", emoji: "😴" },
    { label: "Emocionante", emoji: "⚡" },
    { label: "Histórico", emoji: "👑" },
    { label: "Decepcionante", emoji: "😞" },
  ]

  const handleSubmit = async () => {
    if (!match || !rating) return

    setLoading(true)
    try {
      const response = await fetch("/api/matches/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          api_match_id: match.fixture.id,
          comentario,
          puntaje: rating,
          contexto,
          emocion,
        }),
      })

      if (response.ok) {
        // Reset form
        setRating(0)
        setComentario("")
        setContexto("TV")
        setEmocion("")
        onOpenChange(false)
        onMatchAdded()
      } else {
        throw new Error("Error adding match")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al agregar el partido")
    } finally {
      setLoading(false)
    }
  }

  if (!match) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-950 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-green-500">Agregar partido visto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Preview */}
          <MatchCard match={match} />

          {/* Rating */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Puntuación</h3>
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="transition-colors p-1">
                    <Star
                      className={`h-6 w-6 ${
                        star <= rating ? "fill-green-500 text-green-500" : "text-gray-600 hover:text-green-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center">
                <span className="text-2xl font-bold text-green-500">{rating}/10</span>
              </div>
            </div>
          </div>

          {/* Context */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">¿Dónde lo viste?</h3>
            <Select value={contexto} onValueChange={(value: any) => setContexto(value)}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="TV">📺 TV</SelectItem>
                <SelectItem value="Estadio">🏟️ Estadio</SelectItem>
                <SelectItem value="Stream">💻 Stream</SelectItem>
                <SelectItem value="Bar">🍺 Bar/Pub</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Emotion */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">¿Cómo te hizo sentir?</h3>
            <div className="grid grid-cols-2 gap-3">
              {emotions.map((emotion) => (
                <Button
                  key={emotion.label}
                  variant={emocion === emotion.label ? "default" : "outline"}
                  onClick={() => setEmocion(emocion === emotion.label ? "" : emotion.label)}
                  className={`${
                    emocion === emotion.label
                      ? "bg-green-500 text-black hover:bg-green-600"
                      : "border-gray-700 hover:border-green-500 hover:bg-green-500/10 bg-transparent text-white"
                  }`}
                >
                  <span className="mr-2">{emotion.emoji}</span>
                  {emotion.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-4">
            <h3 className="font-semibold text-white">Tu comentario</h3>
            <Textarea
              placeholder="Cuenta tu experiencia, qué sentiste, momentos destacados..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 min-h-[100px]"
            />
          </div>

          {/* Submit */}
          <div className="flex gap-3">
            <Button
              onClick={handleSubmit}
              disabled={!rating || loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold disabled:opacity-50"
            >
              {loading ? "Guardando..." : "Agregar partido"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-700 text-gray-300 bg-transparent hover:bg-gray-800"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
