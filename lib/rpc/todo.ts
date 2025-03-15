import { supabase } from "../initSupabase";
import { Database } from "../schema";

type StrictRequired<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

export type Todo = StrictRequired<Database["public"]["CompositeTypes"]["todo_type"]>;

export async function createTeamTodo(teamId: number, task: string) {
  const { data, error } = await supabase.rpc("create_team_todo", {
    team_id: teamId,
    task,
  });
  if (error) {
    throw error;
  }
  return data as any as Todo;
}

export async function getTeamTodos(team_id: number) {
  const { data, error } = await supabase.rpc("get_team_todos", { team_id });
  if (error) {
    throw error;
  }
  return data as any as Todo[];
}

export async function setTodoComplete(todo_id: number, is_completed: boolean) {
  const { data, error } = await supabase.rpc("set_todo_completed", {
    todo_id,
    is_completed,
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function deleteTodo(todoId: number) {
  const { error, data } = await supabase.rpc("delete_todo", {
    todo_id: todoId,
  });
  if (error) {
    throw error;
  }
  return data;
}

