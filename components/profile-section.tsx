import { Settings, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ProfileSection() {
  const userStats = {
    matchesWatched: 127,
    stadiumsVisited: 8,
    followersCount: 2847,
    followingCount: 1234,
    record: { wins: 89, draws: 23, losses: 15 },
  }

  const favoriteTeams = [
    { name: "River Plate", logo: "🔴⚪", matches: 45 },
    { name: "Argentina", logo: "🇦🇷", matches: 23 },
    { name: "Talleres", logo: "⚫⚪", matches: 18 },
  ]

  const venues = [
    { name: "Lusail Stadium", image: "/placeholder.svg?height=120&width=200", matches: 3 },
    { name: "Monumental", image: "/placeholder.svg?height=120&width=200", matches: 12 },
  ]

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Profile Header */}
      <div className="relative">
        <div className="h-24 bg-gradient-to-r from-green-600 to-green-800"></div>
        <div className="absolute -bottom-8 left-6">
          <Avatar className="h-16 w-16 border-4 border-gray-900">
            <AvatarImage src="/placeholder.svg?height=64&width=64" />
            <AvatarFallback className="bg-green-600 text-xl font-bold">T</AvatarFallback>
          </Avatar>
        </div>
        <div className="absolute top-4 right-4">
          <Button variant="ghost" size="sm" className="text-white/80 hover:text-white">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="pt-12 p-6">
        {/* User Info */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-xl font-bold">Tobias</h2>
              <p className="text-gray-400">@tobiager</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="border-green-500 text-green-500 hover:bg-green-500 hover:text-black bg-transparent"
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>

          {/* Favorite Teams */}
          <div className="flex items-center gap-3 mb-4">
            {favoriteTeams.map((team, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="text-2xl">{team.logo}</span>
                <span className="text-sm text-gray-400">{team.name}</span>
              </div>
            ))}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{userStats.followersCount}</div>
              <div className="text-xs text-gray-400">Seguidores</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{userStats.followingCount}</div>
              <div className="text-xs text-gray-400">Siguiendo</div>
            </div>
            <div className="text-center lg:hidden">
              <div className="text-2xl font-bold text-green-500">{userStats.matchesWatched}</div>
              <div className="text-xs text-gray-400">Partidos</div>
            </div>
            <div className="text-center lg:hidden">
              <div className="text-2xl font-bold text-green-500">{userStats.stadiumsVisited}</div>
              <div className="text-xs text-gray-400">Estadios</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="highlights" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="highlights" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
              Highlights
            </TabsTrigger>
            <TabsTrigger value="momentos" className="data-[state=active]:bg-green-500 data-[state=active]:text-black">
              Momentos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="highlights" className="space-y-4">
            {/* Sports Filter */}
            <div className="flex items-center gap-2 p-2 bg-gray-800 rounded-lg">
              <Button
                variant="ghost"
                size="sm"
                className="bg-green-500 text-black hover:bg-green-600 rounded-full px-3"
              >
                All
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500 rounded-full">
                ⚽
              </Button>
            </div>

            {/* Games Stats */}
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="text-4xl font-bold">{userStats.matchesWatched}</div>
                  <div className="text-sm text-gray-400">Games</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">Teams ({favoriteTeams.length})</div>
                  <div className="flex items-center gap-2 mt-2">
                    {favoriteTeams.slice(0, 2).map((team, index) => (
                      <div key={index} className="text-center">
                        <div className="text-2xl mb-1">{team.logo}</div>
                        <div className="text-xs text-gray-400">{team.matches}x</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Your Record</span>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-green-500">
                      {userStats.record.wins}-{userStats.record.draws}-{userStats.record.losses}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Venues */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Venues ({venues.length})</h3>
              <div className="space-y-3">
                {venues.map((venue, index) => (
                  <div key={index} className="relative rounded-lg overflow-hidden">
                    <img
                      src={venue.image || "/placeholder.svg"}
                      alt={venue.name}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-end">
                      <div className="p-3">
                        <div className="font-semibold text-white">{venue.name}</div>
                        <div className="text-xs text-gray-300">{venue.matches} partidos</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="momentos" className="space-y-4">
            <div className="text-center py-8 text-gray-400">
              <p>Tus momentos más especiales aparecerán aquí</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
