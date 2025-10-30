"use client"

import { useEffect, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { getMyLiveStatus, setLiveStatus } from "@/server/live-actions"

export function TeacherGoLive() {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [loaded, setLoaded] = useState(false)

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const s = await getMyLiveStatus()
      if (!mounted) return
      setTitle(s.title)
      setUrl(s.url)
      setIsActive(s.isActive)
      setLoaded(true)
    })()
    return () => {
      mounted = false
    }
  }, [])

  function activate() {
    if (!url || url.trim().length === 0) {
      toast({ title: "Missing link", description: "Please paste the Zoom/YouTube/live link.", variant: "destructive" })
      return
    }
    startTransition(async () => {
      const res = await setLiveStatus({ title, url, active: true })
      toast({
        title: res.ok ? "Live started" : "Error",
        description: res.ok ? "Students will see your stream as live now." : (res.error ?? "Could not start live"),
        variant: res.ok ? "default" : "destructive",
      })
      if (res.ok) setIsActive(true)
    })
  }

  function stop() {
    startTransition(async () => {
      const res = await setLiveStatus({ title, url, active: false })
      toast({
        title: res.ok ? "Live stopped" : "Error",
        description: res.ok ? "Students will no longer see your stream as live." : (res.error ?? "Could not stop live"),
        variant: res.ok ? "default" : "destructive",
      })
      if (res.ok) setIsActive(false)
    })
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <div className="grid">
          <span className="text-sm font-medium">Status</span>
          <span className="text-xs text-muted-foreground">
            {loaded ? "Live status updates instantly for your students." : "Loading status..."}
          </span>
        </div>
        <Badge variant={isActive ? "default" : "outline"} className={isActive ? "bg-emerald-600" : ""}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label htmlFor="live-title">Title (optional)</Label>
        <Input
          id="live-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Q&A: Algebra — Chapter 3"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="live-url">Live link (Zoom, YouTube, Livekit, etc.)</Label>
        <Input id="live-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
        <p className="text-xs text-muted-foreground">
          Paste any join URL. Students will get a “Live Now” banner with this link.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button onClick={activate} disabled={isPending}>
          {isPending && !isActive ? "Starting..." : "Activate Stream"}
        </Button>
        <Button variant="outline" onClick={stop} disabled={isPending || !isActive}>
          {isPending && isActive ? "Stopping..." : "Stop Live"}
        </Button>
      </div>
    </div>
  )
}
