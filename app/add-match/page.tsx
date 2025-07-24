"use client"

import { useState } from "react"
import { ArrowLeft, Plus, Star, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Navigation from "@/components/navigation"
import DesktopSidebar from "@/components/desktop-sidebar"
import MatchSearchModal from "@/components/match-search-modal"
import type { Match } from "@/lib/football-api"
import Link from "next/link"

export default function AddMatchPage() {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [searchModalOpen, setSearchModalOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [review, setReview] = useState("")
  const [context, setContext] = useState("")
  const [emotion, setEmotion] = useState("")

  const emotions = [
    { label: "Épico", emoji: "🔥" },
    { label: "Me rompió", emoji: "💔" },
    { label: "Aburrido", emoji: "😴" },
    { label: "Emocionante", emoji: "⚡" },
    { label: "Histórico", emoji: "👑" },
    { label: "Decepcionante", emoji: "😞" },
  ]

  const handleSubmit = () => {
    if (!selectedMatch || !rating) return

    // Here you would save the match review
    console.log({
      match: selectedMatch,
      rating,
      review,
      context,
      emotion,
    })

    // Reset form
    setSelectedMatch(null)
    setRating(0)
    setReview("")
    setContext("")
    setEmotion("")

    // Show success message or redirect
    alert("¡Partido agregado exitosamente!")
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Desktop Layout */}
      <div className="hidden lg:flex">
        <DesktopSidebar />

        <div className="flex-1 max-w-2xl border-x border-gray-800">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-gray-950/80 backdrop-blur-md border-b border-gray-800">
            <div className="px-6 py-4">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <h1 className="text-xl font-bold text-white">Agregar partido</h1>
              </div>
            </div>
          </div>

          <AddMatchContent
            selectedMatch={selectedMatch}
            setSearchModalOpen={setSearchModalOpen}
            rating={rating}
            setRating={setRating}
            review={review}
            setReview={setReview}
            context={context}
            setContext={setContext}
            emotion={emotion}
            setEmotion={setEmotion}
            emotions={emotions}
            handleSubmit={handleSubmit}
          />
        </div>

        <div className="w-80"></div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden">
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-gray-950/90 backdrop-blur-md border-b border-gray-800">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white p-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="font-bold text-white">Agregar partido</h1>
          </div>
        </div>

        <div className="pb-20">
          <AddMatchContent
            selectedMatch={selectedMatch}
            setSearchModalOpen={setSearchModalOpen}
            rating={rating}
            setRating={setRating}
            review={review}
            setReview={setReview}
            context={context}
            setContext={setContext}
            emotion={emotion}
            setEmotion={setEmotion}
            emotions={emotions}
            handleSubmit={handleSubmit}
          />
        </div>

        <Navigation />
      </div>

      {/* Match Search Modal */}
      <MatchSearchModal open={searchModalOpen} onOpenChange={setSearchModalOpen} onSelectMatch={setSelectedMatch} />
    </div>
  )
}

function AddMatchContent({
  selectedMatch,
  setSearchModalOpen,
  rating,
  setRating,
  review,
  setReview,
  context,
  setContext,
  emotion,
  setEmotion,
  emotions,
  handleSubmit,
}: any) {
  return (
    <div className="p-4 lg:p-6 space-y-6">
      {/* Select Match */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Seleccionar partido</h2>

        {selectedMatch ? (
          <div className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm text-green-400">{selectedMatch.league.name}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchModalOpen(true)}
                className="text-gray-400 hover:text-green-500"
              >
                Cambiar
              </Button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-3xl mb-1">{selectedMatch.homeTeam.logo}</div>
                  <div className="font-medium text-sm text-gray-300">{selectedMatch.homeTeam.name}</div>
                </div>
              </div>

              <div className="text-center px-4">
                {selectedMatch.status === "finished" ? (
                  <div className="text-2xl font-bold text-white">
                    {selectedMatch.homeScore} - {selectedMatch.awayScore}
                  </div>
                ) : (
                  <div className="text-sm text-gray-400">{selectedMatch.time}</div>
                )}
              </div>

              <div className="flex items-center gap-3 justify-end">
                <div className="text-center">
                  <div className="text-3xl mb-1">{selectedMatch.awayTeam.logo}</div>
                  <div className="font-medium text-sm text-gray-300">{selectedMatch.awayTeam.name}</div>
                </div>
              </div>
            </div>

            <div className="text-sm text-gray-500 text-center">
              {new Date(selectedMatch.date).toLocaleDateString("es-AR")} • {selectedMatch.venue}
            </div>
          </div>
        ) : (
          <Button
            onClick={() => setSearchModalOpen(true)}
            className="w-full h-16 bg-gray-900 hover:bg-gray-800 border border-gray-700 border-dashed text-gray-400 hover:text-green-500 hover:border-green-500/50"
          >
            <Plus className="h-6 w-6 mr-2" />
            Buscar partido
          </Button>
        )}
      </div>

      {selectedMatch && (
        <>
          {/* Rating */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Puntuación</h2>
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex items-center justify-center gap-2 mb-4">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button key={star} onClick={() => setRating(star)} className="transition-colors p-1">
                    <Star
                      className={`h-7 w-7 ${
                        star <= rating ? "fill-green-500 text-green-500" : "text-gray-600 hover:text-green-400"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center">
                <span className="text-3xl font-bold text-green-500">{rating}/10</span>
              </div>
            </div>
          </div>

          {/* Context */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">¿Dónde lo viste?</h2>
            <Select value={context} onValueChange={setContext}>
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white">
                <SelectValue placeholder="Selecciona el contexto" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="stadium">🏟️ Estadio</SelectItem>
                <SelectItem value="tv">📺 TV</SelectItem>
                <SelectItem value="stream">💻 Stream</SelectItem>
                <SelectItem value="bar">🍺 Bar/Pub</SelectItem>
                <SelectItem value="home">🏠 Casa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Emotion */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">¿Cómo te hizo sentir?</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {emotions.map((emotionOption) => (
                <Button
                  key={emotionOption.label}
                  variant={emotion === emotionOption.label ? "default" : "outline"}
                  onClick={() => setEmotion(emotion === emotionOption.label ? "" : emotionOption.label)}
                  className={`${
                    emotion === emotionOption.label
                      ? "bg-green-500 text-black hover:bg-green-600"
                      : "border-gray-700 hover:border-green-500 hover:bg-green-500/10 bg-transparent text-white"
                  }`}
                >
                  <span className="mr-2">{emotionOption.emoji}</span>
                  {emotionOption.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Review */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Tu reseña</h2>
            <Textarea
              placeholder="Cuenta tu experiencia, qué sentiste, momentos destacados..."
              value={review}
              onChange={(e) => setReview(e.target.value)}
              className="bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 min-h-[120px] resize-none"
            />
          </div>

          {/* Photo */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">Agregar foto (opcional)</h2>
            <Button
              variant="outline"
              className="w-full border-gray-700 hover:border-green-500 bg-transparent text-gray-400 hover:text-green-500 h-12"
            >
              <Camera className="h-5 w-5 mr-2" />
              Subir foto del momento
            </Button>
          </div>

          {/* Submit */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleSubmit}
              disabled={!rating}
              className="w-full bg-green-500 hover:bg-green-600 text-black font-semibold h-12 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Publicar partido
            </Button>
            <Button variant="outline" className="w-full border-gray-700 text-gray-300 bg-transparent hover:bg-gray-800">
              Guardar como borrador
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
