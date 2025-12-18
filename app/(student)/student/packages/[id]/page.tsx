import Link from "next/link"
import { cookies } from "next/headers"
import SiteHeader from "@/components/site-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { sql } from "@/server/db"
import { getCurrentUser } from "@/lib/auth"

// Simple server-side query: get package info + its videos.
async function getPackageWithVideos(packageId: string) {
  const [pkg] = (await sql`
    SELECT id, teacher_id, name, description, price, thumbnail_url
    FROM video_packages
    WHERE id = ${packageId}
    LIMIT 1;
  `) as any[]

  if (!pkg) return null

  const videos = (await sql`
    SELECT id, title, description, category, is_free, month, thumbnail_url
    FROM videos
    WHERE package_id = ${packageId}
    ORDER BY created_at ASC;
  `) as any[]

  return { pkg, videos }
}

export default async function PackagePage({ params }: { params: { id: string } }) {
  const packageId = params.id
  const data = await getPackageWithVideos(packageId)

  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value
  const user = await getCurrentUser(sessionId)

  if (!data) {
    return (
      <main>
        <SiteHeader />
        <div className="mx-auto max-w-4xl p-6">
          <Card>
            <CardHeader>
              <CardTitle>Package not found</CardTitle>
              <CardDescription>The requested package does not exist.</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/" className="underline">
                Go back home
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    )
  }

  const { pkg, videos } = data

  const priceLabel = typeof pkg.price === "number" && pkg.price > 0
    ? (pkg.price / 100).toLocaleString("en-EG", { style: "currency", currency: "EGP", minimumFractionDigits: 0 })
    : "Free"

  return (
    <main>
      <SiteHeader />
      <div className="mx-auto max-w-5xl p-4 sm:p-6 space-y-6">
        <Card className="overflow-hidden">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {pkg.thumbnail_url && (
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border bg-muted">
                <img src={pkg.thumbnail_url} alt={pkg.name} className="h-full w-full object-cover" loading="lazy" />
              </div>
            )}
            <div className="space-y-2">
              <CardTitle className="text-xl sm:text-2xl">{pkg.name}</CardTitle>
              {pkg.description && (
                <CardDescription className="max-w-2xl whitespace-pre-line text-sm">
                  {pkg.description}
                </CardDescription>
              )}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Badge variant="outline">{priceLabel}</Badge>
                <Badge variant="secondary">Package</Badge>
                {user && <Badge variant="secondary">Logged in as student</Badge>}
              </div>
            </div>
          </CardHeader>
        </Card>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold">Videos in this package</h2>
            <span className="text-xs text-muted-foreground">{videos.length} lesson(s)</span>
          </div>

          {videos.length === 0 && (
            <p className="text-sm text-muted-foreground">No videos have been added to this package yet.</p>
          )}

          <div className="grid gap-3 sm:grid-cols-2">
            {videos.map((v) => (
              <Card key={v.id} className="h-full overflow-hidden">
                <CardContent className="flex gap-3 p-3">
                  {v.thumbnail_url && (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <img
                        src={v.thumbnail_url}
                        alt={v.title ?? "Video thumbnail"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
                      {v.category && <Badge variant="outline">{v.category}</Badge>}
                      {typeof v.is_free === "boolean" && (
                        <Badge variant={v.is_free ? "default" : "secondary"}>{v.is_free ? "Free" : "Paid"}</Badge>
                      )}
                      {typeof v.month === "number" && <Badge variant="secondary">Month {v.month}</Badge>}
                    </div>
                    <p className="text-sm font-semibold leading-snug line-clamp-2">{v.title || "Lesson"}</p>
                    {v.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2">{v.description}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  )
}
