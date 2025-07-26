import { DatabaseService } from "./database-service"
import { apiFootballService } from "./api-football-service"
import { getYesterdayArgentinaString, getTodayArgentinaString } from "./timezone-utils"

/**
 * Servicio para sincronización automática de partidos
 */
export class AutoSyncService {
  private static instance: AutoSyncService
  private syncInterval: NodeJS.Timeout | null = null
  private lastSyncDate: string | null = null

  private constructor() {}

  static getInstance(): AutoSyncService {
    if (!AutoSyncService.instance) {
      AutoSyncService.instance = new AutoSyncService()
    }
    return AutoSyncService.instance
  }

  /**
   * Inicia la sincronización automática
   */
  startAutoSync(): void {
    console.log("🚀 Iniciando sincronización automática de partidos")

    // Ejecutar sincronización inicial
    this.performDailySync()

    // Programar sincronización cada hora para verificar si cambió el día
    this.syncInterval = setInterval(
      () => {
        this.checkAndPerformDailySync()
      },
      60 * 60 * 1000,
    ) // Cada hora
  }

  /**
   * Detiene la sincronización automática
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
      console.log("⏹️ Sincronización automática detenida")
    }
  }

  /**
   * Verifica si es necesario realizar sincronización diaria
   */
  private checkAndPerformDailySync(): void {
    const today = getTodayArgentinaString()

    // Si cambió el día, realizar sincronización
    if (this.lastSyncDate !== today) {
      console.log(`📅 Nuevo día detectado: ${today}. Iniciando sincronización...`)
      this.performDailySync()
    }
  }

  /**
   * Realiza la sincronización diaria completa
   */
  private async performDailySync(): Promise<void> {
    try {
      const today = getTodayArgentinaString()
      const yesterday = getYesterdayArgentinaString()

      console.log(`🔄 Sincronizando partidos - Hoy: ${today}, Ayer: ${yesterday}`)

      // 1. Sincronizar partidos de ayer (finalizados)
      await this.syncYesterdayMatches(yesterday)

      // 2. Actualizar partidos de hoy
      await this.syncTodayMatches(today)

      // 3. Limpiar partidos antiguos (opcional)
      await this.cleanupOldMatches()

      this.lastSyncDate = today
      console.log(`✅ Sincronización completada para ${today}`)

      // Emitir evento para que los componentes se actualicen
      this.notifyComponentsUpdate()
    } catch (error) {
      console.error("❌ Error en sincronización diaria:", error)
    }
  }

  /**
   * Sincroniza partidos de ayer que estén finalizados
   */
  private async syncYesterdayMatches(yesterday: string): Promise<void> {
    try {
      console.log(`📥 Sincronizando partidos finalizados de ${yesterday}`)

      // Obtener partidos de ayer desde la API
      const yesterdayMatches = await apiFootballService.getMatchesByDate(yesterday)

      // Filtrar solo partidos finalizados
      const finishedMatches = yesterdayMatches.filter((match) =>
        ["FT", "AET", "PEN"].includes(match.fixture.status.short),
      )

      console.log(`🏁 Encontrados ${finishedMatches.length} partidos finalizados de ayer`)

      // Sincronizar cada partido
      for (const match of finishedMatches) {
        try {
          await DatabaseService.syncMatch(match)
          console.log(`✅ Partido sincronizado: ${match.teams.home.name} vs ${match.teams.away.name}`)
        } catch (error) {
          console.error(`❌ Error sincronizando partido ${match.fixture.id}:`, error)
        }
      }

      console.log(`📊 Sincronización de ayer completada: ${finishedMatches.length} partidos`)
    } catch (error) {
      console.error("❌ Error sincronizando partidos de ayer:", error)
    }
  }

  /**
   * Sincroniza partidos de hoy para tener datos actualizados
   */
  private async syncTodayMatches(today: string): Promise<void> {
    try {
      console.log(`📥 Actualizando partidos de hoy: ${today}`)

      const todayMatches = await apiFootballService.getMatchesByDate(today)

      // Sincronizar partidos que estén en progreso o finalizados
      const matchesToSync = todayMatches.filter(
        (match) => !["NS", "TBD", "CANC", "PST"].includes(match.fixture.status.short),
      )

      for (const match of matchesToSync) {
        try {
          await DatabaseService.syncMatch(match)
        } catch (error) {
          console.error(`❌ Error actualizando partido ${match.fixture.id}:`, error)
        }
      }

      console.log(`📊 Actualización de hoy completada: ${matchesToSync.length} partidos actualizados`)
    } catch (error) {
      console.error("❌ Error actualizando partidos de hoy:", error)
    }
  }

  /**
   * Limpia partidos muy antiguos de la base de datos (opcional)
   */
  private async cleanupOldMatches(): Promise<void> {
    try {
      // Implementar lógica de limpieza si es necesario
      // Por ejemplo, eliminar partidos de más de 30 días
      console.log("🧹 Limpieza de partidos antiguos (pendiente de implementar)")
    } catch (error) {
      console.error("❌ Error en limpieza de partidos antiguos:", error)
    }
  }

  /**
   * Notifica a los componentes que deben actualizarse
   */
  private notifyComponentsUpdate(): void {
    // Emitir evento personalizado para que los componentes se actualicen
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("partidosAutoUpdate", {
          detail: {
            timestamp: Date.now(),
            date: getTodayArgentinaString(),
          },
        }),
      )
    }
  }

  /**
   * Fuerza una sincronización manual
   */
  async forceSyncNow(): Promise<void> {
    console.log("🔄 Forzando sincronización manual...")
    await this.performDailySync()
  }

  /**
   * Obtiene el estado de la sincronización
   */
  getSyncStatus(): { lastSyncDate: string | null; isRunning: boolean } {
    return {
      lastSyncDate: this.lastSyncDate,
      isRunning: this.syncInterval !== null,
    }
  }
}

// Instancia singleton
export const autoSyncService = AutoSyncService.getInstance()
