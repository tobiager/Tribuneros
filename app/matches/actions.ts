"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function addMatchView(matchId: number, viewType: "tv" | "stadium") {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { error } = await supabase
    .from("match_views")
    .upsert({ user_id: user.id, match_id: matchId, view_type: viewType }, { onConflict: "user_id,match_id" })

  if (error) return { error: "Error al guardar la vista." }
  revalidatePath("/matches")
  return { success: true }
}

export async function addMatchOpinion(matchId: number, rating: number, content: string) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { error } = await supabase
    .from("match_opinions")
    .upsert({ user_id: user.id, match_id: matchId, rating, content }, { onConflict: "user_id,match_id" })

  if (error) return { error: "Error al guardar la opinión." }
  revalidatePath("/matches")
  return { success: true }
}

export async function toggleFavorite(matchId: number) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { data: existing } = await supabase
    .from("match_favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("match_id", matchId)
    .single()

  if (existing) {
    const { error } = await supabase.from("match_favorites").delete().eq("id", existing.id)
    if (error) return { error: "Error al quitar de favoritos." }
  } else {
    const { error } = await supabase.from("match_favorites").insert({ user_id: user.id, match_id: matchId })
    if (error) return { error: "Error al agregar a favoritos." }
  }

  revalidatePath("/matches")
  return { success: true }
}

export async function toggleReminder(matchId: number) {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado" }

  const { data: existing } = await supabase
    .from("match_reminders")
    .select("id")
    .eq("user_id", user.id)
    .eq("match_id", matchId)
    .single()

  if (existing) {
    const { error } = await supabase.from("match_reminders").delete().eq("id", existing.id)
    if (error) return { error: "Error al quitar el recordatorio." }
  } else {
    const { error } = await supabase.from("match_reminders").insert({ user_id: user.id, match_id: matchId })
    if (error) return { error: "Error al agregar el recordatorio." }
  }

  revalidatePath("/matches")
  return { success: true }
}
