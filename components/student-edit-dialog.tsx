"use client"

import { useState, useTransition } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { updateStudentAll } from "@/server/teacher-actions"

const monthList = [
  { value: 1, label: "Jan" },
  { value: 2, label: "Feb" },
  { value: 3, label: "Mar" },
  { value: 4, label: "Apr" },
  { value: 5, label: "May" },
  { value: 6, label: "Jun" },
  { value: 7, label: "Jul" },
  { value: 8, label: "Aug" },
  { value: 9, label: "Sep" },
  { value: 10, label: "Oct" },
  { value: 11, label: "Nov" },
  { value: 12, label: "Dec" },
]

export default function StudentEditDialog({
  student,
}: {
  student: {
    id: string
    name: string | null
    username: string | null
    grade: number | null
    phone: string | null
    guardian_phone: string | null
    classification: "center" | "online"
    allowed_months: number[]
  }
}) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(student.name ?? "")
  const [username, setUsername] = useState(student.username ?? "")
  const [phone, setPhone] = useState(student.phone ?? "")
  const [guardianPhone, setGuardianPhone] = useState(student.guardian_phone ?? "")
  const [grade, setGrade] = useState<number | "">(student.grade ?? "")
  const [classification, setClassification] = useState<"center" | "online">(student.classification ?? "center")
  const [newPassword, setNewPassword] = useState("")
  const [months, setMonths] = useState<number[]>(student.allowed_months ?? [])

  function toggleMonth(v: number) {
    setMonths((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]))
  }

  function save() {
    startTransition(async () => {
      const res = await updateStudentAll({
        studentId: student.id,
        name: name.trim() || undefined,
        username: username.trim() || undefined,
        phone: phone.trim() || undefined,
        guardianPhone: guardianPhone.trim() || undefined,
        grade: typeof grade === "number" ? grade : undefined,
        classification,
        newPassword: newPassword.trim() || undefined,
        months,
      })
      if (res.ok) {
        toast({ title: "Saved", description: "Student updated successfully." })
        setNewPassword("")
        setOpen(false)
      } else {
        toast({ title: "Error", description: res.error ?? "Failed to update student.", variant: "destructive" })
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          Edit
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="grid gap-1">
              <Label htmlFor={`name-${student.id}`}>Name</Label>
              <Input id={`name-${student.id}`} value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`username-${student.id}`}>Username</Label>
              <Input id={`username-${student.id}`} value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`phone-${student.id}`}>Phone</Label>
              <Input id={`phone-${student.id}`} value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <div className="grid gap-1">
              <Label htmlFor={`gphone-${student.id}`}>Guardian Phone</Label>
              <Input
                id={`gphone-${student.id}`}
                value={guardianPhone}
                onChange={(e) => setGuardianPhone(e.target.value)}
              />
            </div>
            <div className="grid gap-1">
              <Label>Grade</Label>
              <Select value={grade === "" ? "" : String(grade)} onValueChange={(v) => setGrade(v ? Number(v) : "")}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">First</SelectItem>
                  <SelectItem value="2">Second</SelectItem>
                  <SelectItem value="3">Third</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label>Classification</Label>
              <Select value={classification} onValueChange={(v) => setClassification(v as any)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select classification" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1 sm:col-span-2">
              <Label htmlFor={`pwd-${student.id}`}>New Password (optional)</Label>
              <Input
                id={`pwd-${student.id}`}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-2">
            <div className="text-sm font-medium">Access Months</div>
            <div className="flex flex-wrap gap-2">
              {monthList.map((m) => (
                <label key={m.value} className="flex items-center gap-1 text-xs">
                  <Checkbox checked={months.includes(m.value)} onCheckedChange={() => toggleMonth(m.value)} />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={save} disabled={isPending}>
            {isPending ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
