"use client"

import { format } from "date-fns"
import { Check, Clock, Mail, X } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { inviteTeamMember, TeamInvitation } from "@/lib/rpc/invitation"

interface InvitationsProps {
  invitations: TeamInvitation[]
  onHandle: (id: string, action: "accept" | "decline") => void
  onInvite: (email: string, role: string) => void
}

export function Invitations({ invitations, onHandle, onInvite }: InvitationsProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await inviteTeamMember(1, email) // Replace 1 with the actual team ID
    // await addTeamMember(1, email, role) // Replace 1 with the actual team ID
    setEmail('')
    setRole('')
  }

  const pendingInvitations = invitations.filter((inv) => inv.status === "pending")
  const historyInvitations = invitations.filter((inv) => inv.status !== "pending")

  // Function to calculate how long ago the invitation was sent
  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays} day${diffInDays > 1 ? "s" : ""} ago`
  }

  // Function to get badge variant based on status
  const getStatusBadge = (status: TeamInvitation["status"]) => {
    switch (status) {
      case "accepted":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        )
      case "declined":
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800">
            Declined
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Expired
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Pending
          </Badge>
        )
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Invite a User</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleInviteSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <input
                type="text"
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
            <Button type="submit" className="w-full">
              Invite
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingInvitations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">No pending invitations</div>
          ) : (
            <ul className="space-y-3">
              {pendingInvitations.map((invitation) => (
                <li key={invitation.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Sent {getTimeAgo(new Date(invitation.created_at))}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* <Badge variant="outline">{invitation.role}</Badge> */}
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => onHandle(invitation.id, "decline")}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-50"
                        onClick={() => onHandle(invitation.id, "accept")}
                      >
                        <Check className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {historyInvitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Invitation History</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {historyInvitations.map((invitation) => (
                <li key={invitation.id} className="flex items-center justify-between p-3 rounded-md border">
                  <div className="flex items-center gap-3">
                    <div className="bg-muted p-2 rounded-full">
                      <Mail className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{invitation.email}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{format(invitation.created_at, "MMM d, yyyy")}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">{getStatusBadge(invitation.status)}</div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

