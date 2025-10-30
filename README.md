# Edu Courses Platform (MVP)

- Next.js App Router, Server Actions for secure mutations [^1]
- Video via external embeds or self-hosted with Vercel Blob [^2][^3]
- Roles: admin, teacher, student
- QR-based magic login for students

Setup:
1) Add env vars:
   - DATABASE_URL=postgres://...
   - SESSION_SECRET=... (optional future use)
2) Run SQL scripts in /scripts/sql in order.
3) Deploy on Vercel and configure storage if using Vercel Blob for videos.

Notes:
- Replace demo paths with real auth for teachers/admin.
- Implement payments and plan enforcement for subscriptions as needed.
