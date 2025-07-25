"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import MatchCard from "@/components/match-card"
import AuthModal from "@/components/auth-modal"
import type { ApiFootballMatch, MatchOpinion, MatchView } from "@/lib/types"

interface UserInteractions {
  views: Map<number, MatchView>
  opinions: Map<number, MatchOpinion>
  favorites: Set<number>
  reminders: Set<number>
}

interface MatchClientPageProps {
  todayMatches: ApiFootballMatch[]
  featuredMatches: ApiFootballMatch[]
  userInteractions: UserInteractions
  isLoggedIn: boolean
}

export default function MatchClientPage({
  todayMatches,
  featuredMatches,
  userInteractions,
  isLoggedIn,
}: MatchClientPageProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)

  const handleAuthRequired = () => {
    setIsAuthModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Partidos de Fútbol</h1>
          <p className="text-gray-400 text-lg">Descubre, opina y conecta con otros fanáticos del fútbol</p>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800 mb-8">
            <TabsTrigger value="today" className="text-white data-[state=active]:bg-blue-600">
              Hoy ({todayMatches.length})
            </TabsTrigger>
            <TabsTrigger value="featured" className="text-white data-[state=active]:bg-blue-600">
              Destacados ({featuredMatches.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="today">
            {todayMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {todayMatches.map((match) => (
                  <MatchCard
                    key={match.fixture.id}
                    match={match}
                    userInteractions={userInteractions}
                    isLoggedIn={isLoggedIn}
                    onAuthRequired={handleAuthRequired}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No hay partidos programados para hoy</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="featured">
            {featuredMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {featuredMatches.map((match) => (
                  <MatchCard
                    key={match.fixture.id}
                    match={match}
                    userInteractions={userInteractions}
                    isLoggedIn={isLoggedIn}
                    onAuthRequired={handleAuthRequired}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">No hay partidos destacados disponibles</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}
