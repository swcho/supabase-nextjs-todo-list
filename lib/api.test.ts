import { describe, expect, it } from "vitest";
import {
  createTeam,
  createTeamTodo,
  deleteTeam,
  deleteTodo,
  getTeams,
  getTeamsV2,
  getTeamTodos,
  setTodoComplete,
  inviteTeamMember,
  getTeamInvitations,
  deleteTeamInvitation,
  acceptTeamInvitation,
  deleteUserInvitations,
  getMyInvitations,
} from "./api";
import { supabase } from "./initSupabase";
import { loginGuard, TEST_USER_01, TEST_USER_02 } from "@/test/fixtures";

describe("api", () => {
  it("clean up", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const teams = await getTeams();
      for (const team of teams) {
        const deletedTeam = await deleteTeam(team.id);
        console.log({ deletedTeam });
      }
      const teamsAfterDeleteAll = await getTeams();
      expect(teamsAfterDeleteAll.length).toEqual(0);
    });
    await loginGuard(TEST_USER_02, async ({ user }) => {
      const teams = await getTeams();
      for (const team of teams) {
        const deletedTeam = await deleteTeam(team.id);
        console.log({ deletedTeam });
      }
      const teamsAfterDeleteAll = await getTeams();
      expect(teamsAfterDeleteAll.length).toEqual(0);
    });
  });
  it("select team_members", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const resp = await supabase.from("team_members").select();
      console.log({ user, resp });
    });
  });
  it("Create and delete", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      expect((await getTeams()).length).toEqual(0);
      const newTeam = await createTeam("test team");
      expect((await getTeams()).length).toEqual(1);
      if (newTeam.id) {
        await deleteTeam(newTeam.id);
      }
      expect((await getTeams()).length).toEqual(0);
    });
  });
  it("Verify team_members policies", async () => {
    // create team for TEST_USER_02
    await loginGuard(TEST_USER_02, async ({ user }) => {
      expect((await getTeams()).length).toEqual(0);
      await createTeam("test team #1");
      expect((await getTeams()).length).toEqual(1);
    });
    // read team_members
    await loginGuard(TEST_USER_01, async ({ user }) => {
      await createTeam("test team #1");
      const resp = await supabase.from("team_members").select();
      // console.log({ user, resp });
      const teams = await getTeamsV2();
      expect(teams.length).toEqual(1);
      expect(teams[0].members?.length).toEqual(1);
      // console.log({ user, teams });
    });
  });

  it("Create todo", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const team = await createTeam("test team #1");
      console.log({ team });
      const team_id = team.id!;
      const todo = await createTeamTodo(team_id, "test todo");
      console.log({ todo });
      const todo_id = todo.id!;
      console.log(await getTeamTodos(team_id));
      const todo_completed = await setTodoComplete(todo_id, true);
      console.log({ todo_completed });
      console.log(await getTeamTodos(team_id));
      await deleteTodo(todo_id);
      console.log(await getTeamTodos(team_id));
    });
  });

  describe("Invitations", () => {
    it("cleanup invitations", async () => {
      await loginGuard(TEST_USER_01, async ({ user }) => {
        const resp = await deleteUserInvitations(user.id);
        console.log({ resp });
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

        console.log("Created invitation:", invitation);
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
});
