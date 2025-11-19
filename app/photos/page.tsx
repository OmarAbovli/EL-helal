import SiteHeader from "@/components/site-header"
import PhotoCard from "@/components/photo-card"
import { getRecentPhotos } from "@/server/photo-queries"

export default async function PhotosPage() {
  const photos = await getRecentPhotos(30)

  return (
    <main className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 dark:from-emerald-950 dark:via-zinc-950 dark:to-teal-950">
      <SiteHeader />
      <div className="mx-auto max-w-6xl p-6">
        <h1 className="text-2xl font-semibold">Photos</h1>
        <p className="text-sm text-muted-foreground mt-1">
          A gallery of images from all teachers. Like and comment when signed in.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {photos.map((p) => (
            <PhotoCard
              key={p.id}
              id={p.id}
              url={p.url}
              caption={p.caption}
              likeCount={p.like_count}
              commentCount={p.comment_count}
              likedByMe={false}
              teacherId={p.teacher_id}
              teacherName={p.teacher_name}
              teacherAvatarUrl={p.teacher_avatar_url}
              createdAt={p.created_at}
            />
          ))}
          {photos.length === 0 && <div className="col-span-full text-sm text-muted-foreground">No photos yet.</div>}
        </div>
      </div>
    </main>
  )
}
