"use server"

import { AccessToken } from "livekit-server-sdk"
import { z } from "zod"
import { sql } from "@/server/db"

export async function createLiveKitToken(roomName: string, participantName: string, role: "host" | "guest") {
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) {
        throw new Error("LiveKit keys are missing in .env")
    }

    // Create token
    const at = new AccessToken(apiKey, apiSecret, {
        identity: participantName,
        // Token validity (e.g. 2 hours)
        ttl: 2 * 60 * 60,
    })

    // Permission logic
    at.addGrant({
        roomJoin: true,
        room: roomName,
        canPublish: role === "host", // Only host can publish initially (can be changed via component)
        canSubscribe: true,
        canPublishData: true,
    })

    const token = await at.toJwt()

    return { token, url: wsUrl }
}

// --- Moderation Actions ---

// Mute a participant
export async function muteParticipant(roomName: string, identity: string, trackSid: string, muted: boolean) {
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) throw new Error("Missing keys")

    // Use RoomServiceClient to manage room
    const { RoomServiceClient } = await import("livekit-server-sdk")
    const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret)

    await svc.mutePublishedTrack(roomName, identity, trackSid, muted)
    return { success: true }
}

// Remove a participant
export async function removeParticipant(roomName: string, identity: string) {
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) throw new Error("Missing keys")

    const { RoomServiceClient } = await import("livekit-server-sdk")
    const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret)

    await svc.removeParticipant(roomName, identity)
    return { success: true }
}

// End the room (kick everyone)
export async function endRoom(roomName: string) {
    const apiKey = process.env.LIVEKIT_API_KEY
    const apiSecret = process.env.LIVEKIT_API_SECRET
    const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL

    if (!apiKey || !apiSecret || !wsUrl) throw new Error("Missing keys")

    const { RoomServiceClient } = await import("livekit-server-sdk")
    const svc = new RoomServiceClient(wsUrl, apiKey, apiSecret)

    await svc.deleteRoom(roomName)
    return { success: true }
}

// --- Analytics & Reporting ---

export async function saveCallStats(roomName: string, userId: string, stats: { speakingSeconds: number, micOpenSeconds: number }) {
    // In a real app, look up the call_id by room_name first
    // This assumes we can link room_name to the voice_calls table
    try {
        await sql`
            UPDATE voice_call_participants
            SET 
                speaking_duration_seconds = speaking_duration_seconds + ${stats.speakingSeconds},
                mic_open_duration_seconds = mic_open_duration_seconds + ${stats.micOpenSeconds}
            WHERE 
                user_id = ${userId} 
                AND call_id IN (SELECT id FROM voice_calls WHERE room_name = ${roomName} LIMIT 1)
        `
        return { success: true }
    } catch (e) {
        console.error("Failed to save stats", e)
        return { success: false }
    }
}

export async function getCallReport(roomName: string) {
    try {
        // 1. Get Call Details & Participants
        const call = (await sql`
            SELECT id, grade, started_at, ended_at 
            FROM voice_calls 
            WHERE room_name = ${roomName} 
            LIMIT 1
        `)[0];

        if (!call) throw new Error("Call not found");

        const participants = await sql`
            SELECT 
                u.id, u.name, u.role,
                vcp.joined_at, vcp.left_at,
                vcp.speaking_duration_seconds,
                vcp.mic_open_duration_seconds
            FROM voice_call_participants vcp
            JOIN users u ON u.id = vcp.user_id
            WHERE vcp.call_id = ${call.id}
        `

        // 2. Get All Students in Grade (for Absent list)
        // Assuming students have a 'grade' column and role='student'
        const allStudents = await sql`
            SELECT id, name 
            FROM users 
            WHERE role = 'student' AND grade = ${call.grade}
        `

        // 3. Calculate Absent
        const presentIds = new Set(participants.map((p: any) => p.id));
        const absentStudents = allStudents.filter((s: any) => !presentIds.has(s.id));

        return {
            success: true,
            data: {
                call,
                participants,
                absentStudents
            }
        }

    } catch (e: any) {
        console.error("Get Report Error", e);
        return { success: false, error: e.message }
    }
}
