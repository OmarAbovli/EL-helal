"use client"

import {
    ControlBar,
    GridLayout,
    LiveKitRoom,
    ParticipantTile,
    RoomAudioRenderer,
    useTracks,
} from "@livekit/components-react"
import { Track } from "livekit-client" // Keep this for type imports if needed, but the main UI is from @livekit/components-react
import "@livekit/components-styles"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export function VideoRoom({ userId, userName }: { userId?: string, userName?: string }) {
    const router = useRouter()
    const params = useSearchParams()
    const roomName = params.get("room")
    const role = params.get("role") // 'host' or undefined (guest)

    // State for token
    const [token, setToken] = useState("")
    const [error, setError] = useState("")

    // Analytics state (for local tracking)
    // In a real app, each client tracks their own stats and sends pings, 
    // but for simplicity, the Host can rely on LiveKit events for *everyone* or we just track local.
    // Better approach: User tracks themselves and reports on disconnect.

    useEffect(() => {
        (async () => {
            try {
                // Use provided name or fallback
                const pName = userName || (role ? "Teacher" : "Student-" + Math.floor(Math.random() * 1000));

                const resp = await fetch(
                    `/api/livekit/token?room=${roomName || 'default-room'}&participantName=${pName}&role=${role || 'guest'}`
                );
                const data = await resp.json();
                if (!resp.ok || data.error) {
                    throw new Error(data.error || "Failed to fetch token");
                }
                setToken(data.token);
            } catch (e: any) {
                console.error(e);
                setError(e.message || "Unknown error occurred");
            }
        })();
    }, [roomName, role, userName]);

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white gap-4">
                <h2 className="text-xl font-bold text-red-500">Connection Failed</h2>
                <p className="text-slate-400">{error}</p>
                <p className="text-sm text-slate-500 max-w-md text-center">
                    If you just added keys to .env, please <strong>restart your terminal</strong> (npm run dev).
                </p>
            </div>
        )
    }

    if (token === "") {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-950 text-white">
                <div className="animate-pulse">Loading LiveKit Room...</div>
            </div>
        )
    }

    return (
        <LiveKitRoom
            video={role === 'host'}
            audio={true}
            token={token}
            serverUrl={process.env.NEXT_PUBLIC_LIVEKIT_URL}
            data-lk-theme="default"
            style={{ height: "100vh" }}
            onDisconnected={() => window.close()}
        >
            <VideoConferenceWithTools
                role={role}
                roomName={roomName || ""}
                userId={userId || ""}
            />
            <RoomAudioRenderer />
        </LiveKitRoom>
    )
}

import {
    useParticipants,
    useRoomContext,
    ParticipantLoop,
    ParticipantName,
    TrackReferenceOrPlaceholder,
    ConnectionStateToast,
} from "@livekit/components-react"
import { muteParticipant, removeParticipant, endRoom, getCallReport, saveCallStats } from "@/server/livekit-actions"

