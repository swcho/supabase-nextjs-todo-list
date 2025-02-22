import { describe, expect, it } from "vitest";
import { createTeam, createTeamTodo, deleteTeam, deleteTodo, getTeams, getTeamsV2, getTeamTodos, setTodoComplete } from "./api";
import { supabase } from "./initSupabase";
import { loginGuard, TEST_USER_01, TEST_USER_02 } from "@/test/fixtures";

describe("api", () => {
  it('clean up', async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const teams = await getTeams()
      for (const team of teams) {
        const deletedTeam = await deleteTeam(team.id)
        console.log({ deletedTeam })
      }
      const teamsAfterDeleteAll = await getTeams()
      expect(teamsAfterDeleteAll.length).toEqual(0)
    });
    await loginGuard(TEST_USER_02, async ({ user }) => {
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
  it.skip('Create and delete', async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      expect((await getTeams()).length).toEqual(0)
      const newTeam = await createTeam('test team')
      expect((await getTeams()).length).toEqual(1)
      if (newTeam.id) {
        await deleteTeam(newTeam.id)
      }
      expect((await getTeams()).length).toEqual(0)
    });
  })
  it.skip('Verify team_members policies', async () => {
    // create team for TEST_USER_02
    await loginGuard(TEST_USER_02, async ({ user }) => {
      expect((await getTeams()).length).toEqual(0)
      await createTeam('test team #1')
      expect((await getTeams()).length).toEqual(1)
    });
    // read team_members
    await loginGuard(TEST_USER_01, async ({ user }) => {
      await createTeam('test team #1')
      const resp = await supabase.from("team_members").select();
      // console.log({ user, resp });
      const teams = await getTeamsV2()
      expect(teams.length).toEqual(1)
      expect(teams[0].members?.length).toEqual(1)
      // console.log({ user, teams });
    });
  })

  it('Create todo', async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const team = await createTeam('test team #1')
      console.log({ team })
      const team_id = team.id!
      const todo = await createTeamTodo(team_id, 'test todo')
      console.log({ todo })
      const todo_id = todo.id!
      console.log(await getTeamTodos(team_id))
      const todo_completed = await setTodoComplete(todo_id, true)
      console.log({ todo_completed })
      console.log(await getTeamTodos(team_id))
      await deleteTodo(todo_id)
      console.log(await getTeamTodos(team_id))
    });
  })
});
