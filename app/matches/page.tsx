import { Suspense } from "react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import MatchClientPage from "./client-page"
import { getApiFootballMatches, syncMatchesToDatabase } from "@/lib/api-football-service"
import { getUserInteractions } from "@/lib/database-service"
import type { ApiFootballMatch, MatchOpinion, MatchView } from "@/lib/types"

interface UserInteractions {
  views: Map<number, MatchView>
  opinions: Map<number, MatchOpinion>
  favorites: Set<number>
  reminders: Set<number>
}

async function getMatchesData(): Promise<{
  todayMatches: ApiFootballMatch[]
  featuredMatches: ApiFootballMatch[]
  userInteractions: UserInteractions
  isLoggedIn: boolean
}> {
  const supabase = createServerComponentClient({ cookies })

  try {
    // Get user session
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const isLoggedIn = !!session?.user

    // Get today's matches from API
    const todayMatches = await getApiFootballMatches("today")

    // Get featured matches (Premier League, La Liga, Champions League)
    const featuredMatches = await getApiFootballMatches("featured")

    // Sync matches to database
    const allMatches = [...todayMatches, ...featuredMatches]
    if (allMatches.length > 0) {
      await syncMatchesToDatabase(allMatches)
    }

    // Get user interactions if logged in
    let userInteractions: UserInteractions = {
      views: new Map(),
      opinions: new Map(),
      favorites: new Set(),
      reminders: new Set(),
    }

    if (isLoggedIn && session.user) {
      const matchIds = allMatches.map((match) => match.fixture.id)
      userInteractions = await getUserInteractions(session.user.id, matchIds)
    }

    return {
      todayMatches,
      featuredMatches,
      userInteractions,
      isLoggedIn,
    }
  } catch (error) {
    console.error("Error loading matches:", error)
    return {
      todayMatches: [],
      featuredMatches: [],
      userInteractions: {
        views: new Map(),
        opinions: new Map(),
        favorites: new Set(),
        reminders: new Set(),
      },
      isLoggedIn: false,
    }
  }
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="h-12 bg-gray-800 rounded-lg w-64 mx-auto mb-4 animate-pulse" />
          <div className="h-6 bg-gray-800 rounded-lg w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function MatchesPage() {
  const data = await getMatchesData()

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MatchClientPage {...data} />
    </Suspense>
  )
}
