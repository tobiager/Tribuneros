/**
 * Utilidades para manejo de zona horaria argentina
 */

export const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires"

/**
 * Obtiene la fecha actual en zona horaria argentina
 */
export function getArgentinaDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: ARGENTINA_TIMEZONE }))
}

/**
 * Obtiene la fecha de ayer en zona horaria argentina
 */
export function getArgentinaYesterday(): Date {
  const today = getArgentinaDate()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return yesterday
}

/**
 * Convierte una fecha a string en formato YYYY-MM-DD en zona horaria argentina
 */
export function formatArgentinaDate(date: Date): string {
  const argDate = new Date(date.toLocaleString("en-US", { timeZone: ARGENTINA_TIMEZONE }))
  return argDate.toISOString().split("T")[0]
}

/**
 * Obtiene la fecha de hoy en formato YYYY-MM-DD en zona horaria argentina
 */
export function getTodayArgentinaString(): string {
  return formatArgentinaDate(getArgentinaDate())
}

/**
 * Obtiene la fecha de ayer en formato YYYY-MM-DD en zona horaria argentina
 */
export function getYesterdayArgentinaString(): string {
  return formatArgentinaDate(getArgentinaYesterday())
}

/**
 * Calcula los milisegundos hasta las 00:00 del próximo día en Argentina
 */
export function getMillisecondsUntilMidnightArgentina(): number {
  const now = getArgentinaDate()
  const tomorrow = new Date(now)
  tomorrow.setDate(now.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)

  // Convertir de vuelta a UTC para el cálculo
  const tomorrowUTC = new Date(tomorrow.toLocaleString("en-US", { timeZone: "UTC" }))
  const nowUTC = new Date()

  return tomorrowUTC.getTime() - nowUTC.getTime()
}

/**
 * Verifica si dos fechas son el mismo día en zona horaria argentina
 */
export function isSameDayArgentina(date1: Date, date2: Date): boolean {
  const arg1 = formatArgentinaDate(date1)
  const arg2 = formatArgentinaDate(date2)
  return arg1 === arg2
}

/**
 * Obtiene el label de fecha para mostrar al usuario
 */
export function getDateLabel(date: Date): string {
  const today = getArgentinaDate()
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)

  if (isSameDayArgentina(date, today)) {
    return "Hoy"
  } else if (isSameDayArgentina(date, tomorrow)) {
    return "Mañana"
  } else if (isSameDayArgentina(date, yesterday)) {
    return "Ayer"
  } else {
    const argDate = new Date(date.toLocaleString("en-US", { timeZone: ARGENTINA_TIMEZONE }))
    return argDate.toLocaleDateString("es-AR", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }
}
