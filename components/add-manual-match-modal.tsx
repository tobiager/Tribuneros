"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Plus } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"
import { DatabaseService } from "@/lib/database-service"

interface AddManualMatchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMatchAdded: () => void
}

const LEAGUES = [
  "Liga Profesional Argentina",
  "Primera Nacional",
  "Copa Argentina",
  "Copa de la Liga",
  "Primera B Metro",
  "Federal A",
  "Primera C",
  "Promocional Amateur",
  "Brasileirão Serie A",
  "La Liga",
  "Serie A",
  "Premier League",
  "Copa América",
  "Mundial",
  "Eurocopa",
  "Nations League",
  "Eliminatorias Conmebol",
]

const MATCH_STATUSES = [
  { value: "NS", label: "Por jugarse" },
  { value: "LIVE", label: "En vivo" },
  { value: "FT", label: "Finalizado" },
  { value: "AET", label: "Finalizado (Tiempo Extra)" },
  { value: "PEN", label: "Finalizado (Penales)" },
  { value: "CANC", label: "Cancelado" },
  { value: "PST", label: "Postergado" },
]

export default function AddManualMatchModal({ open, onOpenChange, onMatchAdded }: AddManualMatchModalProps) {
  const [loading, setLoading] = useState(false)
  const [matchDate, setMatchDate] = useState<Date>()
  const [formData, setFormData] = useState({
    homeTeam: "",
    awayTeam: "",
    homeScore: "",
    awayScore: "",
    league: "",
    venue: "",
    status: "NS",
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setFormData({
      homeTeam: "",
      awayTeam: "",
      homeScore: "",
      awayScore: "",
      league: "",
      venue: "",
      status: "NS",
    })
    setMatchDate(undefined)
  }

  const handleSubmit = async () => {
    if (!formData.homeTeam || !formData.awayTeam || !formData.league || !matchDate) {
      toast.error("Por favor completa los campos obligatorios")
      return
    }

    if (formData.homeTeam === formData.awayTeam) {
      toast.error("Los equipos no pueden ser iguales")
      return
    }

    // Validate scores if status is finished
    if (["FT", "AET", "PEN"].includes(formData.status)) {
      if (!formData.homeScore || !formData.awayScore) {
        toast.error("Los partidos finalizados deben tener resultado")
        return
      }
    }

    setLoading(true)
    try {
      const matchData = {
        homeTeam: formData.homeTeam.trim(),
        awayTeam: formData.awayTeam.trim(),
        homeScore: formData.homeScore ? Number.parseInt(formData.homeScore) : undefined,
        awayScore: formData.awayScore ? Number.parseInt(formData.awayScore) : undefined,
        matchDate: matchDate.toISOString(),
        league: formData.league,
        venue: formData.venue.trim() || undefined,
        status: formData.status,
      }

      const result = await DatabaseService.addManualMatch(matchData)

      if (result.success) {
        toast.success("¡Partido agregado exitosamente!")
        resetForm()
        onOpenChange(false)
        onMatchAdded()
      } else {
        toast.error(result.error || "Error al agregar partido")
      }
    } catch (error) {
      toast.error("Error inesperado")
    } finally {
      setLoading(false)
    }
  }

  const isFinishedMatch = ["FT", "AET", "PEN"].includes(formData.status)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Agregar Partido Manual
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Teams */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="homeTeam">Equipo Local *</Label>
              <Input
                id="homeTeam"
                value={formData.homeTeam}
                onChange={(e) => handleInputChange("homeTeam", e.target.value)}
                placeholder="Ej: River Plate"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="awayTeam">Equipo Visitante *</Label>
              <Input
                id="awayTeam"
                value={formData.awayTeam}
                onChange={(e) => handleInputChange("awayTeam", e.target.value)}
                placeholder="Ej: Boca Juniors"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          {/* League */}
          <div className="space-y-2">
            <Label>Liga/Competición *</Label>
            <Select value={formData.league} onValueChange={(value) => handleInputChange("league", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue placeholder="Selecciona una liga" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {LEAGUES.map((league) => (
                  <SelectItem key={league} value={league} className="text-white hover:bg-gray-700">
                    {league}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label>Fecha del partido *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal bg-gray-800 border-gray-700 text-white hover:bg-gray-700"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {matchDate ? format(matchDate, "PPP", { locale: es }) : "Selecciona una fecha"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-700" align="start">
                <Calendar
                  mode="single"
                  selected={matchDate}
                  onSelect={setMatchDate}
                  initialFocus
                  className="bg-gray-800 text-white"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Estado del partido</Label>
            <Select value={formData.status} onValueChange={(value) => handleInputChange("status", value)}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {MATCH_STATUSES.map((status) => (
                  <SelectItem key={status.value} value={status.value} className="text-white hover:bg-gray-700">
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scores (only if finished) */}
          {isFinishedMatch && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeScore">Goles Local *</Label>
                <Input
                  id="homeScore"
                  type="number"
                  min="0"
                  value={formData.homeScore}
                  onChange={(e) => handleInputChange("homeScore", e.target.value)}
                  placeholder="0"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awayScore">Goles Visitante *</Label>
                <Input
                  id="awayScore"
                  type="number"
                  min="0"
                  value={formData.awayScore}
                  onChange={(e) => handleInputChange("awayScore", e.target.value)}
                  placeholder="0"
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
            </div>
          )}

          {/* Venue */}
          <div className="space-y-2">
            <Label htmlFor="venue">Estadio (opcional)</Label>
            <Input
              id="venue"
              value={formData.venue}
              onChange={(e) => handleInputChange("venue", e.target.value)}
              placeholder="Ej: Estadio Monumental"
              className="bg-gray-800 border-gray-700 text-white"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-500 hover:bg-green-600 text-black"
            >
              {loading ? "Agregando..." : "Agregar Partido"}
            </Button>
            <Button onClick={() => onOpenChange(false)} variant="outline" className="flex-1">
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
