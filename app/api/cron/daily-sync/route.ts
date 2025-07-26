import { type NextRequest, NextResponse } from "next/server"
import { autoSyncService } from "@/lib/auto-sync-service"

/**
 * API Route para sincronización diaria automática
 * Puede ser llamada por un cron job externo (Vercel Cron, GitHub Actions, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // Verificar autorización (opcional - agregar token secreto)
    const authHeader = request.headers.get("authorization")
    const expectedToken = process.env.CRON_SECRET_TOKEN

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("🔄 Iniciando sincronización diaria via API...")

    // Forzar sincronización
    await autoSyncService.forceSyncNow()

    const syncStatus = autoSyncService.getSyncStatus()

    return NextResponse.json({
      success: true,
      message: "Sincronización diaria completada",
      syncStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error en sincronización diaria:", error)

    return NextResponse.json(
      {
        success: false,
        error: "Error en sincronización diaria",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  // Endpoint para verificar el estado de la sincronización
  try {
    const syncStatus = autoSyncService.getSyncStatus()

    return NextResponse.json({
      success: true,
      syncStatus,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Error obteniendo estado de sincronización",
      },
      { status: 500 },
    )
  }
}
