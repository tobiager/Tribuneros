"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import NavbarEnhanced from "@/components/navbar-enhanced"
import MatchDetailView from "@/components/match-detail-view"
import { FootballAPI, type MatchDetails } from "@/lib/football-api"
import Link from "next/link"

interface UserOpinion {
  id: string
  username: string
  avatar?: string
  rating: number
  comment: string
  date: string
  likes: number
}

export default function MatchDetailPage() {
  const params = useParams()
  const matchId = params.id as string
  const [match, setMatch] = useState<MatchDetails | null>(null)
  const [userOpinions, setUserOpinions] = useState<UserOpinion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMatch = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get match details from API
        const matchData = await FootballAPI.getMatchById(Number.parseInt(matchId))

        if (matchData) {
          setMatch(matchData)
          // Load mock opinions based on match ID
          loadMockOpinions(Number.parseInt(matchId))
        } else {
          setError("Partido no encontrado")
        }
      } catch (err) {
        console.error("Error loading match:", err)
        setError("Error al cargar el partido")
      } finally {
        setLoading(false)
      }
    }

    if (matchId) {
      loadMatch()
    }
  }, [matchId])

  const loadMockOpinions = (matchId: number) => {
    // Mock opinions based on match ID
    const mockOpinions: UserOpinion[] =
      matchId === 1
        ? [
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
              username: "@mundial_fan",
              avatar: "/placeholder-user.jpg",
              rating: 5,
              comment: "La mejor final de un Mundial que he visto. Messi se lo merecía después de tantos años.",
              date: "2022-12-18",
              likes: 31,
            },
          ]
        : matchId === 2
          ? [
              {
                id: "4",
                username: "@boca_passion",
                avatar: "/placeholder-user.jpg",
                rating: 5,
                comment: "¡DALE BOCA! Qué lindo ganarle a River en la Bombonera. El gol de Benedetto fue espectacular.",
                date: "2023-10-15",
                likes: 32,
              },
              {
                id: "5",
                username: "@river_fan",
                avatar: "/placeholder-user.jpg",
                rating: 2,
                comment: "No jugamos bien, Boca mereció ganar. Hay que mejorar para el próximo clásico.",
                date: "2023-10-15",
                likes: 8,
              },
            ]
          : [
              {
                id: "6",
                username: "@futbol_lover",
                avatar: "/placeholder-user.jpg",
                rating: 4,
                comment: "Buen partido, ambos equipos jugaron bien. Me gustó la intensidad del encuentro.",
                date: new Date().toISOString().split("T")[0],
                likes: 12,
              },
              {
                id: "7",
                username: "@deportes_hoy",
                avatar: "/placeholder-user.jpg",
                rating: 3,
                comment: "Partido entretenido pero esperaba más goles. La defensa estuvo sólida.",
                date: new Date().toISOString().split("T")[0],
                likes: 7,
              },
            ]

    setUserOpinions(mockOpinions)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavbarEnhanced />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
            <p className="text-gray-400 text-lg">Cargando detalles del partido...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !match) {
    return (
      <div className="min-h-screen bg-gray-950">
        <NavbarEnhanced />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-6">
            <Link href="/today">
              <Button variant="ghost" className="text-gray-400 hover:text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Partidos de Hoy
              </Button>
            </Link>
          </div>

          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-white mb-4">{error || "Partido no encontrado"}</h1>
            <p className="text-gray-400 mb-6">No se pudo cargar la información del partido solicitado.</p>
            <Link href="/today">
              <Button className="bg-green-500 hover:bg-green-600 text-black font-semibold">
                Ver todos los partidos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Transform match data for the detail view component
  const transformedMatch = {
    id: match.id.toString(),
    homeTeam: {
      name: match.homeTeam.name,
      logo: match.homeTeam.logo,
      score: match.homeScore || 0,
    },
    awayTeam: {
      name: match.awayTeam.name,
      logo: match.awayTeam.logo,
      score: match.awayScore || 0,
    },
    date: match.date,
    time: match.time,
    stadium: match.venue,
    league: match.league.name,
    status: match.status,
  }

  // Calculate average rating
  const averageRating =
    userOpinions.length > 0 ? userOpinions.reduce((sum, opinion) => sum + opinion.rating, 0) / userOpinions.length : 0
  const totalReviews = userOpinions.length

  return (
    <div className="min-h-screen bg-gray-950">
      <NavbarEnhanced />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/today">
            <Button variant="ghost" className="text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver a Partidos de Hoy
            </Button>
          </Link>
        </div>

        <MatchDetailView
          match={transformedMatch}
          averageRating={averageRating}
          totalReviews={totalReviews}
          userOpinions={userOpinions}
        />
      </div>
    </div>
  )
}
