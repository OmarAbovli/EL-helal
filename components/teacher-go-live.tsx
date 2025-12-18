"use client"

import { useEffect, useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { getMyLiveStatus, setLiveStatus } from "@/server/live-actions"
import type { VideoPackage } from "@/server/package-actions"

export function TeacherGoLive({ packages }: { packages: VideoPackage[] }) {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()
  const [loaded, setLoaded] = useState(false)

  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [isActive, setIsActive] = useState(false)
  const [grades, setGrades] = useState<number[]>([])
  const [selectedPackageIds, setSelectedPackageIds] = useState<string[]>([])

  const [streamType, setStreamType] = useState<'external' | 'jitsi' | 'livekit'>('external')

  useEffect(() => {
    // If switching to integrated providers, auto-generate a URL structure
    // Note: The actual unique room creation happens on 'activate', but we show a preview or placeholder here.
    if (streamType === 'jitsi') {
      setUrl(`https://meet.jit.si/ELHELAL-LIVE-${Date.now()}`) // Placeholder, will be finalized on activate
    } else if (streamType === 'livekit') {
      setUrl(`/livekit?room=ELHELAL-LIVE-${Date.now()}&role=guest`)
    } else {
      setUrl('')
    }
  }, [streamType])

  function toggleGrade(g: number) {
    setGrades((prev) => (prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]))
  }

  function togglePackage(id: string) {
    setSelectedPackageIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  function activate() {
    let finalUrl = url;

    // Ensure we have a URL for external, or generate one for integrated if empty
    if (streamType === 'external') {
      if (!finalUrl || finalUrl.trim().length === 0) {
        toast({ title: "Missing link", description: "Please paste the Zoom/YouTube/live link.", variant: "destructive" })
        return
      }
    } else if (streamType === 'jitsi') {
      // Generate a fresh Jitsi room for streaming
      const roomName = `ELHELAL-LIVE-${Date.now()}`
      // Moderator URL for teacher (will be saved in DB? No, DB saves what STUDENTS see)
      // Wait, 'url' in setLiveStatus is what STUDENTS click.
      // For Jitsi: Students go to meet.jit.si/ROOM
      // Teacher needs to go to meet.jit.si/ROOM#config...

      // We will save the STUDENT URL in the database.
      finalUrl = `https://meet.jit.si/${roomName}`

      // But the Teacher needs to open the MODERATOR link.
      // We handle this by opening the moderator link in a new tab right now.
      const teacherUrl = `https://meet.jit.si/${roomName}#config.prejoinPageEnabled=false&userInfo.displayName="المعلم"&userInfo.role=moderator`
      window.open(teacherUrl, '_blank')
    } else if (streamType === 'livekit') {
      const roomName = `ELHELAL-LIVE-${Date.now()}`
      // Student URL
      finalUrl = `/livekit?room=${roomName}` // Students join as guest by default

      // Teacher logic: Open internal page as host
      window.open(`/livekit?room=${roomName}&role=host`, '_blank')
    }

    startTransition(async () => {
      const res = await setLiveStatus({ title, url: finalUrl, active: true, grades, packageIds: selectedPackageIds })
      toast({
        title: res.ok ? "Live started" : "Error",
        description: res.ok ? "Students will see your stream as live now." : (res.error ?? "Could not start live"),
        variant: res.ok ? "default" : "destructive",
      })
      if (res.ok) {
        setIsActive(true)
        if (streamType !== 'external') {
          setUrl(finalUrl) // Update state to show the generated URL
        }
      }
    })
  }

  function stop() {
    startTransition(async () => {
      const res = await setLiveStatus({ title, url, active: false, grades, packageIds: selectedPackageIds })
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
        <Label>Stream Type</Label>
        <div className="flex bg-slate-100 p-1 rounded-lg gap-1">
          <button
            onClick={() => setStreamType('external')}
            className={`flex-1 py-1.5 text-sm rounded-md transition-all ${streamType === 'external' ? 'bg-white shadow text-slate-900 font-medium' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            External Link
          </button>
          <button
            onClick={() => setStreamType('jitsi')}
            className={`flex-1 py-1.5 text-sm rounded-md transition-all ${streamType === 'jitsi' ? 'bg-white shadow text-emerald-700 font-medium' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            Jitsi Meet
          </button>
          <button
            onClick={() => setStreamType('livekit')}
            className={`flex-1 py-1.5 text-sm rounded-md transition-all ${streamType === 'livekit' ? 'bg-white shadow text-indigo-700 font-medium' : 'text-slate-500 hover:bg-slate-200'}`}
          >
            LiveKit Cloud
          </button>
        </div>
      </div>

      {streamType === 'external' && (
        <div className="space-y-2">
          <Label htmlFor="live-url">Live link (Zoom, YouTube, etc.)</Label>
          <Input id="live-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." />
          <p className="text-xs text-muted-foreground">
            Paste any join URL. Students will get a “Live Now” banner with this link.
          </p>
        </div>
      )}

      {streamType !== 'external' && (
        <div className="p-3 bg-slate-50 border rounded-lg text-sm text-slate-600">
          {streamType === 'jitsi' ? (
            <p>A <strong>Jitsi Meet</strong> room will be created automatically. You will be redirected to join as a moderator.</p>
          ) : (
            <p>A <strong>LiveKit</strong> room will be created automatically. You will be redirected to the broadcasting page.</p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label>Target Grades (optional)</Label>
        <div className="flex gap-4">
          {[1, 2, 3].map((g) => (
            <div key={g} className="flex items-center gap-2">
              <Checkbox checked={grades.includes(g)} onCheckedChange={() => toggleGrade(g)} id={`go-live-grade-${g}`} />
              <Label htmlFor={`go-live-grade-${g}`}>Grade {g}</Label>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Restrict to Packages (optional)</Label>
        <div className="flex flex-wrap gap-2">
          {packages.map((p) => (
            <label key={p.id} className="flex items-center gap-1 text-xs">
              <Checkbox
                checked={selectedPackageIds.includes(p.id)}
                onCheckedChange={() => togglePackage(p.id)}
              />
              <span>{p.name}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Legacy Provider Selection (Removed in favor of Stream Type above) */}

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
