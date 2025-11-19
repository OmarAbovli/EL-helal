import { NextResponse } from "next/server"
import { sql } from "@/server/db"

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const teacherId = url.searchParams.get("teacherId")
    const gradeParam = url.searchParams.get("grade")
    const grade = gradeParam ? Number(gradeParam) : null

    if (!teacherId || !grade || !Number.isFinite(grade)) {
      return NextResponse.json(
        { error: "missing_teacher_or_grade" },
        { status: 400 },
      )
    }

    const rows = (await sql`
      SELECT id, teacher_id, name, description, price, thumbnail_url, grades
      FROM video_packages
      WHERE teacher_id = ${teacherId}
        AND (
          grades IS NULL
          OR array_length(grades, 1) = 0
          OR ${grade} = ANY(grades)
        )
      ORDER BY created_at ASC;
    `) as any[]

    return NextResponse.json(rows)
  } catch (error) {
    console.error("Failed to fetch packages:", error)
    return NextResponse.json({ error: "failed_to_fetch_packages" }, { status: 500 })
  }
}
