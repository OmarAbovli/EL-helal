import { getMyStudents } from "@/server/teacher-actions"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { TeacherStudentRow } from "@/components/teacher-student-row"

export default async function TeacherStudentsManager() {
  const students = await getMyStudents()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Students</CardTitle>
        <CardDescription>Credentials, classification, and month-based access per student.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3">
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">No students yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-muted-foreground">
                  <th className="py-2 pr-3">Student</th>
                  <th className="py-2 pr-3">Grade</th>
                  <th className="py-2 pr-3">Credentials & Classification</th>
                  <th className="py-2 pr-3">Access Months</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <TeacherStudentRow key={s.id} student={s as any} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
