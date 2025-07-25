"use client"

import { useEffect, useState } from "react"
import { FootballAPI, type MatchDetails } from "@/lib/football-api"
import MatchDetailView from "@/components/match-detail-view"

// Mock data para opiniones de usuarios (esto vendría de la base de datos)
const mockUserOpinions = [
  {
    id: "1",
    username: "@tobiager",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    comment:
      "¡Qué partidazo! Messi estuvo increíble, especialmente en el penal. Una final para la historia del fútbol mundial.",
    date: "2022-12-18",
    likes: 24,
  },
  {
    id: "2",
    username: "@futbolero_arg",
    avatar: "/placeholder-user.jpg",
    rating: 4,
    comment: "Partido muy emocionante, aunque sufrí mucho en los penales. Di María jugó espectacular.",
    date: "2022-12-18",
    likes: 18,
  },
  {
    id: "3",
    username: "@campeones22",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    comment: "SOMOS CAMPEONES DEL MUNDO! 🏆🇦🇷 No puedo creer que lo hayamos logrado después de tantos años.",
    date: "2022-12-19",
    likes: 45,
  },
  {
    id: "4",
    username: "@france_fan",
    avatar: "/placeholder-user.jpg",
    rating: 4,
    comment: "Gran partido de ambos equipos. Mbappé hizo todo lo posible, hat-trick en una final del mundo.",
    date: "2022-12-18",
    likes: 12,
  },
  {
    id: "5",
    username: "@neutral_viewer",
    avatar: "/placeholder-user.jpg",
    rating: 5,
    comment: "Probablemente la mejor final de un Mundial que he visto. Dos equipos dando todo hasta el final.",
    date: "2022-12-19",
    likes: 31,
  },
]

export default function MatchDetailExamplePage() {
  const [matchDetails, setMatchDetails] = useState<MatchDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadMatchDetails()
  }, [])

  const loadMatchDetails = async () => {
    try {
      setLoading(true)
      // Cargar el partido de la final del Mundial (ID 1)
      const match = await FootballAPI.getMatchById(1)
      setMatchDetails(match)
    } catch (err) {
      setError("Error al cargar los detalles del partido")
      console.error("Error loading match details:", err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Cargando detalles del partido...</p>
        </div>
      </div>
    )
  }

  if (error || !matchDetails) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error || "Partido no encontrado"}</p>
          <button onClick={loadMatchDetails} className="bg-green-500 hover:bg-green-600 text-black px-4 py-2 rounded">
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  // Transformar los datos de la API al formato esperado por el componente
  const transformedMatch = {
    id: matchDetails.id.toString(),
    homeTeam: {
      name: matchDetails.homeTeam.name,
      logo: matchDetails.homeTeam.logo,
      score: matchDetails.homeScore || 0,
    },
    awayTeam: {
      name: matchDetails.awayTeam.name,
      logo: matchDetails.awayTeam.logo,
      score: matchDetails.awayScore || 0,
    },
    date: matchDetails.date,
    time: matchDetails.time,
    stadium: matchDetails.venue,
    league: matchDetails.league.name,
    status: matchDetails.status,
  }

  // Calcular promedio de rating de las opiniones
  const averageRating = mockUserOpinions.reduce((sum, opinion) => sum + opinion.rating, 0) / mockUserOpinions.length
  const totalReviews = mockUserOpinions.length

  return (
    <MatchDetailView
      match={transformedMatch}
      averageRating={averageRating}
      totalReviews={totalReviews}
      userOpinions={mockUserOpinions}
    />
  )
}
