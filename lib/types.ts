export interface FavoriteMonent {
  id: string
  user_id: string
  match_id: number
  title: string
  description?: string
  video_url?: string
  minute: number
  created_at: string
  user: {
    username: string
    avatar_url?: string
  }
}
