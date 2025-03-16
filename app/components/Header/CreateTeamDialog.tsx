"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { TEST_ID_TEAM_NAME, TEST_ID_TEAM_URL_KEY, TEST_ID_TEAM_SUBMIT } from "@/test/test-id-list"

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTeam: (team: { name: string; urlKey: string; description: string; image: string }) => void
}

const SAMPLE_AVATARS = [
  "https://ui-avatars.com/api/?background=random&name=T1",
  "https://ui-avatars.com/api/?background=random&name=T2",
  "https://ui-avatars.com/api/?background=random&name=T3",
  "https://ui-avatars.com/api/?background=random&name=T4",
]

export function CreateTeamDialog({ open, onOpenChange, onCreateTeam }: CreateTeamDialogProps) {
  const [name, setName] = useState("")
  const [urlKey, setUrlKey] = useState("")
  const [description, setDescription] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(SAMPLE_AVATARS[0])
  const [error, setError] = useState("")
  const [urlKeyError, setUrlKeyError] = useState("")

  // Generate URL key from name
  const handleNameChange = (value: string) => {
    setName(value)
    setError("")
    // Auto-generate URL key if it's empty
    if (!urlKey) {
      const generatedUrlKey = value.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with dash
        .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
      setUrlKey(generatedUrlKey)
      setUrlKeyError("")
    }
  }

  const handleUrlKeyChange = (value: string) => {
    // Only allow lowercase letters, numbers, and dashes
    const sanitizedValue = value.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setUrlKey(sanitizedValue)
    setUrlKeyError("")
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let hasError = false

    if (!name.trim()) {
      setError("Team name is required")
      hasError = true
    }

    if (!urlKey.trim()) {
      setUrlKeyError("URL key is required")
      hasError = true
    }

    if (hasError) return

    onCreateTeam({
      name: name.trim(),
      urlKey: urlKey.trim(),
      description: description.trim(),
      image: selectedAvatar,
    })

    // Reset form
    setName("")
    setUrlKey("")
    setDescription("")
    setSelectedAvatar(SAMPLE_AVATARS[0])
    setError("")
    setUrlKeyError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create team</DialogTitle>
          <DialogDescription>Add a new team to collaborate with others.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Team name</Label>
              <Input
                id={TEST_ID_TEAM_NAME}
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter team name"
              />
              {error && <span className="text-sm text-destructive">{error}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="urlKey">URL key</Label>
              <Input
                id={TEST_ID_TEAM_URL_KEY}
                value={urlKey}
                onChange={(e) => handleUrlKeyChange(e.target.value)}
                placeholder="team-url-key"
                className="lowercase"
              />
              <span className="text-xs text-muted-foreground">
                Will be used in URL: /teams/{urlKey || 'your-team-key'}
              </span>
              {urlKeyError && <span className="text-sm text-destructive">{urlKeyError}</span>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What's this team about?"
              />
            </div>
            <div className="grid gap-2">
              <Label>Team avatar</Label>
              <div className="flex gap-2">
                {SAMPLE_AVATARS.map((avatar) => (
                  <button
                    key={avatar}
                    type="button"
                    onClick={() => setSelectedAvatar(avatar)}
                    className={cn(
                      "rounded-full overflow-hidden border-2",
                      selectedAvatar === avatar ? "border-primary" : "border-transparent",
                    )}
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={avatar} />
                      <AvatarFallback>T</AvatarFallback>
                    </Avatar>
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button id={TEST_ID_TEAM_SUBMIT} type="submit">Create team</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

