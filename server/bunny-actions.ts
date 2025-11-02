"use server"

import { buildBunnyEmbedUrl, buildBunnyHlsUrl } from "@/lib/bunny"

type BunnyVideoApiItem = {
  guid: string
  title: string
  length: number // seconds
  thumbnailFileName?: string | null
  status?: number
}

type BunnyListResponse = {
  items: BunnyVideoApiItem[]
  totalItems: number
  currentPage: number
  itemsPerPage: number
}

type MetaResult =
  | { ok: true; title?: string; durationSeconds?: number; thumbnailUrl?: string }
  | { ok: false; error: string }

function getEnv() {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID
  const apiKey = process.env.BUNNY_STREAM_API_KEY
  return { libraryId, apiKey }
}

function buildThumbUrl(libraryId: string, item: BunnyVideoApiItem) {
  // Thumbnail URL shape can vary per setup; this common pattern works for most Bunny libraries:
  // https://vz-{libraryId}.b-cdn.net/{guid}/thumbnail.jpg or use the API-provided path if available.
  // Prefer API-provided filename when present:
  if (item.thumbnailFileName) {
    // video.bunnycdn.com returns variations like "/{guid}/thumbnail.jpg".
    return `https://vz-${libraryId}.b-cdn.net${item.thumbnailFileName.startsWith("/") ? "" : "/"}${item.thumbnailFileName}`
  }
  return `https://vz-${libraryId}.b-cdn.net/${item.guid}/thumbnail.jpg`
}

/**
 * List videos in your Bunny library (server-side).
 */
export async function listBunnyVideos(params?: {
  page?: number
  itemsPerPage?: number
  search?: string
}) {
  const { libraryId, apiKey } = getEnv()
  if (!libraryId) {
    return { ok: false as const, error: "BUNNY_STREAM_LIBRARY_ID is not configured." }
  }
  if (!apiKey) {
    return { ok: false as const, error: "BUNNY_STREAM_API_KEY is not configured." }
  }

  const page = params?.page ?? 1
  const itemsPerPage = params?.itemsPerPage ?? 12
  const search = params?.search?.trim() ?? ""

  const url = new URL(`https://video.bunnycdn.com/library/${libraryId}/videos`)
  url.searchParams.set("page", String(page))
  url.searchParams.set("itemsPerPage", String(itemsPerPage))
  if (search) url.searchParams.set("search", search)

  const res = await fetch(url.toString(), {
    headers: { accept: "application/json", AccessKey: apiKey },
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    return { ok: false as const, error: `Bunny list failed: ${res.status} ${text}` }
  }

  const data = (await res.json()) as BunnyListResponse

  const items = data.items.map((it) => {
    const embedUrl = buildBunnyEmbedUrl(libraryId, it.guid)
    const hlsUrl = buildBunnyHlsUrl(libraryId, it.guid)
    const thumbnailUrl = buildThumbUrl(libraryId, it)
    return {
      id: it.guid,
      title: it.title,
      durationSeconds: Math.round(it.length ?? 0),
      embedUrl,
      hlsUrl,
      thumbnailUrl,
      status: it.status ?? 0,
    }
  })

  return {
    ok: true as const,
    items,
    totalItems: data.totalItems,
    currentPage: data.currentPage,
    itemsPerPage: data.itemsPerPage,
  }
}

/**
 * Fetch a single video’s metadata by Video ID (GUID).
 */
export async function getBunnyVideoMetadata(videoId: string): Promise<MetaResult> {
  const lib = process.env.BUNNY_STREAM_LIBRARY_ID
  const apiKey = process.env.BUNNY_STREAM_API_KEY
  if (!lib || !apiKey) {
    return { ok: false, error: "Bunny API credentials are not configured." }
  }
  try {
    const res = await fetch(`https://video.bunnycdn.com/library/${lib}/videos/${videoId}`, {
      headers: { accept: "application/json", AccessKey: apiKey },
      cache: "no-store",
    })
    if (!res.ok) {
      return { ok: false, error: `Bunny API error: ${res.status}` }
    }
    const data = (await res.json()) as any
    return {
      ok: true,
      title: data?.title ?? undefined,
      durationSeconds: typeof data?.length === "number" ? Math.round(data.length) : undefined,
      thumbnailUrl: data?.thumbnailUrl ?? data?.thumbnail ?? undefined,
    }
  } catch (e: any) {
    return { ok: false, error: e?.message ?? "Network error" }
  }
}
