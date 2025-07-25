export interface User {
  id: string
  email: string
  username?: string
  avatar_url?: string
  created_at: string
}

export interface ApiFootballMatch {
  fixture: {
    id: number
    date: string
    status: {
      short: string
      long: string
    }
    venue: {
      id: number | null
      name: string | null
      city: string | null
    }
  }
  league: {
    id: number
    name: string
    country: string
    logo: string
    season: number
    round: string
  }
  teams: {
    home: {
      id: number
      name: string
      logo: string
    }
    away: {
      id: number
      name: string
      logo: string
    }
  }
  goals: {
    home: number | null
    away: number | null
  }
}

export interface MatchView {
  id: string
  user_id: string
  match_id: number
  viewing_type: "tv" | "stadium"
  viewed_at: string
  created_at: string
}

export interface MatchOpinion {
  id: string
  user_id: string
  match_id: number
  rating: number
  comment: string | null
  created_at: string
  updated_at: string
  profiles?: {
    username: string
    avatar_url?: string
  }
}

export interface MatchFavorite {
  id: string
  user_id: string
  match_id: number
  created_at: string
}

export interface MatchReminder {
  id: string
  user_id: string
  match_id: number
  reminder_time?: string
  is_active: boolean
  created_at: string
}

export interface UserMatchInteractions {
  views: Array<{ match_id: number; viewing_type: string; viewed_at: string }>
  opinions: Array<{ match_id: number; rating: number; comment: string | null }>
  favorites: Array<{ match_id: number }>
  reminders: Array<{ match_id: number; is_active: boolean }>
}
