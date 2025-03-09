"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAppContext } from "../components/AppContext"
import { useTeams } from "@/hooks/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { UserMinus } from "lucide-react"
import { TeamInvitations } from "../components/TeamInvitations"
import { InviteUserDialog } from "../components/InviteUserDialog"
import { useState } from "react"
import { removeTeamMember } from "@/lib/api"
import { useSession } from "@supabase/auth-helpers-react"

export default function TeamSettingsPage() {
  const router = useRouter()
  const session = useSession();
  const user = session?.user;
  const { activeTeam } = useAppContext()
  const { data: teams = [], refetch } = useTeams()
  const [inviteOpen, setInviteOpen] = useState(false)
  const [removingUserId, setRemovingUserId] = useState<string | null>(null)

  // Redirect if no active team
  useEffect(() => {
    if (!activeTeam) {
      router.push("/")
    }
  }, [activeTeam, router])

  if (!activeTeam) {
    return null
  }

  const currentTeam = teams.find(team => team.id === activeTeam.id)
  const members = currentTeam?.members || []
  // const myRole = members.find(member => member.id === user?.id)?.

  const handleRemoveMember = async (userId: string) => {
    if (!activeTeam?.id) return
    
    setRemovingUserId(userId)
    try {
      await removeTeamMember(activeTeam.id, userId)
      await refetch()
    } catch (error) {
      console.error("Failed to remove member:", error)
    } finally {
      setRemovingUserId(null)
    }
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Team Settings</h1>
        <Button onClick={() => setInviteOpen(true)}>Invite User</Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>Manage the members of your team</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div 
                  key={member.id} 
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>
                        {member.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.email}</p>
                      <div className="flex gap-2 items-center">
                        <Badge variant="outline">
                          {/* {member.id === currentTeam?.owner_id ? "Owner" : "Member"} */}
                          {"Member"}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Only show remove button for non-owners and if current user is owner */}
                  {/* {member.id !== currentTeam?.owner_id && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleRemoveMember(member.id)}
                      disabled={removingUserId === member.id}
                    >
                      <UserMinus className="h-4 w-4" />
                    </Button>
                  )} */}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <TeamInvitations teamId={activeTeam.id!} />
      </div>

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onUserInvited={() => refetch()}
      />
    </div>
  )
}