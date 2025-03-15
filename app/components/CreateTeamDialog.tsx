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
import { TEST_ID_TEAM_NAME, TEST_ID_TEAM_SUBMIT } from "@/test/test-id-list"

interface CreateTeamDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateTeam: (team: { name: string; description: string; image: string }) => void
}

const SAMPLE_AVATARS = [
  "https://ui-avatars.com/api/?background=random&name=T1",
  "https://ui-avatars.com/api/?background=random&name=T2",
  "https://ui-avatars.com/api/?background=random&name=T3",
  "https://ui-avatars.com/api/?background=random&name=T4",
]

export function CreateTeamDialog({ open, onOpenChange, onCreateTeam }: CreateTeamDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedAvatar, setSelectedAvatar] = useState(SAMPLE_AVATARS[0])
  const [error, setError] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setError("Team name is required")
      return
    }

    onCreateTeam({
      name: name.trim(),
      description: description.trim(),
      image: selectedAvatar,
    })

    // Reset form
    setName("")
    setDescription("")
    setSelectedAvatar(SAMPLE_AVATARS[0])
    setError("")
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
                onChange={(e) => {
                  setName(e.target.value)
                  setError("")
                }}
                placeholder="Enter team name"
              />
              {error && <span className="text-sm text-destructive">{error}</span>}
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

