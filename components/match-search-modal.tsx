"use client"

import { useState, useEffect } from "react"
import { Search, X, Calendar, MapPin, Trophy } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FootballAPI, type Match } from "@/lib/football-api"

interface MatchSearchModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectMatch: (match: Match) => void
}

export default function MatchSearchModal({ open, onOpenChange, onSelectMatch }: MatchSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<Match[]>([])
  const [recentMatches, setRecentMatches] = useState<Match[]>([])
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      loadInitialData()
    }
  }, [open])

  useEffect(() => {
    if (searchQuery.trim()) {
      searchMatches()
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

  const loadInitialData = async () => {
    setLoading(true)
    try {
      const [recent, upcoming] = await Promise.all([
        FootballAPI.getRecentMatches(20),
        FootballAPI.getUpcomingMatches(10),
      ])
      setRecentMatches(recent)
      setUpcomingMatches(upcoming)
    } catch (error) {
      console.error("Error loading matches:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchMatches = async () => {
    setLoading(true)
    try {
      const results = await FootballAPI.searchMatches(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching matches:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectMatch = (match: Match) => {
    onSelectMatch(match)
    onOpenChange(false)
    setSearchQuery("")
    setSearchResults([])
  }

  const MatchCard = ({ match }: { match: Match }) => (
    <div
      onClick={() => handleSelectMatch(match)}
      className="p-4 border border-gray-800 rounded-xl hover:border-green-500/50 cursor-pointer transition-colors bg-gray-900/50"
    >
      <div className="flex items-center justify-between mb-3">
        <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
          {match.league.name}
        </Badge>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="h-3 w-3" />
          {new Date(match.date).toLocaleDateString("es-AR")}
        </div>
      </div>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3 flex-1">
          <div className="text-center">
            <div className="text-2xl mb-1">{match.homeTeam.logo}</div>
            <div className="font-medium text-sm text-gray-300">{match.homeTeam.name}</div>
          </div>
        </div>

        <div className="text-center px-4">
          {match.status === "finished" ? (
            <div className="text-xl font-bold text-white">
              {match.homeScore} - {match.awayScore}
            </div>
          ) : (
            <div className="text-sm text-gray-400">{match.time}</div>
          )}
        </div>

        <div className="flex items-center gap-3 flex-1 justify-end">
          <div className="text-center">
            <div className="text-2xl mb-1">{match.awayTeam.logo}</div>
            <div className="font-medium text-sm text-gray-300">{match.awayTeam.name}</div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <MapPin className="h-3 w-3" />
          {match.venue}
        </div>
        {match.round && (
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3" />
            {match.round}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-950 border-gray-800 text-white">
        <DialogHeader>
          <DialogTitle className="text-green-500">Buscar partido</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar por equipos, liga, estadio..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-900 border-gray-700 text-white placeholder:text-gray-500 focus:border-green-500"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white p-1"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {searchQuery.trim() ? (
              <div className="space-y-3">
                <h3 className="font-semibold text-white">Resultados de búsqueda</h3>
                {loading ? (
                  <div className="text-center py-8 text-gray-500">Buscando...</div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map((match) => (
                      <MatchCard key={match.id} match={match} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No se encontraron partidos</div>
                )}
              </div>
            ) : (
              <Tabs defaultValue="recent" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                  <TabsTrigger
                    value="recent"
                    className="data-[state=active]:bg-green-500 data-[state=active]:text-black"
                  >
                    Recientes
                  </TabsTrigger>
                  <TabsTrigger
                    value="upcoming"
                    className="data-[state=active]:bg-green-500 data-[state=active]:text-black"
                  >
                    Próximos
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="recent" className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Cargando...</div>
                  ) : (
                    <div className="space-y-3">
                      {recentMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="upcoming" className="space-y-3">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Cargando...</div>
                  ) : (
                    <div className="space-y-3">
                      {upcomingMatches.map((match) => (
                        <MatchCard key={match.id} match={match} />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
