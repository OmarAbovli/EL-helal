'use server'

import { sql } from '@/server/db'

// Videos accessible to a student: from subscribed teachers and either free OR month is unlocked.
export async function getAccessibleVideos(userId: string, { category }: { category?: string } = {}) {
  const [user] = (await sql`SELECT id, grade FROM users WHERE id = ${userId} LIMIT 1;`) as any[]
  if (!user) return []

  // Teachers the student is subscribed to (active)
  const teacherRows = (await sql`
    SELECT teacher_id FROM teacher_subscriptions
    WHERE student_id = ${userId} AND status = 'active'
  `) as any[]
  const teacherIds = teacherRows.map((r) => r.teacher_id)
  if (teacherIds.length === 0) return []

  // Allowed months per teacher
  const accessRows = (await sql`
    SELECT teacher_id, allowed_months
    FROM student_month_access
    WHERE student_id = ${userId} AND teacher_id = ANY(${teacherIds});
  `) as any[]

  // Build a map: teacher_id -> allowed_months
  const accessMap = new Map<string, number[]>()
  for (const row of accessRows) {
    accessMap.set(row.teacher_id, row.allowed_months ?? [])
  }

  // Dynamically add a WHERE clause for the category
  const categoryClause = category ? sql`AND category = ${category}` : sql``

  // Fetch videos for subscribed teachers, filtered by grade and optionally category
  const videos = (await sql`
    SELECT id, title, description, url, category, is_free, month, teacher_id, thumbnail_url
    FROM videos
    WHERE teacher_id = ANY(${teacherIds}) AND (${user.grade} = ANY(grades))
    ${categoryClause}
    ORDER BY created_at DESC
  `) as any[]

  // Filter paid videos by allowed months
  const filtered = videos.filter((v) => {
    if (v.is_free) return true
    const allowed = accessMap.get(v.teacher_id) ?? []
    return allowed.includes(v.month)
  })

  return filtered
}

export async function getAccessibleVideoCategories(userId: string) {
  const [user] = (await sql`SELECT id FROM users WHERE id = ${userId} LIMIT 1;`) as any[]
  if (!user) return []

  const teacherRows = (await sql`
    SELECT teacher_id FROM teacher_subscriptions
    WHERE student_id = ${userId} AND status = 'active'
  `) as any[]
  const teacherIds = teacherRows.map((r) => r.teacher_id)
  if (teacherIds.length === 0) return []

  const categoryRows = (await sql`
    SELECT DISTINCT category
    FROM videos
    WHERE teacher_id = ANY(${teacherIds}) AND category IS NOT NULL AND category != ''
    ORDER BY category ASC
  `) as any[]

  return categoryRows.map((r) => r.category)
}

export async function getUpcomingLiveSessions(userId: string) {
  const [user] = (await sql`SELECT id, grade FROM users WHERE id = ${userId} LIMIT 1;`) as any[]
  if (!user) return []

  const teacherRows = (await sql`
    SELECT teacher_id FROM teacher_subscriptions
    WHERE student_id = ${userId} AND status = 'active'
  `) as any[]
  const teacherIds = teacherRows.map((r) => r.teacher_id)
  if (teacherIds.length === 0) return []

  // Get allowed months for the student
  const accessRows = (await sql`
    SELECT teacher_id, allowed_months
    FROM student_month_access
    WHERE student_id = ${userId} AND teacher_id = ANY(${teacherIds});
  `) as any[]
  const accessMap = new Map<string, number[]>()
  for (const row of accessRows) {
    accessMap.set(row.teacher_id, row.allowed_months ?? [])
  }

  // Get all upcoming sessions for the subscribed teachers
  const sessions = (await sql`
    SELECT s.id, s.title, s.start_at, s.embed_url, s.grades, s.month, s.is_free, s.teacher_id, u.name as teacher_name
    FROM live_sessions s
    JOIN users u ON u.id = s.teacher_id
    WHERE s.teacher_id = ANY(${teacherIds}) AND s.start_at > NOW()
    ORDER BY s.start_at ASC
  `) as any[]

  // Filter sessions based on access rights
  const filteredSessions = sessions.filter((session) => {
    if (session.is_free) {
      return true; // Free sessions are always accessible
    }

    // For paid sessions, check access rights
    const hasGradeRestriction = session.grades && session.grades.length > 0;
    if (hasGradeRestriction && !session.grades.includes(user.grade)) {
      return false; // Deny if grade is restricted and user's grade doesn't match
    }

    const hasMonthRestriction = session.month != null;
    const allowedMonths = accessMap.get(session.teacher_id) ?? [];
    if (hasMonthRestriction && !allowedMonths.includes(session.month)) {
      return false; // Deny if month is restricted and user doesn't have access
    }

    return true; // Allow if all checks pass
  });

  return filteredSessions
}

// Live NOW from teachers the student is subscribed to
export async function getActiveLiveStreams(userId: string) {
  const teacherRows = (await sql`
    SELECT teacher_id FROM teacher_subscriptions
    WHERE student_id = ${userId} AND status = 'active'
  `) as any[]
  const teacherIds = teacherRows.map((r) => r.teacher_id)
  if (teacherIds.length === 0) return []

  const rows = (await sql`
    SELECT tls.teacher_id, u.name AS teacher_name, COALESCE(tls.title, 'Live Session') AS title, tls.url
    FROM teacher_live_status tls
    JOIN users u ON u.id = tls.teacher_id
    WHERE tls.is_active = true AND tls.teacher_id = ANY(${teacherIds})
    ORDER BY tls.updated_at DESC;
  `) as any[]

  return rows as { teacher_id: string; teacher_name: string; title: string; url: string | null }[]
}

export async function checkVideoAccess(videoId: string, userId: string): Promise<{ allowed: boolean; reason?: 'not-found' | 'grade-locked' | 'subscription-required' | 'month-locked' }> {
    const [video] = (await sql`SELECT id, teacher_id, is_free, month, grades FROM videos WHERE id = ${videoId} LIMIT 1;`) as any[]
    if (!video) return { allowed: false, reason: 'not-found' }
    if (video.is_free) return { allowed: true }

    const [user] = (await sql`SELECT id, grade FROM users WHERE id = ${userId} LIMIT 1;`) as any[]
    if (!user) return { allowed: false, reason: 'subscription-required' } // or a new reason 'user-not-found'

    // Check grade
    if (video.grades && !video.grades.includes(user.grade)) {
        return { allowed: false, reason: 'grade-locked' }
    }

    const [subscription] = (await sql`
    SELECT 1 FROM teacher_subscriptions
    WHERE student_id = ${userId} AND teacher_id = ${video.teacher_id} AND status = 'active'
    LIMIT 1;
  `) as any[]
    if (!subscription) return { allowed: false, reason: 'subscription-required' }

    const [access] = (await sql`
    SELECT allowed_months FROM student_month_access
    WHERE student_id = ${userId} AND teacher_id = ${video.teacher_id}
    LIMIT 1;
  `) as any[]
    const allowedMonths: number[] = access?.allowed_months ?? []

    if (video.month && !allowedMonths.includes(video.month)) {
        return { allowed: false, reason: 'month-locked' }
    }

    return { allowed: true }
}