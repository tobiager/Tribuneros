import { TrendingUp } from "lucide-react"

export default function TrendingCard() {
  const trendingMatches = [
    {
      teams: "Argentina vs Brasil",
      logos: "🇦🇷🇧🇷",
      viewers: 2847,
      rating: 9.2,
    },
    {
      teams: "Real Madrid vs Barcelona",
      logos: "⚪🔵🔴",
      viewers: 1934,
      rating: 8.8,
    },
    {
      teams: "River vs Boca",
      logos: "🔴⚪🔵🟡",
      viewers: 1567,
      rating: 9.1,
    },
  ]

  return (
    <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
      <div className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <h3 className="font-bold text-lg text-white">Trending</h3>
        </div>
      </div>

      <div className="divide-y divide-gray-800">
        {trendingMatches.map((match, index) => (
          <div key={index} className="p-4 hover:bg-gray-800/50 cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{match.logos}</span>
                <div>
                  <p className="font-medium text-white text-sm">{match.teams}</p>
                  <p className="text-xs text-gray-500">{match.viewers.toLocaleString()} lo vieron</p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-500">{match.rating}</div>
                <div className="text-xs text-gray-500">/10</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-gray-800">
        <button className="text-green-500 text-sm hover:underline">Ver más trending</button>
      </div>
    </div>
  )
}
