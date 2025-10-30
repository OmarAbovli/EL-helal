import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import Global3DBackground from "@/components/global-3d-background"
import BackgroundCompat from "@/components/background-compat"
import { getCurrentUser } from "@/lib/auth"
import { AuthProvider } from "@/lib/auth-provider"
import { FloatingChat } from "@/components/messaging/floating-chat"
import { cookies } from "next/headers"

export const metadata: Metadata = {
  title: "El-helal",
  description: "Created with v0",
  generator: "v0.dev",
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sessionId = cookieStore.get("session_id")?.value
  const user = await getCurrentUser(sessionId)

  return (
    <html lang="en" suppressHydrationWarning className="h-full" data-three-bg="on">
      <head>
        <style>{`
/* Fonts */
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}

/* Ensure page background never hides the 3D canvas */
html, body { background: transparent !important; }

/* If any element still paints a solid viewport background, soften it a bit */
[data-three-bg="on"] .bg-background {
  background-color: transparent !important;
}
        `}</style>
      </head>
      <body className="min-h-screen text-foreground antialiased">
        <AuthProvider user={user}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
            {/* Keeps the 3D background visible; does not alter layout */}
            <Global3DBackground />
            {/* Runtime compatibility pass for late-loading full-screen solid backgrounds */}
            <BackgroundCompat />
            {/* App content above the background */}
            <div className="relative z-20">{children}</div>
            {/* Conditionally render Floating Chat for students, now INSIDE the providers */}
            {user?.role === 'student' && <FloatingChat />}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
