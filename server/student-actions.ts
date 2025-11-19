"use server"

import { sql } from "@/server/db"

export async function subscribeToTeacher(studentId: string, teacherId: string, plan: "basic" | "standard" | "premium") {
  try {
    const id = "sub_" + crypto.randomUUID()
    await sql`
      INSERT INTO teacher_subscriptions (id, student_id, teacher_id, status)
      VALUES (${id}, ${studentId}, ${teacherId}, 'active');
    `
    return { ok: true as const, id }
  } catch (e: any) {
    return { ok: false as const, error: e?.message ?? "DB error" }
  }
}
