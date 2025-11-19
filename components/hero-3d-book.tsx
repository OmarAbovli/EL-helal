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
              "radial-gradient(1200px 500px at 20% 10%, rgba(2,6,23,0.10), transparent 60%), radial-gradient(1200px 500px at 80% 20%, rgba(11,18,32,0.10), transparent 60%), linear-gradient(180deg, #020617 0%, #0b1220 100%)",
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
              <Button className="bg-emerald-600 hover:bg-emerald-700">About Us</Button>
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

        {/* 3D Logo */}
        <div className="relative z-10 mx-auto h-[280px] w-[280px] perspective-1000 md:h-[360px] md:w-[360px]">
          <div className="group relative h-full w-full transition-transform [transform:rotateX(8deg)_rotateY(-12deg)] hover:[transform:rotateX(6deg)_rotateY(-8deg)]">
            <img src="/logo.jpeg" alt="El Helal Logo" className="h-full w-full rounded-full object-cover shadow-lg" />
          </div>
        </div>
      </div>
    </section>
  )
}
