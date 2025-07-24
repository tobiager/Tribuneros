import { Heart, MessageCircle, Share, Eye, MoreHorizontal, Star } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface FeedPostProps {
  post: {
    id: number
    user: {
      name: string
      username: string
      avatar: string
      verified: boolean
    }
    match: {
      homeTeam: string
      awayTeam: string
      homeScore: number
      awayScore: number
      homeLogo: string
      awayLogo: string
      competition: string
      stadium: string
      date: string
      rating: number
      context: string
    }
    content: string
    timestamp: string
    stats: {
      likes: number
      comments: number
      watched: number
    }
  }
}

export default function FeedPost({ post }: FeedPostProps) {
  return (
    <article className="border-b border-gray-800 px-4 lg:px-6 py-4 hover:bg-gray-950/50 transition-colors">
      {/* User Header */}
      <div className="flex items-start gap-3">
        <Avatar className="h-12 w-12 flex-shrink-0">
          <AvatarImage src={post.user.avatar || "/placeholder.svg"} />
          <AvatarFallback className="bg-green-600 text-black font-semibold">{post.user.name[0]}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          {/* User Info */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-semibold text-white truncate">{post.user.name}</span>
            {post.user.verified && <span className="text-green-500">✓</span>}
            <span className="text-gray-500 truncate">@{post.user.username}</span>
            <span className="text-gray-500">·</span>
            <span className="text-gray-500 text-sm">{post.timestamp}</span>
            <div className="ml-auto">
              <Button variant="ghost" size="sm" className="text-gray-500 hover:text-white p-1">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Match Card */}
          <div className="bg-gray-900 rounded-2xl p-4 mb-3 border border-gray-800">
            {/* Match Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                  {post.match.competition}
                </Badge>
                <span className="text-xs text-gray-500">{post.match.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="flex items-center">
                  {[...Array(Math.min(post.match.rating, 5))].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-green-500 text-green-500" />
                  ))}
                </div>
                <span className="ml-2 font-bold text-green-500 text-lg">{post.match.rating}/10</span>
              </div>
            </div>

            {/* Teams and Score */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="text-center">
                  <div className="text-3xl mb-1">{post.match.homeLogo}</div>
                  <div className="font-medium text-sm text-gray-300">{post.match.homeTeam}</div>
                </div>
              </div>

              <div className="text-center px-4">
                <div className="text-2xl font-bold text-white mb-1">
                  {post.match.homeScore} - {post.match.awayScore}
                </div>
                <div className="text-xs text-gray-500 uppercase tracking-wide">Final</div>
              </div>

              <div className="flex items-center gap-3 flex-1 justify-end">
                <div className="text-center">
                  <div className="text-3xl mb-1">{post.match.awayLogo}</div>
                  <div className="font-medium text-sm text-gray-300">{post.match.awayTeam}</div>
                </div>
              </div>
            </div>

            {/* Match Info */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">🏟️ {post.match.stadium}</span>
              <Badge variant="outline" className="border-gray-600 text-gray-400 text-xs">
                {post.match.context}
              </Badge>
            </div>
          </div>

          {/* Post Content */}
          <p className="text-white leading-relaxed mb-3">{post.content}</p>

          {/* Stats */}
          <div className="flex items-center gap-1 text-sm text-gray-500 mb-3">
            <Eye className="h-4 w-4" />
            <span>{post.stats.watched.toLocaleString()} lo vieron</span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between max-w-md">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-red-500 hover:bg-red-500/10 p-2 rounded-full"
            >
              <Heart className="h-5 w-5 mr-2" />
              <span className="text-sm">{post.stats.likes.toLocaleString()}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-green-500 hover:bg-green-500/10 p-2 rounded-full"
            >
              <MessageCircle className="h-5 w-5 mr-2" />
              <span className="text-sm">{post.stats.comments}</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-green-500 hover:bg-green-500/10 p-2 rounded-full"
            >
              <Share className="h-5 w-5" />
            </Button>

            <Button size="sm" className="bg-green-500 hover:bg-green-600 text-black font-medium px-4 rounded-full">
              + Vi este partido
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}
