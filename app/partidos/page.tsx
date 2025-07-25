import { Suspense } from "react"
import { apiFootballService } from "@/lib/api-football-service"
import PartidosClient from "./partidos-client"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"

async function PartidosData() {
  try {
    const [todayMatches, featuredMatches] = await Promise.all([
      apiFootballService.getTodayMatches(),
      apiFootballService.getFeaturedMatches(),
    ])

    return <PartidosClient todayMatches={todayMatches} featuredMatches={featuredMatches} />
  } catch (error) {
    console.error("Error loading matches:", error)
    return (
      <div className="min-h-screen bg-gray-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <p className="text-red-400">Error al cargar los partidos. Intenta nuevamente.</p>
          </div>
        </div>
      </div>
    )
  }
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2 bg-gray-800" />
          <Skeleton className="h-5 w-96 bg-gray-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className="h-4 w-32 bg-gray-800" />
                  <Skeleton className="h-6 w-20 bg-gray-800" />
                </div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded bg-gray-800" />
                    <Skeleton className="h-4 w-24 bg-gray-800" />
                  </div>
                  <Skeleton className="h-8 w-16 bg-gray-800" />
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-4 w-24 bg-gray-800" />
                    <Skeleton className="h-8 w-8 rounded bg-gray-800" />
                  </div>
                </div>
                <div className="flex justify-center gap-4 mb-4">
                  <Skeleton className="h-4 w-20 bg-gray-800" />
                  <Skeleton className="h-4 w-16 bg-gray-800" />
                  <Skeleton className="h-4 w-24 bg-gray-800" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="h-8 bg-gray-800" />
                  <Skeleton className="h-8 bg-gray-800" />
                  <Skeleton className="h-8 bg-gray-800" />
                  <Skeleton className="h-8 bg-gray-800" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PartidosPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PartidosData />
    </Suspense>
  )
}
