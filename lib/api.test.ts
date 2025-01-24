import { describe, expect, it } from "vitest";
import { createTeam, deleteTeam, getTeams } from "./api";
import { supabase } from "./initSupabase";
import { loginGuard, TEST_USER_01 } from "@/test/fixtures";
import exp from "constants";

describe("api", () => {
  it.skip('clean up', async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const teams = await getTeams()
      for (const team of teams) {
        const deletedTeam = await deleteTeam(team.id)
        console.log({ deletedTeam })
      }
      const teamsAfterDeleteAll = await getTeams()
      expect(teamsAfterDeleteAll.length).toEqual(0)
    });
  })
  it.skip("select team_members", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const resp = await supabase.from("team_members").select();
      console.log({ user, resp });
    });
  });
  it('Create and delete', async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      expect((await getTeams()).length).toEqual(0)
      const newTeam = await createTeam(user, 'test team')
      expect((await getTeams()).length).toEqual(1)
      await deleteTeam(newTeam.id)
      expect((await getTeams()).length).toEqual(0)
    });
  })
});
