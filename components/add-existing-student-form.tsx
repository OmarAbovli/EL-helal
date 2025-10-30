"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { addExistingStudentToTeacher } from "@/server/teacher-actions"

const MONTHS = [
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

export default function AddExistingStudentForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  const [studentId, setStudentId] = useState("")
  const [classification, setClassification] = useState<"center" | "online">("center")
  const [allowedMonths, setAllowedMonths] = useState<number[]>([])

  function toggleMonth(m: number) {
    setAllowedMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Existing Student</CardTitle>
        <CardDescription>
          Link an existing student to your classroom using their Student ID. You can also set their type and monthly
          video access.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="grid gap-2">
            <Label htmlFor="student-id">Student ID</Label>
            <Input
              id="student-id"
              placeholder="e.g. s_abc123"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Student Type</Label>
            <Select value={classification} onValueChange={(v) => setClassification(v as "center" | "online")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="online">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Months (Center only)</Label>
            <div className={`flex flex-wrap gap-2 ${classification !== "center" ? "opacity-50" : ""}`}>
              {MONTHS.map((m) => (
                <label key={m.value} className="flex items-center gap-1 text-xs">
                  <Checkbox
                    checked={allowedMonths.includes(m.value)}
                    onCheckedChange={() => toggleMonth(m.value)}
                    disabled={classification !== "center"}
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div>
          <Button
            disabled={isPending || !studentId}
            onClick={() =>
              startTransition(async () => {
                const res = await addExistingStudentToTeacher(
                  studentId.trim(),
                  classification,
                  classification === "center" ? allowedMonths : [],
                )
                if (!res.ok) {
                  toast({
                    title: "Could not add student",
                    description: res.error ?? "Please verify the Student ID and try again.",
                    variant: "destructive",
                  })
                  return
                }
                toast({ title: "Student added", description: "The student was linked and permissions updated." })
                setStudentId("")
                setAllowedMonths([])
                setClassification("center")
                router.refresh()
              })
            }
          >
            {isPending ? "Adding..." : "Add Student"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
