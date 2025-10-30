"use client"

import type React from "react"
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarHeader, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem, 
  SidebarRail 
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { Gauge, Grid2X2, Radio, Upload, Users, QrCode, Settings, PencilRuler, Mail } from "lucide-react"

const items = [
  { title: "لوحة التحكم", href: "/teacher", icon: Gauge },
  { title: "الرسائل", href: "/teacher/messages", icon: Mail },
  { title: "بث مباشر", href: "/teacher#live", icon: Radio },
  { title: "رفع فيديو", href: "/teacher#upload", icon: Upload },
  { title: "فيديوهاتي", href: "/teacher#my-videos", icon: Grid2X2 },
  { title: "الطلاب", href: "/teacher/students", icon: Users },
  { title: "صلاحيات الوصول", href: "/teacher#access", icon: Grid2X2 },
  { title: "تسجيل الدخول بـ QR", href: "/teacher#qr", icon: QrCode },
  { title: "الإعدادات", href: "/teacher#settings", icon: Settings },
  { title: "الاختبارات", href: "/teacher/quizzes", icon: PencilRuler },
]

interface TeacherAppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  unreadCount?: number
}

export function TeacherAppSidebar({ unreadCount = 0, ...props }: TeacherAppSidebarProps) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="px-2 py-1.5 text-sm font-semibold flex items-center gap-2">
          <span>Teacher Studio</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.href} className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </div>
                      {item.title === "الرسائل" && unreadCount > 0 && (
                        <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs">{unreadCount}</Badge>
                      )}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
