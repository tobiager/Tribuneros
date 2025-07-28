import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { DatabaseService, processMatchesWithTimezone } from "@/lib/database-service"
import { apiFootballService } from "@/lib/api-football-service"
import { formatArgentinaDate, getArgentinaDate } from "@/lib/timezone-utils"
import PartidosClient from "./partidos-client"

async function getInitialData() {
  try {
    console.log("🔄 Cargando datos iniciales para /partidos...")

    const argentinaToday = getArgentinaDate()
    const todayString = formatArgentinaDate(argentinaToday)

    // Obtener partidos de hoy desde la API con filtro de zona horaria
    console.log("📡 Obteniendo partidos de hoy desde API...")
    const apiMatches = await apiFootballService.getMatchesByDate(todayString)
    const { todayMatches, savedYesterdayCount } = await processMatchesWithTimezone(apiMatches)

    // Obtener partidos destacados desde la base de datos
    console.log("🗄️ Obteniendo partidos destacados desde BD...")
    const featuredMatches = await DatabaseService.getFeaturedMatches()

    console.log("✅ Datos iniciales cargados:")
    console.log(`   - Partidos de hoy: ${todayMatches.length}`)
    console.log(`   - Partidos destacados: ${featuredMatches.length}`)
    console.log(`   - Partidos de ayer auto-guardados: ${savedYesterdayCount}`)

    return {
      todayMatches,
      featuredMatches,
    }
  } catch (error) {
    console.error("❌ Error loading initial data:", error)
    return {
      todayMatches: [],
      featuredMatches: [],
    }
  }
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header skeleton */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-48 bg-gray-800 mb-2" />
            <Skeleton className="h-5 w-96 bg-gray-800 mb-2" />
            <Skeleton className="h-4 w-80 bg-gray-800" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-9 w-24 bg-gray-800" />
            <Skeleton className="h-9 w-32 bg-gray-800" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="mb-6">
          <div className="grid w-full grid-cols-2 bg-gray-900 border-gray-800 rounded-lg p-1">
            <Skeleton className="h-10 bg-gray-800" />
            <Skeleton className="h-10 bg-gray-800" />
          </div>
        </div>

        {/* Date navigation skeleton */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <Skeleton className="h-8 w-8 bg-gray-800" />
          <div className="text-center min-w-[300px]">
            <Skeleton className="h-6 w-32 bg-gray-800 mb-2 mx-auto" />
            <Skeleton className="h-4 w-48 bg-gray-800 mx-auto" />
          </div>
          <Skeleton className="h-8 w-8 bg-gray-800" />
        </div>

        {/* Data source indicator skeleton */}
        <div className="mb-4 text-center">
          <Skeleton className="h-6 w-80 bg-gray-800 mx-auto rounded-full" />
        </div>

        {/* Cards skeleton */}
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

export default async function PartidosPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PartidosPageContent />
    </Suspense>
  )
}

async function PartidosPageContent() {
  const { todayMatches, featuredMatches } = await getInitialData()

  return <PartidosClient initialTodayMatches={todayMatches} initialFeaturedMatches={featuredMatches} />
}
