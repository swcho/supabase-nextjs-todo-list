import { describe, expect, it } from "vitest";
import {
  inviteTeamMember,
  getTeamInvitations,
  deleteTeamInvitation,
  acceptTeamInvitation,
  deleteUserInvitations,
  getMyInvitations,
} from "./invitation";
import { TEST_USER_01, TEST_USER_02 } from "@/test/fixtures";
import { createTeam, deleteTeam, getTeams } from "./team";
import { loginGuard } from "@/test/node-test-utils";
import { getInvitationStatus } from "../types";

describe.sequential("invitation", () => {
  it("cleanup invitations", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const _resp = await deleteUserInvitations(user.id);
      const teams = await getTeams();
      await Promise.all(teams.map((team) => deleteTeam(team.id!)));
      // console.log({ _resp });
    });
  });

  it("Team invitations", async () => {
    // Create team and send invitation
    let teamId: number;
    let invitationToken: string;

    await loginGuard(TEST_USER_01, async ({ user }) => {
      // Create a team as user 1
      const team = await createTeam("Invitation Test Team", 'invitation-test-team');
      teamId = team.id!;

      // Invite user 2 to the team
      invitationToken = await inviteTeamMember(teamId, TEST_USER_02.email);
      expect(invitationToken).toBeTruthy();

      // Get invitations and check if it exists
      const invitations = await getTeamInvitations(teamId);
      expect(invitations.length).toBeGreaterThan(0);

      // Verify invitation properties
      const invitation = invitations[0];
      expect(invitation.email).toBe(TEST_USER_02.email);
      expect(getInvitationStatus(invitation)).toBe("pending");

      // console.log("Created invitation:", invitation);
    });

    // Accept invitation as the second user
    await loginGuard(TEST_USER_02, async ({ user }) => {
      // Get the token from the invitation
      const myInvitations = await getMyInvitations();
      expect(myInvitations.length).toBe(1);
      const [firstInvitation] = myInvitations;

      const token = firstInvitation.token!;
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
      const invitation = invitations.find((inv) => inv.token === invitationToken)!;
      expect(invitation).toBeTruthy();
      expect(getInvitationStatus(invitation)).toBe("accepted");

      // Clean up - delete the team
      await deleteTeam(teamId);
    });
  });

  it("Invitation deletion", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      // Create a team
      const team = await createTeam("Deletion Test Team", 'deletion-test-team');
      const teamId = team.id!;

      // Create an invitation
      const invitationToken = await inviteTeamMember(
        teamId,
        "test_delete@example.com"
      );
      expect(invitationToken).toBeTruthy();

      // Verify invitation exists
      let invitations = await getTeamInvitations(teamId);
      const target = invitations.find((inv) => inv.token === invitationToken);
      expect(target).toBeTruthy();
      if (!target) throw new Error("Invitation not found");

      // Delete the invitation
      const deleted = await deleteTeamInvitation(target.id);
      expect(deleted).toBe(true);

      // Verify invitation is gone
      invitations = await getTeamInvitations(teamId);
      expect(invitations.some((inv) => inv.token === invitationToken)).toBe(false);

      // Clean up
      await deleteTeam(teamId);
    });
  });
});
