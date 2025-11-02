"use client"

import { useTransition } from "react"
import { useRouter } from "next/navigation"
import { logout } from "@/server/auth-actions"
import { Button } from "@/components/ui/button"

export function LogoutButton() {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() =>
        startTransition(async () => {
          await logout()
          router.push("/")
        })
      }
      disabled={isPending}
    >
      {isPending ? "Logging out..." : "Logout"}
    </Button>
  )
}
