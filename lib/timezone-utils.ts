import { ARGENTINA_TIMEZONE } from "./constants"

/**
 * Obtiene la fecha actual en zona horaria argentina
 */
export function getArgentinaDate(): Date {
  const now = new Date()
  const argentinaTime = new Date(
    now.toLocaleString("en-US", {
      timeZone: ARGENTINA_TIMEZONE,
    }),
  )
  return argentinaTime
}

/**
 * Formatea una fecha para mostrar en Argentina (YYYY-MM-DD)
 */
export function formatArgentinaDate(date: Date): string {
  return date.toLocaleDateString("en-CA", {
    timeZone: ARGENTINA_TIMEZONE,
  })
}

/**
 * Formatea una fecha para mostrar (DD/MM/YYYY)
 */
export function formatDateDisplay(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("es-AR", {
    timeZone: ARGENTINA_TIMEZONE,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

/**
 * Formatea una hora para mostrar (HH:mm)
 */
export function formatTimeDisplay(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleTimeString("es-AR", {
    timeZone: ARGENTINA_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

/**
 * Obtiene el label de una fecha (Hoy, Ayer, etc.)
 */
export function getDateLabel(date: Date): string {
  const today = getArgentinaDate()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  const tomorrow = new Date(today)
  tomorrow.setDate(today.getDate() + 1)

  if (isSameDayArgentina(date, today)) {
    return "Hoy"
  } else if (isSameDayArgentina(date, yesterday)) {
    return "Ayer"
  } else if (isSameDayArgentina(date, tomorrow)) {
    return "Mañana"
  } else {
    return date.toLocaleDateString("es-AR", {
      timeZone: ARGENTINA_TIMEZONE,
      weekday: "long",
      day: "numeric",
      month: "long",
    })
  }
}

/**
 * Verifica si dos fechas son del mismo día en Argentina
 */
export function isSameDayArgentina(date1: Date, date2: Date): boolean {
  return formatArgentinaDate(date1) === formatArgentinaDate(date2)
}

/**
 * Verifica si una fecha es de hoy en Argentina
 */
export function isMatchInArgentinaToday(matchDateString: string): boolean {
  const matchDate = new Date(matchDateString)
  const today = getArgentinaDate()
  return isSameDayArgentina(matchDate, today)
}

/**
 * Verifica si una fecha es de ayer en Argentina
 */
export function isMatchArgentinaYesterday(matchDateString: string): boolean {
  const matchDate = new Date(matchDateString)
  const today = getArgentinaDate()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return isSameDayArgentina(matchDate, yesterday)
}

/**
 * Obtiene la fecha de ayer en formato string (YYYY-MM-DD)
 */
export function getYesterdayArgentinaString(): string {
  const today = getArgentinaDate()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  return formatArgentinaDate(yesterday)
}

/**
 * Verifica si una fecha es pasada
 */
export function isPastDate(date: Date): boolean {
  const today = getArgentinaDate()
  return date < today && !isSameDayArgentina(date, today)
}

/**
 * Verifica si una fecha es futura
 */
export function isFutureDate(date: Date): boolean {
  const today = getArgentinaDate()
  return date > today && !isSameDayArgentina(date, today)
}

/**
 * Convierte una fecha UTC a zona horaria argentina
 */
export function convertToArgentinaTime(utcDateString: string): Date {
  const utcDate = new Date(utcDateString)
  const argentinaTime = new Date(
    utcDate.toLocaleString("en-US", {
      timeZone: ARGENTINA_TIMEZONE,
    }),
  )
  return argentinaTime
}
