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
import { Check, Copy, Mail } from "lucide-react"
import { inviteTeamMember } from "@/lib/rpc/invitation"
import { useAppContext } from "./AppContext"

interface InviteUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUserInvited?: () => void
}

export function InviteUserDialog({ open, onOpenChange, onUserInvited }: InviteUserDialogProps) {
  const { activeTeam } = useAppContext()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [invitationSent, setInvitationSent] = useState(false)
  const [invitationToken, setInvitationToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // Reset the form when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setEmail("")
      setError("")
      setInvitationSent(false)
      setInvitationToken(null)
      setCopied(false)
    }
    onOpenChange(isOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setError("Email is required")
      return
    }

    if (!activeTeam?.id) {
      setError("No active team selected")
      return
    }

    try {
      setIsLoading(true)
      console.log("activeTeam.id", activeTeam.id)
      const invitationId = await inviteTeamMember(activeTeam.id, email.trim())
      
      // Generate invitation link
      const inviteToken = `${window.location.origin}/invite?token=${invitationId}`
      setInvitationToken(inviteToken)
      setInvitationSent(true)
      
      if (onUserInvited) {
        onUserInvited()
      }
    } catch (err: any) {
      setError(err.message || "Failed to send invitation")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendAnotherInvite = () => {
    setEmail("")
    setInvitationSent(false)
    setInvitationToken(null)
    setCopied(false)
  }

  const copyToClipboard = async () => {
    if (invitationToken) {
      try {
        await navigator.clipboard.writeText(invitationToken)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error("Failed to copy:", err)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Invite user</DialogTitle>
          <DialogDescription>
            {invitationSent 
              ? "Share this invitation link with the user."
              : "Invite a user to join your team."}
          </DialogDescription>
        </DialogHeader>
        {!invitationSent ? (
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setError("")
                  }}
                  placeholder="user@example.com"
                />
                {error && <span className="text-sm text-destructive">{error}</span>}
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send invitation"}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Invitation link</Label>
              <div className="flex w-full items-center gap-2">
                <Input
                  value={invitationToken || ""}
                  readOnly
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyToClipboard}
                  className="h-10 w-10"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                This link can only be used once and is tied to the email address.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSendAnotherInvite}
              >
                Invite another user
              </Button>
              <Button 
                variant="secondary"
                className="w-full flex items-center gap-2"
                onClick={() => {
                  if (invitationToken) {
                    window.location.href = `mailto:${email}?subject=Team Invitation&body=You've been invited to join a team. Click the following link to accept: ${encodeURIComponent(invitationToken)}`
                  }
                }}
              >
                <Mail className="h-4 w-4" />
                Send via email
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}