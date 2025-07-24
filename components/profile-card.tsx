import { MapPin, Calendar, Edit } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

export default function ProfileCard() {
  const userStats = {
    matches: 127,
    stadiums: 8,
    followers: 2847,
    following: 1234,
    record: { wins: 89, draws: 23, losses: 15 },
  }

  const favoriteTeams = [
    { name: "River", logo: "🔴⚪", count: 45 },
    { name: "Argentina", logo: "🇦🇷", count: 23 },
    { name: "Talleres", logo: "⚫⚪", count: 18 },
  ]

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      {/* Header */}
      <div className="relative">
        <div className="h-20 bg-gradient-to-r from-green-600/20 to-green-800/20"></div>
        <div className="absolute -bottom-8 left-4">
          <Avatar className="h-16 w-16 border-4 border-gray-900">
            <AvatarImage src="/placeholder.svg?height=64&width=64" />
            <AvatarFallback className="bg-green-600 text-black font-bold text-xl">T</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="pt-12 p-4">
        {/* User Info */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-bold text-lg text-white">Tobias Ager</h3>
              <p className="text-gray-500">@tobiager</p>
            </div>
            <Button
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          </div>

          <p className="text-gray-300 text-sm mb-3 leading-relaxed">
            Hincha de River desde la cuna 🔴⚪ | Viví el Mundial en Qatar 🏆 | El fútbol es pasión
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>Buenos Aires</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>Se unió en 2022</span>
            </div>
          </div>

          {/* Favorite Teams */}
          <div className="flex items-center gap-3 mb-4">
            {favoriteTeams.map((team, index) => (
              <div key={index} className="flex items-center gap-1">
                <span className="text-2xl">{team.logo}</span>
                <span className="text-xs text-gray-500">{team.count}</span>
              </div>
            ))}
          </div>

          {/* Follow Stats */}
          <div className="flex items-center gap-4 text-sm mb-4">
            <div>
              <span className="font-semibold text-white">{userStats.following.toLocaleString()}</span>
              <span className="text-gray-500 ml-1">Siguiendo</span>
            </div>
            <div>
              <span className="font-semibold text-white">{userStats.followers.toLocaleString()}</span>
              <span className="text-gray-500 ml-1">Seguidores</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="border-t border-gray-800 pt-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{userStats.matches}</div>
              <div className="text-xs text-gray-500">Partidos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-500">{userStats.stadiums}</div>
              <div className="text-xs text-gray-500">Estadios</div>
            </div>
          </div>

          {/* Record */}
          <div className="bg-gray-800 rounded-lg p-3">
            <div className="text-xs text-gray-500 mb-2 uppercase tracking-wide">Record Personal</div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="text-lg font-bold text-green-500">{userStats.record.wins}</div>
                <div className="text-xs text-gray-500">W</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-400">{userStats.record.draws}</div>
                <div className="text-xs text-gray-500">D</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-400">{userStats.record.losses}</div>
                <div className="text-xs text-gray-500">L</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
