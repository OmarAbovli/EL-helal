import { NextResponse } from 'next/server'
import { sql } from '@/server/db'
import { randomUUID } from 'crypto'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const claim = String(body.claim ?? '').trim()
    if (!claim) return NextResponse.json({ ok: false, error: 'missing_claim' }, { status: 400 })

    const rows = (await sql`SELECT id, customer_name, customer_phone, months, status FROM purchases WHERE claim_token = ${claim} LIMIT 1`) as any[]
    const p = rows[0]
    if (!p) return NextResponse.json({ ok: false, error: 'not_found' }, { status: 404 })
    if (p.status !== 'paid') return NextResponse.json({ ok: false, error: 'not_paid' }, { status: 400 })

    // create student user (temporary, without username/password)
    const userId = 's_' + randomUUID()
    await sql`
      INSERT INTO users (id, role, name, phone, created_at)
      VALUES (${userId}, 'student', ${p.customer_name}, ${p.customer_phone}, NOW())
    `

    // create session
    const sessionId = 'sess_' + randomUUID()
    await sql`
      INSERT INTO sessions (id, user_id, expires_at, created_at)
      VALUES (${sessionId}, ${userId}, NOW() + INTERVAL '30 days', NOW())
    `

    // mark purchase as completed and link user_id if desired
    await sql`
      UPDATE purchases SET status = 'paid', paid_at = NOW(), user_id = ${userId}
      WHERE claim_token = ${claim}
    `

    const res = NextResponse.json({ ok: true, redirect: '/student/complete-registration' })
    res.cookies.set('session_id', sessionId, { httpOnly: true, sameSite: 'lax', path: '/' })
    return res
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 })
  }
}
