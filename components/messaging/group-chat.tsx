"use client"

import { useEffect, useRef, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

type Message = {
  id: string
  grade: number
  sender_id: string
  body: string
  created_at: string
  sender: { id: string; name: string | null; avatar_url: string | null }
}

export default function GroupChat({ grade: initialGrade, isTeacher = false, initialGrades = [] }: { grade?: number; isTeacher?: boolean; initialGrades?: number[] }) {
  const [grade, setGrade] = useState<number | null>(initialGrade ?? null)
  const [messages, setMessages] = useState<Message[]>([])
  const [body, setBody] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { toast } = useToast()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const [grades, setGrades] = useState<number[]>(initialGrades || [])
  const [showGradeSelect, setShowGradeSelect] = useState(false)
  const selectRef = useRef<HTMLSelectElement | null>(null)
  const [showDebugUI, setShowDebugUI] = useState(false)
  const [lastFetch, setLastFetch] = useState<any>(null)

  useEffect(() => {
    // If the page provided initial grades (server-side), use them. Otherwise fall back to calling the server action.
    if (isTeacher && (!initialGrades || initialGrades.length === 0)) {
      getMyGradesForTeacher().then((g) => {
        const gs = g || []
        setGrades(gs)
        if (!grade && gs.length > 0) setGrade(gs[0])
      }).catch((err) => {
        console.error('Failed to load teacher grades', err)
      })
    } else if (isTeacher && initialGrades && initialGrades.length > 0) {
      // set initial grade if none selected
      if (!grade && initialGrades.length > 0) setGrade(initialGrades[0])
    }
  }, [isTeacher])

  useEffect(() => {
    if (showGradeSelect) selectRef.current?.focus()
  }, [showGradeSelect])

  useEffect(() => {
    // enable debug UI when ?dbg=1 present in URL (client-only)
    try {
      const params = new URLSearchParams(window.location.search)
      if (params.get('dbg') === '1') setShowDebugUI(true)
    } catch (e) {
      // ignore server-side
    }
  }, [])

  useEffect(() => {
    let mounted = true
    if (!grade) return
    const load = async () => {
      try {
        const res = await fetch(`/api/group-chat/messages?grade=${grade}`, { cache: 'no-store' })
        const data = await res.json()
        setLastFetch({ url: `/api/group-chat/messages?grade=${grade}`, status: res.status, body: data })
        if (data?.ok && mounted) setMessages(data.messages || [])
        // scroll to bottom
        setTimeout(() => scrollRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }), 50)
      } catch (e) {
        console.error(e)
      }
    }
    load()
    const iv = setInterval(load, 4000)
    return () => {
      mounted = false
      clearInterval(iv)
    }
  }, [grade])

  const handleSend = async () => {
    if (!grade || !body.trim()) return
    setIsSending(true)
    try {
      const r = await fetch('/api/group-chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade, body }),
      })
      const data = await r.json()
      setLastFetch({ url: '/api/group-chat/messages (POST)', status: r.status, body: data })
      if (data?.ok) {
        setBody("")
        // reload messages
        const res2 = await fetch(`/api/group-chat/messages?grade=${grade}`, { cache: 'no-store' })
        const d2 = await res2.json()
        setLastFetch({ url: `/api/group-chat/messages?grade=${grade}`, status: res2.status, body: d2 })
        if (d2?.ok) setMessages(d2.messages || [])
        setTimeout(() => scrollRef.current?.scrollTo({ top: 999999, behavior: 'smooth' }), 50)
      } else {
        toast({ title: 'Failed to send message', variant: 'destructive' })
      }
    } catch (e) {
      console.error(e)
      toast({ title: 'Error sending message', variant: 'destructive' })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">Community Chat {grade ? `— Grade ${grade}` : ''}</h2>
        {isTeacher && (
          <div>
            {grades.length === 0 ? (
              <div className="text-sm text-muted-foreground">No grades found (no subscribed students).</div>
              ) : (
              <select value={grade ?? ''} onChange={(e) => setGrade(Number(e.target.value))} className="border rounded px-2 py-1 bg-white dark:bg-neutral-900 text-foreground dark:text-foreground">
                <option value="">Select grade...</option>
                {grades.map((g) => (
                  <option key={g} value={g}>Grade {g}</option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {!grade ? (
        // Show the selection prompt. For teachers show quick visual buttons next to the prompt (no action for now).
        isTeacher ? (
          <div className="rounded border p-6 text-sm text-muted-foreground flex items-center justify-between">
            <div>اختار الصف</div>
            <div className="ml-4 flex items-center gap-3">
              {/* quick grade text links 1..3 */}
              {[1, 2, 3].map((n) => {
                const enabled = grades.includes(n)
                return (
                  <span
                    key={n}
                    onClick={() => { if (enabled) setGrade(n) }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { if (enabled) setGrade(n) } }}
                    className={`text-sm ${enabled ? 'text-primary underline cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                    title={enabled ? `افتح محادثة الصف ${n}` : `لا يوجد طلاب مشتركين في الصف ${n}`}
                  >
                    الصف {n}
                  </span>
                )
              })}

              <button
                aria-label="Open grade selector"
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-neutral-800"
                onClick={() => setShowGradeSelect((s) => !s)}
              >
                {/* simple chevron svg */}
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            {showGradeSelect && (
              <div className="mt-3 w-full">
                <select
                  ref={selectRef}
                  value={grade ?? ''}
                  onChange={(e) => { setGrade(Number(e.target.value)); setShowGradeSelect(false) }}
                  className="border rounded px-2 py-1 w-full bg-white dark:bg-neutral-900 text-foreground dark:text-foreground"
                >
                  <option value="">Select grade...</option>
                  {grades.map((g) => (
                    <option key={g} value={g}>Grade {g}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded border p-6 text-sm text-muted-foreground">اختار الصف</div>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <div ref={scrollRef} className="h-80 overflow-auto rounded border p-3 bg-white/60 dark:bg-black/50">
            {messages.map((m) => (
              <div key={m.id} className="mb-2">
                <div className="text-xs text-muted-foreground">{m.sender?.name ?? m.sender?.id} • {new Date(m.created_at).toLocaleString()}</div>
                <div className="rounded p-2 bg-card/60">{m.body}</div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <Textarea value={body} onChange={(e) => setBody((e.target as HTMLTextAreaElement).value)} rows={3} />
            <div className="flex flex-col">
              <Button onClick={handleSend} disabled={isSending || !body.trim()}>Send</Button>
            </div>
          </div>
        </div>
      )}
      {showDebugUI && (
        <div className="mt-4 p-3 border rounded bg-gray-50 text-xs dark:bg-neutral-900">
          <div className="font-medium mb-1">Debug</div>
          <div>Grades: {JSON.stringify(grades)}</div>
          <div>Selected grade: {String(grade)}</div>
          <div>Messages count: {messages.length}</div>
          <pre className="mt-2 whitespace-pre-wrap">{JSON.stringify(lastFetch, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
