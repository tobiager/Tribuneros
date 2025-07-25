"use client"

import { useState } from "react"
import { Eye, Tv, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

interface Team {
  name: string
  logo: string
  score?: number
}

interface Match {
  id: string
  homeTeam: Team
  awayTeam: Team
  date: string
  time: string
  venue: string
  league: string
  status: string
}

interface MatchViewModalProps {
  isOpen: boolean
  onClose: () => void
  match: Match
  onSubmit?: (data: { context: string; rating?: number }) => void
}

export default function MatchViewModal({ isOpen, onClose, match, onSubmit }: MatchViewModalProps) {
  const [selectedContext, setSelectedContext] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const contexts = [
    {
      id: "tv",
      label: "Por TV",
      icon: Tv,
      description: "Lo vi desde casa o en un bar",
    },
    {
      id: "stadium",
      label: "En el estadio",
      icon: Users,
      description: "Estuve presente en el partido",
    },
  ]

  const handleSubmit = async () => {
    if (!selectedContext) {
      toast.error("Por favor selecciona dónde viste el partido")
      return
    }

    setIsSubmitting(true)

    try {
      // Simular envío
      await new Promise((resolve) => setTimeout(resolve, 1000))

      onSubmit?.({ context: selectedContext })

      // Reset form
      setSelectedContext("")
    } catch (error) {
      toast.error("Error al marcar el partido como visto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedContext("")
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Eye className="h-6 w-6 text-green-500" />
            Marcar como visto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Match Info */}
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                {match.league}
              </Badge>
              <span className="text-xs text-gray-400">{new Date(match.date).toLocaleDateString("es-AR")}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{match.homeTeam.logo}</span>
                <span className="font-medium text-sm">{match.homeTeam.name}</span>
              </div>

              <div className="text-center px-3">
                {match.status === "finished" &&
                match.homeTeam.score !== undefined &&
                match.awayTeam.score !== undefined ? (
                  <span className="text-lg font-bold text-green-400">
                    {match.homeTeam.score} - {match.awayTeam.score}
                  </span>
                ) : (
                  <span className="text-sm text-gray-400">vs</span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{match.awayTeam.name}</span>
                <span className="text-2xl">{match.awayTeam.logo}</span>
              </div>
            </div>
          </div>

          {/* Context Selection */}
          <div className="space-y-3">
            <h3 className="font-semibold text-white">¿Dónde viste el partido?</h3>

            <div className="space-y-3">
              {contexts.map((context) => (
                <button
                  key={context.id}
                  onClick={() => setSelectedContext(context.id)}
                  disabled={isSubmitting}
                  className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                    selectedContext === context.id
                      ? "border-green-500 bg-green-500/10"
                      : "border-gray-700 bg-gray-800 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <context.icon
                      className={`h-6 w-6 ${selectedContext === context.id ? "text-green-500" : "text-gray-400"}`}
                    />
                    <div>
                      <div
                        className={`font-medium ${selectedContext === context.id ? "text-green-400" : "text-white"}`}
                      >
                        {context.label}
                      </div>
                      <div className="text-sm text-gray-400">{context.description}</div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedContext}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black font-semibold"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                  Guardando...
                </div>
              ) : (
                "Marcar como visto"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
