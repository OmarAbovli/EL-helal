"use client"

import { Button } from "@/components/ui/button"

export function Hero3DBook({
  primaryHref = "/teachers",
  secondaryHref = "/login",
}: {
  primaryHref?: string
  secondaryHref?: string
}) {
  return (
    <section className="relative overflow-hidden">
      {/* Dual-theme background */}
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden>
        <div
          className="h-full w-full dark:hidden"
          style={{
            background:
              "radial-gradient(1200px 500px at 20% 10%, rgba(16,185,129,0.18), transparent 60%), radial-gradient(1200px 500px at 80% 20%, rgba(45,212,191,0.18), transparent 60%), linear-gradient(180deg, #ffffff 0%, #f0fdf4 100%)",
          }}
        />
        <div
          className="hidden h-full w-full dark:block"
          style={{
            background:
              "radial-gradient(1200px 500px at 20% 10%, rgba(16,185,129,0.10), transparent 60%), radial-gradient(1200px 500px at 80% 20%, rgba(45,212,191,0.10), transparent 60%), linear-gradient(180deg, #020617 0%, #0b1220 100%)",
          }}
        />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-[1.2fr_1fr]">
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/70 px-3 py-1 text-[11px] text-foreground/80 shadow-sm backdrop-blur">
            Built for curious minds — from first day to finals
          </div>
          <h1 className="mt-4 text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
            Spark curiosity. Build confidence.
          </h1>
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            Fun meets focus: lessons, quests, and live sessions that keep you hooked while you learn.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <a href={primaryHref}>
              <Button className="bg-emerald-600 hover:bg-emerald-700">Explore Teachers</Button>
            </a>
            <a href={secondaryHref}>
              <Button
                variant="outline"
                className="border-emerald-300 text-emerald-700 bg-transparent dark:text-emerald-300 dark:border-emerald-700"
              >
                Login
              </Button>
            </a>
          </div>
          <div className="mt-3 flex gap-2 text-[11px] text-emerald-700/80 dark:text-emerald-300/80">
            <span className="rounded-full border border-emerald-300/60 bg-card/60 px-2 py-0.5 shadow-sm">
              Daily streaks
            </span>
            <span className="rounded-full border border-emerald-300/60 bg-card/60 px-2 py-0.5 shadow-sm">Rewards</span>
            <span className="rounded-full border border-emerald-300/60 bg-card/60 px-2 py-0.5 shadow-sm">Quests</span>
          </div>
        </div>

        {/* 3D Book mock with glossy sweep */}
        <div className="relative z-10 mx-auto h-[280px] w-[230px] perspective-1000 md:h-[360px] md:w-[300px]">
          <div className="group relative h-full w-full rounded-xl border border-border bg-card shadow-lg transition-transform [transform:rotateX(8deg)_rotateY(-12deg)] hover:[transform:rotateX(6deg)_rotateY(-8deg)]">
            {/* Spine */}
            <div className="absolute inset-y-0 left-0 w-8 rounded-l-xl bg-gradient-to-b from-emerald-400/20 to-emerald-600/20 dark:from-emerald-500/10 dark:to-emerald-700/10" />
            {/* Cover pattern */}
            <div
              className="absolute inset-0 rounded-xl"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, rgba(16,185,129,0.25), transparent 55%), radial-gradient(circle at 80% 40%, rgba(45,212,191,0.22), transparent 55%), linear-gradient(135deg, rgba(255,255,255,0.06), transparent 40%)",
              }}
            />
            {/* Shine sweep */}
            <span className="pointer-events-none absolute inset-y-0 left-[-40%] w-1/2 -skew-x-12 bg-gradient-to-r from-white/10 via-white/30 to-white/10 opacity-0 blur-md transition group-hover:animate-[shine_1.2s_ease] dark:via-white/15" />
            <style>{`
              @keyframes shine {
                0% { transform: translateX(0) skewX(-12deg); opacity: 0; }
                20% { opacity: .8; }
                100% { transform: translateX(260%) skewX(-12deg); opacity: 0; }
              }
            `}</style>
            {/* Content lines */}
            <div className="absolute inset-4 grid gap-2">
              <div className="h-3 w-5/6 rounded bg-muted" />
              <div className="h-3 w-3/5 rounded bg-muted" />
              <div className="mt-2 h-20 rounded bg-muted" />
              <div className="mt-auto flex gap-2">
                <div className="h-8 w-20 rounded bg-emerald-600/80" />
                <div className="h-8 w-20 rounded border border-emerald-300/70 bg-transparent dark:border-emerald-700/70" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
