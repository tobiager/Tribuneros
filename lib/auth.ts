"use client"

import { createClient } from "@supabase/supabase-js"
import { useEffect, useState } from "react"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface AuthUser {
  id: string
  email: string
  username?: string
  avatar_url?: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email!,
              username: session.user.user_metadata?.username || session.user.user_metadata?.full_name,
              avatar_url: session.user.user_metadata?.avatar_url,
            }
          : null,
      )
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(
        session?.user
          ? {
              id: session.user.id,
              email: session.user.email!,
              username: session.user.user_metadata?.username || session.user.user_metadata?.full_name,
              avatar_url: session.user.user_metadata?.avatar_url,
            }
          : null,
      )
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  const signUp = async (email: string, password: string, username: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    })
    return { data, error }
  }

  const signInWithOAuth = async (provider: "google" | "twitter") => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return {
    user,
    loading,
    signIn,
    signUp,
    signInWithOAuth,
    signOut,
  }
}
