import { describe, expect, it } from "vitest";
import {
  createTeam,
  deleteTeam,
  getTeams,
  getTeamsV2,
} from "./team";
import { supabase } from "../initSupabase";
import { TEST_USER_01, TEST_USER_02 } from "@/test/fixtures";
import { loginGuard } from "@/test/node-test-utils";

describe.sequential("team", () => {

  it("clean up", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const teams = await getTeams();
      for (const team of teams) {
        const deletedTeam = await deleteTeam(team.id);
        // console.log({ deletedTeam });
      }
      const teamsAfterDeleteAll = await getTeams();
      expect(teamsAfterDeleteAll.length).toEqual(0);
    });
    await loginGuard(TEST_USER_02, async ({ user }) => {
      const teams = await getTeams();
      for (const team of teams) {
        const deletedTeam = await deleteTeam(team.id);
        // console.log({ deletedTeam });
      }
      const teamsAfterDeleteAll = await getTeams();
      expect(teamsAfterDeleteAll.length).toEqual(0);
    });
  });

  it("select team_members", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const _resp = await supabase.from("team_members").select();
      // console.log({ user, _resp });
    });
  });

  it("Create and delete", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      expect((await getTeams()).length).toEqual(0);
      const newTeam = await createTeam("test team", 'test-team');
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
      await createTeam("test team #1", 'test-team-1');
      expect((await getTeams()).length).toEqual(1);
    });
    // read team_members
    await loginGuard(TEST_USER_01, async ({ user }) => {
      await createTeam("test team #2", 'test-team-2');
      const resp = await supabase.from("team_members").select();
      // console.log({ user, resp });
      const teams = await getTeamsV2();
      expect(teams.length).toEqual(1);
      expect(teams[0].members?.length).toEqual(1);
      // console.log({ user, teams });
    });
  });
});
