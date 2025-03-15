import { describe, expect, it } from "vitest";
import {
  inviteTeamMember,
  getTeamInvitations,
  deleteTeamInvitation,
  acceptTeamInvitation,
  deleteUserInvitations,
  getMyInvitations,
} from "./invitation";
import { loginGuard, TEST_USER_01, TEST_USER_02 } from "@/test/fixtures";
import { createTeam, deleteTeam, getTeams } from "./team";

describe.sequential("invitation", () => {
  it("cleanup invitations", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const _resp = await deleteUserInvitations(user.id);
      // console.log({ _resp });
    });
  });

  it("Team invitations", async () => {
    // Create team and send invitation
    let teamId: number;
    let invitationId: string;

    await loginGuard(TEST_USER_01, async ({ user }) => {
      // Create a team as user 1
      const team = await createTeam("Invitation Test Team");
      teamId = team.id!;

      // Invite user 2 to the team
      invitationId = await inviteTeamMember(teamId, TEST_USER_02.email);
      expect(invitationId).toBeTruthy();

      // Get invitations and check if it exists
      const invitations = await getTeamInvitations(teamId);
      expect(invitations.length).toBeGreaterThan(0);

      // Verify invitation properties
      const invitation = invitations[0];
      expect(invitation.email).toBe(TEST_USER_02.email);
      expect(invitation.status).toBe("pending");

      // console.log("Created invitation:", invitation);
    });

    // Accept invitation as the second user
    await loginGuard(TEST_USER_02, async ({ user }) => {
      // Get the token from the invitation
      const myInvitations = await getMyInvitations();
      expect(myInvitations.length).toBe(1);
      const [firstInvitation] = myInvitations;

      const token = firstInvitation.token;
      expect(token).toBeTruthy();

      // Accept the invitation
      const accepted = await acceptTeamInvitation(token);
      expect(accepted).toBe(true);

      // Verify user is now part of the team
      const teams = await getTeams();
      const joinedTeam = teams.find((team) => team.id === teamId);
      expect(joinedTeam).toBeTruthy();
    });

    // Verify invitation status after acceptance
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const invitations = await getTeamInvitations(teamId);
      const invitation = invitations.find((inv) => inv.id === invitationId);
      expect(invitation).toBeTruthy();
      expect(invitation?.status).toBe("accepted");

      // Clean up - delete the team
      await deleteTeam(teamId);
    });
  });

  it("Invitation deletion", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      // Create a team
      const team = await createTeam("Deletion Test Team");
      const teamId = team.id!;

      // Create an invitation
      const invitationId = await inviteTeamMember(
        teamId,
        "test_delete@example.com"
      );
      expect(invitationId).toBeTruthy();

      // Verify invitation exists
      let invitations = await getTeamInvitations(teamId);
      expect(invitations.some((inv) => inv.id === invitationId)).toBe(true);

      // Delete the invitation
      const deleted = await deleteTeamInvitation(invitationId);
      expect(deleted).toBe(true);

      // Verify invitation is gone
      invitations = await getTeamInvitations(teamId);
      expect(invitations.some((inv) => inv.id === invitationId)).toBe(false);

      // Clean up
      await deleteTeam(teamId);
    });
  });
});
