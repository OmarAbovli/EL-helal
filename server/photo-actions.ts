"use server"

import { sql } from "@/server/db"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { getCurrentUser } from "@/lib/auth"

type CreatePhotoInput = {
  url: string
  caption?: string | null
}

function genId() {
  try {
    // @ts-ignore
    if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID()
  } catch {}
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

async function requireUser() {
  const sessionId = (await cookies()).get("session_id")?.value
  const me = await getCurrentUser(sessionId)
  return me
}

/**
 * Teachers can create a photo with a public URL and optional caption.
 * This matches the call-site: createPhoto({ url, caption })
 */
export async function createPhoto(input: CreatePhotoInput) {
  const me = await requireUser()
  if (!me || me.role !== "teacher") {
    throw new Error("Only teachers can upload photos")
  }

  const id = genId()
  const caption = (input.caption ?? "").toString().slice(0, 1000)

  await sql`
    INSERT INTO photos (id, teacher_id, url, caption)
    VALUES (${id}, ${me.id}, ${input.url}, ${caption})
  `

  // Make sure the Teacher dashboard updates immediately
  revalidatePath("/teacher")
  // And the public gallery if you have one
  revalidatePath("/photos")

  return { id }
}

/**
 * Any authenticated user can like/unlike a photo.
 */
export async function toggleLike(photoId: string) {
  const me = await requireUser()
  if (!me) {
    return { ok: false as const, status: 401, message: "Not authenticated." }
  }

  try {
    const existing = (await sql`
      SELECT 1 FROM photo_likes WHERE photo_id = ${photoId} AND user_id = ${me.id} LIMIT 1;
    `) as any[]

    if (existing.length > 0) {
      await sql`DELETE FROM photo_likes WHERE photo_id = ${photoId} AND user_id = ${me.id};`
    } else {
      await sql`INSERT INTO photo_likes (photo_id, user_id) VALUES (${photoId}, ${me.id});`
    }

    const [{ cnt }] = (await sql`
      SELECT COUNT(*)::int AS cnt FROM photo_likes WHERE photo_id = ${photoId};
    `) as any[]

    revalidatePath("/photos")
    return { ok: true as const, count: Number(cnt) }
  } catch (e) {
    console.error("toggleLike error", e)
    return { ok: false as const, status: 500, message: "Failed to toggle like." }
  }
}

/**
 * Any authenticated user can comment on a photo.
 */
export async function addComment(photoId: string, body: string) {
  const me = await requireUser()
  if (!me) {
    return { ok: false as const, status: 401, message: "Not authenticated." }
  }

  const text = (body ?? "").toString().trim()
  if (!text) return { ok: false as const, status: 400, message: "Comment cannot be empty." }
  if (text.length > 2000) return { ok: false as const, status: 400, message: "Comment too long." }

  try {
    const [row] = (await sql`
      INSERT INTO photo_comments (id, photo_id, user_id, body)
      VALUES (${genId()}, ${photoId}, ${me.id}, ${text})
      RETURNING id, photo_id, user_id, body, created_at;
    `) as any[]

    const [u] = (await sql`
      SELECT name AS user_name, avatar_url AS user_avatar_url
      FROM users WHERE id = ${me.id} LIMIT 1;
    `) as any[]

    revalidatePath("/photos")
    return { ok: true as const, comment: { ...row, ...u } }
  } catch (e) {
    console.error("addComment error", e)
    return { ok: false as const, status: 500, message: "Failed to add comment." }
  }
}
