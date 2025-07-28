// Timezone constants
export const ARGENTINA_TIMEZONE = "America/Argentina/Buenos_Aires"

// API Football constants
export const API_FOOTBALL_BASE_URL = "https://v3.football.api-sports.io"
export const API_FOOTBALL_HEADERS = {
  "X-RapidAPI-Key": process.env.NEXT_PUBLIC_API_FOOTBALL_KEY || "",
  "X-RapidAPI-Host": "v3.football.api-sports.io",
}

// Database constants
export const SUPABASE_TABLES = {
  MATCHES: "matches",
  TEAMS: "teams",
  LEAGUES: "leagues",
  MATCH_VIEWS: "match_views",
  MATCH_OPINIONS: "match_opinions",
  MATCH_FAVORITES: "match_favorites",
  MATCH_REMINDERS: "match_reminders",
  PROFILES: "profiles",
} as const

// Match status constants
export const MATCH_STATUS = {
  NOT_STARTED: "NS",
  FIRST_HALF: "1H",
  HALFTIME: "HT",
  SECOND_HALF: "2H",
  FINISHED: "FT",
  FINISHED_EXTRA_TIME: "AET",
  FINISHED_PENALTIES: "PEN",
  LIVE: "LIVE",
  CANCELLED: "CANC",
  POSTPONED: "PST",
} as const

// Date format constants
export const DATE_FORMATS = {
  API_DATE: "YYYY-MM-DD",
  DISPLAY_DATE: "DD/MM/YYYY",
  DISPLAY_TIME: "HH:mm",
  FULL_DATETIME: "DD/MM/YYYY HH:mm",
  FULL_DATE: "dddd, D [de] MMMM [de] YYYY",
} as const

// Admin user IDs (you can add more as needed)
export const ADMIN_USER_IDS = [
  // Add admin user IDs here
] as const

// Default pagination
export const DEFAULT_PAGINATION = {
  PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const
