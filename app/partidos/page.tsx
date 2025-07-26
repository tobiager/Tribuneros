import { Suspense } from "react"
import { apiFootballService } from "@/lib/api-football-service"
import { DatabaseService } from "@/lib/database-service"
import { getTodayArgentinaString } from "@/lib/timezone-utils"
import PartidosClient from "./partidos-client"
import { Skeleton } from "@/components/ui/skeleton"

async function getInitialData() {
  try {
    const todayArgentina = getTodayArgentinaString()

    console.log(`🏠 Cargando datos iniciales para: ${todayArgentina}`)

    const [apiMatches, dbMatches, featuredMatches] = await Promise.all([
      apiFootballService.getMatchesByDate(todayArgentina),
      DatabaseService.getMatchesByDate(todayArgentina),
      DatabaseService.getFeaturedStoredMatches(),
    ])

    console.log(
      `✅ Datos iniciales cargados: ${apiMatches.length} API + ${dbMatches.length} DB + ${featuredMatches.length} destacados`,
    )

    return {
      initialTodayMatches: apiMatches,
      initialStoredTodayMatches: dbMatches,
      initialFeaturedMatches: featuredMatches,
    }
  } catch (error) {
    console.error("❌ Error cargando datos iniciales:", error)
    return {
      initialTodayMatches: [],
      initialStoredTodayMatches: [],
      initialFeaturedMatches: [],
    }
  }
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <Skeleton className="h-10 w-48 mb-2 bg-gray-800" />
          <Skeleton className="h-4 w-96 bg-gray-800" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
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
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1 bg-gray-800" />
                  <Skeleton className="h-8 flex-1 bg-gray-800" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-8 flex-1 bg-gray-800" />
                  <Skeleton className="h-8 flex-1 bg-gray-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function PartidosPage() {
  const initialData = await getInitialData()

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PartidosClient {...initialData} />
    </Suspense>
  )
}
