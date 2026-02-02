"use client"

import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, Trophy, Zap } from "lucide-react"
import { motion } from "framer-motion"

interface XPProgressCardProps {
    xp: number
    level: number
    percentage: number
    nextLevelXP: number
    streakCount?: number
    rank?: number
}

const getLevelName = (level: number) => {
    if (level >= 50) return "أسطى اللغة"
    if (level >= 30) return "نابغة الهلال"
    if (level >= 20) return "خبير تعليمي"
    if (level >= 10) return "طالب متميز"
    if (level >= 5) return "طالب مجتهد"
    return "مبتدئ طموح"
}

export function XPProgressCard({ xp, level, percentage, nextLevelXP, streakCount = 0, rank }: XPProgressCardProps) {
    const levelName = getLevelName(level)

    return (
        <Card className="overflow-hidden border-none shadow-lg bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white">
            <CardContent className="p-6 relative">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Trophy className="h-24 w-24" />
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="space-y-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                                <span className="text-xl font-black">{level}</span>
                            </div>
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-white/70">المستوى الحالي</p>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-black">{levelName}</h2>
                                    <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <p className="text-sm font-bold flex items-center gap-1">
                                    <Zap className="h-4 w-4 fill-current text-yellow-300" />
                                    {xp} <span className="text-white/70 font-normal">إجمالي النقاط</span>
                                </p>
                                <p className="text-xs font-medium text-white/70">
                                    {Math.round(nextLevelXP - xp)} XP للمستوى {level + 1}
                                </p>
                            </div>
                            <div className="relative h-3 w-full bg-black/20 rounded-full overflow-hidden border border-white/10">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 1, ease: "easeOut" }}
                                    className="h-full bg-gradient-to-r from-yellow-300 to-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <Badge className="bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm px-3 py-1">
                            🔥 {streakCount} يوم متواصل
                        </Badge>
                        {rank && (
                            <Badge className="bg-white/20 hover:bg-white/30 border-none text-white backdrop-blur-sm px-3 py-1">
                                🏆 المركز #{rank}
                            </Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
