"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteTeamInvitation } from "@/lib/rpc/invitation"
import { format, isAfter } from "date-fns"
import { Mail, Trash, Copy, RefreshCw, Check } from "lucide-react"
import { useState } from "react"
import { useTeamInvitations } from "@/hooks/database"
import { Badge } from "@/components/ui/badge"
import { TeamInvitation } from "@/lib/types"

interface TeamInvitationsProps {
  teamId: number
}

export function TeamInvitations({ teamId }: TeamInvitationsProps) {
  const { data: invitations = [], refetch } = useTeamInvitations(teamId)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refetch()
    setIsRefreshing(false)
  }

  const handleDelete = async (invitationId: string) => {
    setIsDeleting(invitationId)
    try {
      await deleteTeamInvitation(invitationId)
      await refetch()
    } catch (error) {
      console.error("Failed to delete invitation:", error)
    } finally {
      setIsDeleting(null)
    }
  }

  const handleCopyLink = async (invitationId: string) => {
    const inviteLink = `${window.location.origin}/invite?token=${invitationId}`
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(invitationId)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy link:", error)
    }
  }

  const handleEmailInvitation = (invitation: TeamInvitation) => {
    const inviteLink = `${window.location.origin}/invite?token=${invitation.id}`
    window.location.href = `mailto:${invitation.email}?subject=Team Invitation&body=You've been invited to join a team. Click the following link to accept: ${encodeURIComponent(inviteLink)}`
  }

  const isExpired = (expiresAt: string) => {
    return !isAfter(new Date(expiresAt), new Date())
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Pending Invitations</CardTitle>
            <CardDescription>Manage team invitation links</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {invitations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pending invitations</p>
        ) : (
          <div className="space-y-3">
            {invitations.map((invitation) => (
              <div 
                key={invitation.id} 
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{invitation.email}</p>
                    {invitation.accepted_at ? (
                      <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">
                        Accepted
                      </Badge>
                    ) : isExpired(invitation.expires_at) ? (
                      <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">
                        Expired
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">
                        Pending
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {invitation.accepted_at 
                      ? `Accepted on ${format(new Date(invitation.accepted_at), 'MMM d, yyyy')}`
                      : `Expires on ${format(new Date(invitation.expires_at), 'MMM d, yyyy')}`}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    disabled={!!invitation.accepted_at || isExpired(invitation.expires_at)}
                    onClick={() => handleCopyLink(invitation.id)}
                  >
                    {copied === invitation.id ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon"
                    disabled={!!invitation.accepted_at || isExpired(invitation.expires_at)}
                    onClick={() => handleEmailInvitation(invitation)}
                  >
                    <Mail className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => handleDelete(invitation.id)} 
                    disabled={isDeleting === invitation.id}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}