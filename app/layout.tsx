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
  title: {
    default: "منصة الهلال | لغة إنجليزية للثانوية العامة مع الأستاذ تامر هلال",
    template: "%s | منصة الهلال",
  },
  description: "منصة الهلال التعليمية لتعلم اللغة الإنجليزية لطلاب الصف الأول والثاني والثالث الثانوي في طنطا. دروس تفاعلية، شروحات فيديو شاملة، اختبارات دورية، وإشراف مباشر من الأستاذ تامر هلال.",
  generator: "منصة الهلال التعليمية",
  applicationName: "منصة الهلال",
  icons: {
    icon: '/icon.png',
    shortcut: '/icon.png',
    apple: '/icon.png',
  },
  keywords: ["منصة الهلال", "لغة إنجليزية", "ثانوية عامة", "الأستاذ تامر هلال", "طنطا", "دروس إنجليزية", "شروحات فيديو", "اختبارات إنجليزية", "تعليم أونلاين", "الصف الأول الثانوي", "الصف الثاني الثانوي", "الصف الثالث الثانوي"],
  authors: [{ name: "الأستاذ تامر هلال" }],
  creator: "الأستاذ تامر هلال",
  publisher: "منصة الهلال التعليمية",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "منصة الهلال | لغة إنجليزية للثانوية العامة مع الأستاذ تامر هلال",
    description: "منصة الهلال التعليمية لتعلم اللغة الإنجليزية لطلاب الصف الأول والثاني والثالث الثانوي في طنطا. دروس تفاعلية، شروحات فيديو شاملة، اختبارات دورية، وإشراف مباشر من الأستاذ تامر هلال.",
    url: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://el-helal-rpe3.vercel.app/"),
    siteName: "منصة الهلال",
    images: [
      {
        url: new URL("/online-illustration-class.png", process.env.NEXT_PUBLIC_BASE_URL || "https://el-helal-rpe3.vercel.app/"),
        width: 1200,
        height: 630,
        alt: "منصة الهلال التعليمية للغة الإنجليزية",
      },
    ],
    locale: "ar_AR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "منصة الهلال | لغة إنجليزية للثانوية العامة مع الأستاذ تامر هلال",
    description: "منصة الهلال التعليمية لتعلم اللغة الإنجليزية لطلاب الصف الأول والثاني والثالث الثانوي في طنطا. دروس تفاعلية، شروحات فيديو شاملة، اختبارات دورية، وإشراف مباشر من الأستاذ تامر هلال.",
    creator: "@TamerHelalEdu", // Placeholder, if a Twitter handle exists
    images: [new URL("/online-illustration-class.png", process.env.NEXT_PUBLIC_BASE_URL || "https://el-helal-rpe3.vercel.app/")],
  },
};


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
