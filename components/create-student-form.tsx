"use client"

import { useState, useTransition } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createStudent } from "@/server/teacher-actions"
import { useToast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import type { StudentClassification } from "@/server/teacher-actions"

const months = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
]

export function CreateStudentForm() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [guardianPhone, setGuardianPhone] = useState("")
  const [grade, setGrade] = useState<number | null>(null)
  const [classification, setClassification] = useState<StudentClassification>("center")
  const [allowedMonths, setAllowedMonths] = useState<number[]>([])
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const [creds, setCreds] = useState<{ username: string; password: string } | null>(null)
  const [studentId, setStudentId] = useState<string | null>(null)

  function toggleMonth(m: number) {
    setAllowedMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!grade) return
        startTransition(async () => {
          const res = await createStudent({ name, phone, guardianPhone, grade, allowedMonths, classification })
          if (res?.ok) {
            toast({ title: "Student created", description: `Student ID: ${res.studentId}` })
            setStudentId(res.studentId)
            setCreds({ username: res.username, password: res.password })
            setName("")
            setPhone("")
            setGuardianPhone("")
            setGrade(null)
            setClassification("center")
            setAllowedMonths([])
          } else {
            toast({ title: "Error", description: res?.error ?? "Failed to create student", variant: "destructive" })
          }
        })
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="s-name">Full name</Label>
        <Input id="s-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Smith" required />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="s-phone">Phone</Label>
          <Input
            id="s-phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 555 222 3333"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="s-gphone">Guardian phone</Label>
          <Input
            id="s-gphone"
            value={guardianPhone}
            onChange={(e) => setGuardianPhone(e.target.value)}
            placeholder="+1 555 111 2222"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Grade</Label>
          <Select value={grade?.toString() ?? ""} onValueChange={(v) => setGrade(Number.parseInt(v))}>
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">First year</SelectItem>
              <SelectItem value="2">Second year</SelectItem>
              <SelectItem value="3">Third year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Classification</Label>
          <Select value={classification} onValueChange={(v) => setClassification(v as StudentClassification)}>
            <SelectTrigger>
              <SelectValue placeholder="Select classification" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Unlock Months</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {months.map((m) => (
            <label key={m.value} className="flex items-center gap-2 text-sm">
              <Checkbox checked={allowedMonths.includes(m.value)} onCheckedChange={() => toggleMonth(m.value)} />
              <span>{m.label}</span>
            </label>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          These months control paid video access for this student. Classification helps with bulk updates later.
        </p>
      </div>

      <Button disabled={isPending || !grade} type="submit">
        {isPending ? "Creating..." : "Create Student"}
      </Button>

      {creds && studentId && (
        <Card className="mt-4">
          <CardContent className="pt-4">
            <p className="text-sm font-medium">Generated Credentials</p>
            <p className="text-xs text-muted-foreground mt-1">Share these with the student securely.</p>
            <div className="mt-2 grid gap-1 text-sm">
              <div>
                <span className="font-medium">Student ID: </span>
                <code className="rounded bg-muted px-1 py-0.5">{studentId}</code>
              </div>
              <div>
                <span className="font-medium">Username: </span>
                <code className="rounded bg-muted px-1 py-0.5">{creds.username}</code>
              </div>
              <div>
                <span className="font-medium">Password: </span>
                <code className="rounded bg-muted px-1 py-0.5">{creds.password}</code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </form>
  )
}
