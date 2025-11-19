"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { updatePackage, VideoPackage } from "@/server/package-actions"
import { useToast } from "@/hooks/use-toast"

export function EditPackageForm({ pkg, onFinished }: { pkg: VideoPackage, onFinished?: () => void }) {
  const [name, setName] = useState(pkg.name)
  const [description, setDescription] = useState(pkg.description ?? "")
  const [price, setPrice] = useState((pkg.price / 100).toString())
  const [thumbnailUrl, setThumbnailUrl] = useState(pkg.thumbnail_url ?? "")
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()
  const router = useRouter()

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const priceInCents = Math.round(parseFloat(price) * 100)
        if (isNaN(priceInCents) || priceInCents < 0) {
          toast({ title: "Invalid Price", description: "Please enter a valid price.", variant: "destructive" })
          return
        }

        startTransition(async () => {
          const res = await updatePackage(pkg.id, { name, description, price: priceInCents, thumbnailUrl })
          if (res?.ok) {
            toast({ title: "Package Updated", description: `The package "${name}" has been successfully updated.` })
            router.refresh()
            onFinished?.()
          } else {
            toast({ title: "Error", description: res?.error ?? "Failed to update package.", variant: "destructive" })
          }
        })
      }}
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="pkg-name">Package Name</Label>
        <Input id="pkg-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Algebra Basics" required />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pkg-desc">Description</Label>
        <Textarea
          id="pkg-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="A brief summary of what this package includes."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
            <Label htmlFor="pkg-price">Price (in EGP)</Label>
            <Input
            id="pkg-price"
            type="number"
            step="0.01"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="e.g., 25.00"
            required
            />
        </div>
        <div className="space-y-2">
            <Label htmlFor="pkg-thumb">Thumbnail URL</Label>
            <Input
            id="pkg-thumb"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://example.com/image.png"
            />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onFinished} disabled={isPending}>Cancel</Button>
        <Button disabled={isPending} type="submit">
          {isPending ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  )
}
