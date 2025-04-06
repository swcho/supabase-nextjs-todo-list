"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteTeam } from "@/lib/rpc/team";
import { useAppContext } from "@/app/components/AppContext";
import { useTeamsSuspense } from "@/hooks/database";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InviteUserDialog } from "@/app/components/InviteUserDialog";
import { removeTeamMember } from "@/lib/rpc/invitation";
import { TID_DELETE_TEAM } from "@/test/test-id-list";
import React from "react";
import EllipsisText from "@/app/components/EllipsisText";
import { TeamInvitations } from "@/app/components/TeamInvitations";

function TeamSettingsPage() {
  const { activeTeam, setActiveTeam } = useAppContext();
  const { data: teams = [], refetch } = useTeamsSuspense();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const members = activeTeam?.members || [];
  const router = useRouter();

  const handleRemoveMember = async (userId: string) => {
    if (!activeTeam?.id) return;

    setRemovingUserId(userId);
    try {
      await removeTeamMember(activeTeam.id, userId);
      await refetch();
    } catch (error) {
      console.error("Failed to remove member:", error);
    } finally {
      setRemovingUserId(null);
    }
  };

  const handleDeleteTeam = async () => {
    if (!activeTeam?.id) return;

    const confirmed = confirm(
      "Are you sure you want to delete this team? This action cannot be undone."
    );
    if (!confirmed) return;

    setDeleting(true);
    try {
      await deleteTeam(activeTeam.id);
      await refetch();
      setActiveTeam(null);
    } catch (error) {
      console.error("Failed to delete team:", error);
      setError("Failed to delete the team. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  if (error) {
    console.error("TeamSettingsPage error:", error);
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center text-destructive">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button className="mt-4 underline" onClick={() => router.push("/")}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  console.log("TeamSettingsPage");
  return (
    <>
      <div className="container px-4 py-4 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Team Settings</h1>
          <Button
            data-testid={TID_DELETE_TEAM}
            variant="destructive"
            onClick={handleDeleteTeam}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete Team"}
          </Button>
        </div>


        <div className="grid gap-3 grid-cols-1 md:grid-cols-2">
          {activeTeam?.id && <TeamInvitations teamId={activeTeam.id} />}

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>
                  Manage the members of your team
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="rounded-lg border p-3 w-full"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback>
                            {member.email?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow flex flex-col">
                          <EllipsisText
                            className="font-medium"
                            lines={1}
                            text={member.email || ""}
                          />
                          <div className="flex gap-2 items-center">
                            <Badge variant="outline">{"Member"}</Badge>
                            <p className="text-xs text-muted-foreground">
                              Joined{" "}
                              {new Date(member.joined_at!).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 justify-end sticky bottom-0 bg-background py-3">
            <Button onClick={() => setInviteOpen(true)}>Invite User</Button>
          </div>
        </div>

        <InviteUserDialog
          open={inviteOpen}
          onOpenChange={setInviteOpen}
          onUserInvited={() => refetch()}
        />
      </div>
    </>
  );
}

export default React.memo(TeamSettingsPage);