function VideoConferenceWithTools({ role, roomName, userId }: { role: string | null, roomName: string, userId: string }) {
    const [showWhiteboard, setShowWhiteboard] = useState(false)
    const [reportData, setReportData] = useState<any>(null)
    const [isEnding, setIsEnding] = useState(false)

    const tracks = useTracks(
        [
            { source: Track.Source.Camera, withPlaceholder: true },
            { source: Track.Source.ScreenShare, withPlaceholder: false },
        ],
        { onlySubscribed: false },
    )
    const room = useRoomContext()

    // Local tracking of speaking time (Active Speaking detection)
    useEffect(() => {
        if (!userId) return;

        const interval = setInterval(async () => {
            // Ideally we check if *local* participant is speaking
            // But LiveKit 'isSpeaking' is event based. 
            // Simplification: We will rely on server-side tracking if we had it, 
            // but here we can just ping the server "I am alive/present" every minute which counts as attendance duration.
            // For "Speaking Duration", we need to listen to ActiveSpeaker events.
            // Let's implement a basic "I'm still here" ping for mic duration or similar if needed.
            // For now, we will skip complex client-side timers to avoid performance issues, 
            // and focus on the "End Meeting" report which pulls existing DB data.
        }, 10000);

        return () => clearInterval(interval);
    }, [userId]);

    async function handleEndMeeting() {
        if (!confirm("End meeting and view report?")) return;
        setIsEnding(true);

        // 1. End the room properly
        await endRoom(roomName);

        // 2. Fetch the report
        const res = await getCallReport(roomName);
        if (res.success) {
            setReportData(res.data);
        } else {
            alert("Failed to generate report");
        }
        setIsEnding(false);
    }

    if (reportData) {
        return (
            <div className="flex flex-col h-full bg-slate-900 text-white p-8 overflow-y-auto">
                <div className="max-w-4xl mx-auto w-full space-y-6">
                    <h1 className="text-3xl font-bold text-emerald-400">📊 Session Report</h1>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <h3 className="text-slate-400 text-sm uppercase">Total Attendance</h3>
                            <p className="text-4xl font-mono">{reportData.participants.length}</p>
                        </div>
                        <div className="bg-slate-800 p-4 rounded-lg">
                            <h3 className="text-slate-400 text-sm uppercase">Absent Students</h3>
                            <p className="text-4xl font-mono text-red-400">{reportData.absentStudents.length}</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-semibold">✅ Present Students</h3>
                        <div className="bg-slate-800 rounded-lg overflow-hidden">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-700">
                                    <tr>
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Joined At</th>
                                        <th className="p-3">Spoke For</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-700">
                                    {reportData.participants.map((p: any) => (
                                        <tr key={p.id} className="hover:bg-slate-700/50">
                                            <td className="p-3 flex items-center gap-2">
                                                {p.avatar_url && <img src={p.avatar_url} className="w-6 h-6 rounded-full" />}
                                                {p.name}
                                                {p.role === 'teacher' && <span className="bg-indigo-500 text-xs px-1 rounded ml-2">Teacher</span>}
                                            </td>
                                            <td className="p-3 text-slate-300">{new Date(p.joined_at).toLocaleTimeString()}</td>
                                            <td className="p-3 font-mono">{p.speaking_duration_seconds || 0}s</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {reportData.absentStudents.length > 0 && (
                        <div className="space-y-2">
                            <h3 className="text-xl font-semibold text-red-300">❌ Absent Students</h3>
                            <div className="bg-slate-800/50 rounded-lg p-4 grid grid-cols-2 md:grid-cols-3 gap-2">
                                {reportData.absentStudents.map((s: any) => (
                                    <div key={s.id} className="flex items-center gap-2 text-slate-400 text-sm">
                                        <div className="w-2 h-2 rounded-full bg-red-500"></div>
                                        {s.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <button
                        onClick={() => window.close()}
                        className="w-full bg-slate-700 hover:bg-slate-600 py-4 rounded-lg font-bold mt-8"
                    >
                        Close Report
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative h-full w-full flex flex-col">
            <div className="flex-1 flex overflow-hidden">
                {showWhiteboard ? (
                    <div className="flex-1 bg-white relative">
                        <iframe
                            src="https://www.tldraw.com/r/el-helal-whiteboard"
                            className="w-full h-full border-0"
                            title="Whiteboard"
                        />
                        <button
                            onClick={() => setShowWhiteboard(false)}
                            className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
                        >
                            Close Whiteboard
                        </button>
                    </div>
                ) : (
                    <GridLayout tracks={tracks}>
                        <ParticipantTile />
                    </GridLayout>
                )}

                {role === 'host' && (
                    <div className="w-80 bg-slate-900 border-l border-slate-700 flex flex-col">
                        <div className="p-4 border-b border-slate-700 font-bold text-white">Teacher Controls</div>

                        <div className="p-4 space-y-2">
                            <button
                                onClick={() => setShowWhiteboard(true)}
                                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 flex items-center justify-center gap-2"
                            >
                                <span>✏️</span> Open Whiteboard
                            </button>

                            <button
                                onClick={handleEndMeeting}
                                disabled={isEnding}
                                className="w-full bg-red-600 text-white py-2 rounded hover:bg-red-700 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <span>{isEnding ? "Generating..." : "⛔ End Meeting & Report"}</span>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            <div className="text-xs text-slate-400 uppercase font-semibold mb-2 px-2">Participants</div>
                            <ParticipantList role={role} roomName={roomName} />
                        </div>
                    </div>
                )}
            </div>

            <ControlBar />
        </div>
    )
}

function ParticipantList({ role, roomName }: { role: string | null, roomName: string }) {
    const participants = useParticipants()

    return (
        <div className="space-y-1">
            {participants.map(p => (
                <div key={p.identity} className="flex items-center justify-between bg-slate-800 p-2 rounded">
                    <div className="flex items-center gap-2 overflow-hidden">
                        <span className="text-sm text-white truncate max-w-[120px]">
                            {p.identity} {p.isLocal && "(You)"}
                        </span>
                    </div>

                    {!p.isLocal && role === 'host' && (
                        <div className="flex gap-1">
                            <button
                                onClick={async () => {
                                    // Mute all tracks for this user
                                    p.audioTrackPublications.forEach(async (t) => {
                                        if (t.trackSid) await muteParticipant(roomName, p.identity, t.trackSid, true)
                                    })
                                }}
                                className="text-xs bg-slate-700 text-slate-300 px-2 py-1 rounded hover:bg-slate-600"
                                title="Mute Audio"
                            >
                                🎤🚫
                            </button>
                            <button
                                onClick={async () => {
                                    if (confirm(`Kick ${p.identity}?`)) {
                                        await removeParticipant(roomName, p.identity)
                                    }
                                }}
                                className="text-xs bg-red-900/50 text-red-300 px-2 py-1 rounded hover:bg-red-900"
                                title="Kick"
                            >
                                ❌
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    )
}
