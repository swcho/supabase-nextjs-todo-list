'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getTeamByUrlKey } from '@/lib/rpc/team';
import { Team } from '@/lib/types';
import { useAppContext } from "@/app/components/AppContext";
import { useTeams } from "@/hooks/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserMinus } from "lucide-react";
import { TeamInvitations } from "@/app/components/TeamInvitations";
import { InviteUserDialog } from "@/app/components/InviteUserDialog";
import { removeTeamMember } from "@/lib/rpc/invitation";
import { useSession } from "@supabase/auth-helpers-react";

export default function TeamSettingsPage({ params }: { params: { teamUrlKey: string } }) {
  const { teamUrlKey } = params;
  const router = useRouter();
  const session = useSession();
  const user = session?.user;
  const { activeTeam, setActiveTeam } = useAppContext();
  const { data: teams = [], refetch } = useTeams();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [team, setTeam] = useState<Team | null>(null);

  // Load team data from URL key
  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        const teamData = await getTeamByUrlKey(teamUrlKey);
        
        if (!teamData) {
          setError('Team not found');
          return;
        }
        
        setTeam(teamData);
        // Set this team as the active team in the app context
        setActiveTeam(teamData);
      } catch (err) {
        console.error('Error loading team:', err);
        setError('Error loading team');
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [teamUrlKey, setActiveTeam]);

  const currentTeam = teams.find(t => t.id === team?.id);
  const members = currentTeam?.members || [];

  const handleRemoveMember = async (userId: string) => {
    if (!currentTeam?.id) return;
    
    setRemovingUserId(userId);
    try {
      await removeTeamMember(currentTeam.id, userId);
      await refetch();
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setRemovingUserId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">Loading team data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center text-destructive">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button
            className="mt-4 underline"
            onClick={() => router.push('/')}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{team?.name} - Team Settings</h1>
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
                          {"Member"}
                        </Badge>
                        <p className="text-xs text-muted-foreground">
                          Joined {new Date(member.joined_at!).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {currentTeam?.id && <TeamInvitations teamId={currentTeam.id} />}
      </div>

      <InviteUserDialog
        open={inviteOpen}
        onOpenChange={setInviteOpen}
        onUserInvited={() => refetch()}
      />
    </div>
  );
}