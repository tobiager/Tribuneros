import { Heart, MessageCircle, Share2, Eye, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FeedCardProps {
  post: {
    id: number
    user: {
      name: string
      username: string
      avatar: string
      team: string
    }
    match: {
      homeTeam: string
      awayTeam: string
      homeScore: number
      awayScore: number
      competition: string
      date: string
      stadium: string
      rating: number
      context: string
      homeLogo: string
      awayLogo: string
    }
    review: string
    likes: number
    comments: number
    timeAgo: string
    watchedBy: number
  }
}

export default function FeedCard({ post }: FeedCardProps) {
  return (
    <div className="bg-gray-900 border-b border-gray-800 lg:border lg:rounded-2xl lg:mb-6 lg:border-gray-800">
      {/* User Header */}
      <div className="p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4">
          <Avatar className="h-10 w-10">
            <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="bg-green-600">{post.user.name[0]}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-semibold">{post.user.name}</span>
              <span className="text-gray-400 text-sm">@{post.user.username}</span>
              <span className="text-gray-500 text-sm">• {post.timeAgo}</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-400">
              <span>❤️ {post.user.team}</span>
            </div>
          </div>
        </div>

        {/* Match Card */}
        <div className="bg-gray-800 rounded-xl p-4 lg:p-6 mb-4">
          {/* Match Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
                {post.match.competition}
              </Badge>
              <span className="text-sm text-gray-400">{post.match.date}</span>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(post.match.rating)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-green-500 text-green-500" />
              ))}
              <span className="ml-2 font-bold text-green-500 text-lg">{post.match.rating}/10</span>
            </div>
          </div>

          {/* Teams and Score */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-4xl mb-2">{post.match.homeLogo}</div>
                <div className="font-semibold text-sm">{post.match.homeTeam}</div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {post.match.homeScore} - {post.match.awayScore}
              </div>
              <div className="text-xs text-gray-400">FINAL</div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center">
                <div className="text-4xl mb-2">{post.match.awayLogo}</div>
                <div className="font-semibold text-sm">{post.match.awayTeam}</div>
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="flex items-center justify-between text-sm text-gray-400">
            <span>🏟️ {post.match.stadium}</span>
            <Badge variant="outline" className="border-green-500/30 text-green-400">
              {post.match.context}
            </Badge>
          </div>
        </div>

        {/* Review */}
        <p className="text-gray-200 mb-4 leading-relaxed">{post.review}</p>

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
          <div className="flex items-center gap-1">
            <Eye className="h-4 w-4" />
            <span>{post.watchedBy.toLocaleString()} lo vieron</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 p-0">
              <Heart className="h-5 w-5 mr-2" />
              {post.likes.toLocaleString()}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500 p-0">
              <MessageCircle className="h-5 w-5 mr-2" />
              {post.comments}
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-500 p-0">
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
          <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black font-semibold">
            Vi este partido
          </Button>
        </div>
      </div>
    </div>
  )
}
