import { supabase } from "@/lib/initSupabase";
import exp from "constants";
import { test, expect } from "vitest";

test("should not delete incomplete todo", async () => {
  const {
    data: { user },
  } = await supabase.auth.signInWithPassword({
    email: "test_user_01@todo.ex",
    password: "111111",
  });

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
