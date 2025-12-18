import { type NextRequest, NextResponse } from "next/server"
import { createLiveKitToken } from "@/server/livekit-actions"
import { getCurrentUser } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET(req: NextRequest) {
    const room = req.nextUrl.searchParams.get("room")
    const participantNameParam = req.nextUrl.searchParams.get("participantName")
    // role param from client is ignored for security

    if (!room) {
        return NextResponse.json({ error: "Missing room" }, { status: 400 })
    }

    try {
        const cookieStore = await cookies()
        const sessionId = cookieStore.get("session_id")?.value
        const user = await getCurrentUser(sessionId)

        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const role = user.role === "teacher" ? "host" : "guest"
        // Use real name, fallback to param if needed (but prefer real name)
        const participantName = user.name || participantNameParam || "Guest"

        const { token } = await createLiveKitToken(room, participantName, role)
        return NextResponse.json({ token })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
