import { Suspense } from "react"
import SiteHeader from "@/components/site-header"
import { cookies } from "next/headers"
import Link from "next/link"
import StudentVideoCard from "@/components/student-video-card"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getCurrentUser } from "@/lib/auth"
import {
  getAccessibleVideos,
  getUpcomingLiveSessions,
  getActiveLiveStreams,
  getAccessibleVideoCategories,
} from "@/server/student-queries"
import { VideoPlayer } from "@/components/video-player"
import { StudentHeroFX } from "@/components/student-hero-fx"
import { Button } from "@/components/ui/button"
import { VideoCategoryFilter } from "@/components/video-category-filter"

export default async function StudentPage({ searchParams }: { searchParams?: { error?: string; category?: string } }) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get("session_id")?.value
  const user = await getCurrentUser(sessionCookie)
  const err = searchParams?.error
  const category = searchParams?.category

  if (!user || user.role !== "student") {
    return (
      <main>
        <SiteHeader />
        <StudentHeroFX name="Student" ctaHref="#portal" />
        <div id="portal" className="mx-auto max-w-4xl p-6 -mt-12">
          {err === "invalid-token" && (
            <Alert variant="destructive" className="mb-6">
              <AlertTitle>Invalid or expired QR link</AlertTitle>
              <AlertDescription>
                Ask your teacher to generate a new QR code and try again. You can also proceed to the portal below.
              </AlertDescription>
            </Alert>
          )}
          <h1 className="text-2xl font-semibold">Student Portal</h1>
          <p className="text-sm text-muted-foreground mt-1">Please log in using your QR code or credentials.</p>
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Use QR Login</CardTitle>
                <CardDescription>Ask your teacher for your QR code. When scanned, it will log you in.</CardDescription>
              </CardHeader>

            </Card>
          </div>
        </div>
      </main>
    )
  }

  const [videos, sessions, activeNow, categories] = await Promise.all([
    getAccessibleVideos(user.id, { category }),
    getUpcomingLiveSessions(user.id),
    getActiveLiveStreams(user.id),
    getAccessibleVideoCategories(user.id),
  ])

  return (
    <main>
      <SiteHeader />
      <StudentHeroFX name={user.name ?? "Student"} ctaHref="#videos" />

      <div className="mx-auto max-w-6xl p-4 -mt-20">
        {/* Live Now */}
        {activeNow.length > 0 && (
          <section id="live-now" className="mb-8 grid gap-4">
            <Card className="border-primary/20 bg-primary/10">
              <CardHeader>
                <CardTitle>Live Now</CardTitle>
                <CardDescription>
                  Your teacher{activeNow.length > 1 ? "s are" : " is"} live right now. Join the stream.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {activeNow.map((s) => (
                    <div
                      key={s.teacher_id}
                      className="flex items-center justify-between gap-3 rounded-md border bg-card p-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{s.title}</p>
                        <p className="truncate text-xs text-muted-foreground">Teacher: {s.teacher_name}</p>
                      </div>
                      {s.url ? (
                        <a href={s.url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm">Join</Button>
                        </a>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Videos */}
        <section id="videos" className="grid gap-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold">Your Videos</h2>
            <VideoCategoryFilter categories={categories} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {videos.map((v) => (
              <StudentVideoCard
                key={v.id}
                id={v.id}
                title={v.title}
                source={v.url}
                thumbnailUrl={v.thumbnail_url || "/course-thumbnail.png"}
                watermarkText={user.name ? `${user.name} • ${user.id}` : user.id}
                antiDownload
              />
            ))}
            {videos.length === 0 && (
              <p className="text-sm text-muted-foreground">
                {category ? `No videos found in category: "${category}"` : "No videos yet."}
              </p>
            )}
          </div>
        </section>

        {/* Upcoming Live Sessions (Scheduled) */}
        {sessions.length > 0 && (
          <section id="live" className="mt-12 grid gap-4">
            <h2 className="text-xl font-semibold">Upcoming Live Sessions</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {sessions.map((s: any) => (
                <div
                  key={s.id}
                  className="flex flex-col justify-between gap-3 rounded-md border bg-card p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{s.title}</p>
                    <p className="truncate text-xs text-muted-foreground">Teacher: {s.teacher_name}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Starts: {new Date(s.start_at).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}