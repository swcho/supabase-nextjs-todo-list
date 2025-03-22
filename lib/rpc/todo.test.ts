import { describe, expect, it } from "vitest";
import {
  createTeamTodo,
  deleteTodo,
  getTeamTodos,
  setTodoComplete,
} from "./todo";
import { TEST_USER_01, TEST_USER_02 } from "@/test/fixtures";
import { createTeam, deleteTeam, getTeams } from "./team";
import { loginGuard } from "@/test/node-test-utils";

describe.sequential("api", () => {

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
  it("Create todo", async () => {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const team = await createTeam("test team #1", 'test-team-1');
      // console.log({ team });
      const team_id = team.id!;
      const todo = await createTeamTodo(team_id, "test todo");
      // console.log({ todo });
      const todo_id = todo.id;
      const todos = await getTeamTodos(team_id);
      expect(todos.length).toBe(1);
      const todo_completed = await setTodoComplete(todo_id, true);
      // console.log({ todo_completed });
      expect(todo_completed.is_completed).toBe(true);
      const todosAfterCompleted = await getTeamTodos(team_id);
      expect(todosAfterCompleted[0].is_completed).toBe(true);
      await deleteTodo(todo_id);
      const todosAfterDeleted = await getTeamTodos(team_id);
      expect(todosAfterDeleted.length).toBe(0);
    });
  });
});
