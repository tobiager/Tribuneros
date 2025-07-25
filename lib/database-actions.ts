"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function addMatchView(matchId: number, viewingType: "tv" | "stadium") {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: "No autenticado" }
    }

    const { error } = await supabase.from("match_views").upsert(
      {
        user_id: user.id,
        match_id: matchId,
        viewing_type: viewingType,
        viewed_at: new Date().toISOString(),
      },
      { onConflict: "user_id,match_id" },
    )

    if (error) {
      console.error("Error saving match view:", error)
      return { error: "Error al guardar la vista del partido" }
    }

    revalidatePath("/partidos")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in addMatchView:", error)
    return { error: "Error inesperado" }
  }
}

export async function addMatchOpinion(matchId: number, rating: number, comment: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: "No autenticado" }
    }

    if (rating < 1 || rating > 5) {
      return { error: "La calificación debe estar entre 1 y 5" }
    }

    const { error } = await supabase.from("match_opinions").upsert(
      {
        user_id: user.id,
        match_id: matchId,
        rating,
        comment: comment.trim() || null,
      },
      { onConflict: "user_id,match_id" },
    )

    if (error) {
      console.error("Error saving match opinion:", error)
      return { error: "Error al guardar la opinión" }
    }

    revalidatePath("/partidos")
    return { success: true }
  } catch (error) {
    console.error("Unexpected error in addMatchOpinion:", error)
    return { error: "Error inesperado" }
  }
}

export async function toggleMatchFavorite(matchId: number) {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: "No autenticado" }
    }

    // Verificar si ya existe
    const { data: existing, error: checkError } = await supabase
      .from("match_favorites")
      .select("id")
      .eq("user_id", user.id)
      .eq("match_id", matchId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking favorite:", checkError)
      return { error: "Error al verificar favorito" }
    }

    if (existing) {
      // Remover de favoritos
      const { error } = await supabase.from("match_favorites").delete().eq("id", existing.id)

      if (error) {
        console.error("Error removing favorite:", error)
        return { error: "Error al quitar de favoritos" }
      }

      revalidatePath("/partidos")
      return { success: true, action: "removed" }
    } else {
      // Agregar a favoritos
      const { error } = await supabase.from("match_favorites").insert({
        user_id: user.id,
        match_id: matchId,
      })

      if (error) {
        console.error("Error adding favorite:", error)
        return { error: "Error al agregar a favoritos" }
      }

      revalidatePath("/partidos")
      return { success: true, action: "added" }
    }
  } catch (error) {
    console.error("Unexpected error in toggleMatchFavorite:", error)
    return { error: "Error inesperado" }
  }
}

export async function toggleMatchReminder(matchId: number) {
  try {
    const supabase = createServerActionClient({ cookies })

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()
    if (authError || !user) {
      return { error: "No autenticado" }
    }

    // Verificar si ya existe
    const { data: existing, error: checkError } = await supabase
      .from("match_reminders")
      .select("id, is_active")
      .eq("user_id", user.id)
      .eq("match_id", matchId)
      .single()

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Error checking reminder:", checkError)
      return { error: "Error al verificar recordatorio" }
    }

    if (existing) {
      // Toggle el estado activo
      const { error } = await supabase
        .from("match_reminders")
        .update({ is_active: !existing.is_active })
        .eq("id", existing.id)

      if (error) {
        console.error("Error updating reminder:", error)
        return { error: "Error al actualizar recordatorio" }
      }

      revalidatePath("/partidos")
      return { success: true, action: existing.is_active ? "disabled" : "enabled" }
    } else {
      // Crear nuevo recordatorio
      const { error } = await supabase.from("match_reminders").insert({
        user_id: user.id,
        match_id: matchId,
        is_active: true,
      })

      if (error) {
        console.error("Error creating reminder:", error)
        return { error: "Error al crear recordatorio" }
      }

      revalidatePath("/partidos")
      return { success: true, action: "enabled" }
    }
  } catch (error) {
    console.error("Unexpected error in toggleMatchReminder:", error)
    return { error: "Error inesperado" }
  }
}

export async function getMatchOpinions(matchId: number) {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data, error } = await supabase
      .from("match_opinions")
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles:user_id (
          username,
          avatar_url
        )
      `)
      .eq("match_id", matchId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching match opinions:", error)
      return { error: "Error al cargar opiniones" }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Unexpected error in getMatchOpinions:", error)
    return { error: "Error inesperado" }
  }
}

export async function getUserMatchInteractions(userId: string, matchIds: number[]) {
  try {
    const supabase = createServerActionClient({ cookies })

    if (matchIds.length === 0) {
      return {
        success: true,
        data: {
          views: [],
          opinions: [],
          favorites: [],
          reminders: [],
        },
      }
    }

    const [viewsResult, opinionsResult, favoritesResult, remindersResult] = await Promise.all([
      supabase
        .from("match_views")
        .select("match_id, viewing_type, viewed_at")
        .eq("user_id", userId)
        .in("match_id", matchIds),

      supabase
        .from("match_opinions")
        .select("match_id, rating, comment")
        .eq("user_id", userId)
        .in("match_id", matchIds),

      supabase.from("match_favorites").select("match_id").eq("user_id", userId).in("match_id", matchIds),

      supabase.from("match_reminders").select("match_id, is_active").eq("user_id", userId).in("match_id", matchIds),
    ])

    return {
      success: true,
      data: {
        views: viewsResult.data || [],
        opinions: opinionsResult.data || [],
        favorites: favoritesResult.data || [],
        reminders: remindersResult.data || [],
      },
    }
  } catch (error) {
    console.error("Unexpected error in getUserMatchInteractions:", error)
    return { error: "Error inesperado" }
  }
}
