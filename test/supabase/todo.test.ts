import { createTeam, deleteTeam, getTeams } from "@/lib/api";
import { supabase } from "@/lib/initSupabase";
import { SignInWithPasswordCredentials } from "@supabase/supabase-js";
// import exp from "constants";
import { test, expect } from "vitest";
import failOnConsole from 'vitest-fail-on-console'
failOnConsole()

const TEST_USER_01: SignInWithPasswordCredentials = {
    email: "test_user_01@todo.ex",
    password: "111111",
}
const TEST_USER_02: SignInWithPasswordCredentials = {
    email: "test_user_02@todo.ex",
    password: "111111",
}

test.skip("should not delete incomplete todo", async () => {
  const {
    data: { user },
  } = await supabase.auth.signInWithPassword(TEST_USER_01);

  // console.log({ user });

  const tTodo = supabase.from("todos");

  const { data: todo, error } = await tTodo
    .insert({ task: "Test todo", user_id: user!.id })
    .select()
    .single();

  // console.log({ todo });

  expect(error).toBeNull();

  const deleteBeforeCompleted = await tTodo
    .delete()
    .eq("id", todo!.id)
    .select()
    .single();

  // console.log({ deleteBeforeCompleted });
  expect(deleteBeforeCompleted.error?.details).toBe(
    "The result contains 0 rows"
  );

  await tTodo.update({ is_complete: true }).eq("id", todo!.id);

  const deleteAfterCompleted = await tTodo
    .delete()
    .eq("id", todo!.id)
    .select()
    .single();

  // console.log({ deleteAfterCompleted });
  expect(deleteAfterCompleted.data?.id).toBe(todo!.id);
});

test('get teams', async () => {
  const {
    data: { user },
  } = await supabase.auth.signInWithPassword(TEST_USER_01);
  if (!user) {
    throw new Error('User not found')
  }
  const teams = await getTeams()
  expect(teams.length).toEqual(0)
})

test.skip('clean up test user 01', async () => {
  const {
    data: { user },
  } = await supabase.auth.signInWithPassword(TEST_USER_01);
  if (!user) {
    throw new Error('User not found')
  }
  console.log('user', user)
  const teams = await getTeams()
  for (const team of teams) {
    await deleteTeam(team.id)
  }
})

test.skip('clean up test user 02', async () => {
  const {
    data: { user },
  } = await supabase.auth.signInWithPassword(TEST_USER_02);
  if (!user) {
    throw new Error('User not found')
  }
  const teams = await getTeams()
  for (const team of teams) {
    await deleteTeam(team.id)
  }
})

test.skip('Create team by test user 01', async () => {
  const {
    data: { user },
  } = await supabase.auth.signInWithPassword(TEST_USER_01);
  if (!user) {
    throw new Error('User not found')
  }
  const team = await createTeam(user, 'test team')
  expect(team.name).toBe('test team')
  const teams = await getTeams()
  expect(teams.length).toEqual(1)
})

test.skip('Create team by test user 02', async() => {
  const {
    data: { user },
  } = await supabase.auth.signInWithPassword(TEST_USER_02);
  if (!user) {
    throw new Error('User not found')
  }
  const team = await createTeam(user, 'test team')
  expect(team.name).toBe('test team')
  const teams = await getTeams()
  expect(teams.length).toEqual(1)
})

test.skip('Delete team by test user 01', async() => {
  const {
    data: { user },
  } = await supabase.auth.signInWithPassword(TEST_USER_01);
  if (!user) {
    throw new Error('User not found')
  }
  const teams = await getTeams()
  expect(teams.length).toEqual(1)
  await deleteTeam(teams[0].id)
  const teamsAfterDelete = await getTeams()
  expect(teamsAfterDelete.length).toEqual(0)
})

test.skip('Delete team by test user 02', async() => {
  const {
    data: { user },
  } = await supabase.auth.signInWithPassword(TEST_USER_02);
  if (!user) {
    throw new Error('User not found')
  }
  const teams = await getTeams()
  expect(teams.length).toEqual(1)
  await deleteTeam(teams[0].id)
  const teamsAfterDelete = await getTeams()
  expect(teamsAfterDelete.length).toEqual(0)
})
