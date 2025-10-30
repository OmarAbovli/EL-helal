import Link from "next/link"
import { cookies } from "next/headers"
import { getCurrentUser } from "@/lib/auth"
import DarkModeToggle from "@/components/dark-mode-toggle"
import { LogoutButton } from "@/components/logout-button"
import NotificationBell from "@/components/notification-bell"

const SiteHeader = async () => {
  const cookieStore = await cookies()
  const user = await getCurrentUser(cookieStore.get("session_id")?.value)

  const getDashboardUrl = () => {
    if (!user) return "/"
    switch (user.role) {
      case "admin":
        return "/admin"
      case "teacher":
        return "/teacher"
      case "student":
        return "/student"
      default:
        return "/"
    }
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Brand */}
        <Link href={getDashboardUrl()} className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className="inline-flex h-7 w-7 items-center justify-center rounded-md border bg-card text-xs font-bold"
          >
            T
          </span>
          <span className="text-sm font-semibold">El-helal</span>
        </Link>

        {/* Nav links */}
        <div className="hidden items-center gap-4 sm:flex">
          {(!user || user.role !== 'student') && (
            <Link href="/about-us" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About Us
            </Link>
          )}
          {user && (
            user.role === 'teacher' ? (
              <div className="flex items-center gap-2">
                <Link
                  href={`/teacher/community-chat?grade=1`}
                  className="text-sm px-2 py-1 rounded border text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={`Open community chat for grade 1`}
                >
                  Community Chat
                </Link>
              </div>
            ) : (
              <Link href="/community-chat" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Community Chat
              </Link>
            )
          )}
          <Link href="/photos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Photos
          </Link>
          {user ? (
            <Link href={getDashboardUrl()} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </Link>
          ) : (
            <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Login
            </Link>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {user && user.role === 'student' && <NotificationBell />}
          <DarkModeToggle />
          {user && <LogoutButton />}
        </div>
      </nav>
    </header>
  )
}

export default SiteHeader
