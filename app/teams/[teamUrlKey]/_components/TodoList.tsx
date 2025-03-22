import { useSupabaseClient } from "@/lib/initSupabase";
import { Database } from "@/lib/schema";
import { Session } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/app/components/AppContext";
import { createTeamTodo, deleteTodo, getTeamTodos, setTodoComplete, Todo } from "@/lib/rpc/todo";
import { Team } from "@/lib/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TodoItem from "./TodoItem";

export default function TodoList({ session, activeTeam }: { session: Session; activeTeam: Team }) {
  const [newTaskText, setNewTaskText] = useState("");
  const [errorText, setErrorText] = useState("");

  const user = session.user;

  const { data, refetch } = useQuery({
    queryKey: ["todos", user.id],
    queryFn: async () => {
      return getTeamTodos(activeTeam.id!);
    },
  });

  return (
    <div className="w-full">
      <h1 className="mb-3">Todo List</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await createTeamTodo(activeTeam.id!, newTaskText.trim());
          setNewTaskText('')
          await refetch();
        }}
        className="flex gap-2 my-2"
      >
        <Input
          className="rounded w-full p-2"
          type="text"
          placeholder="make coffee"
          value={newTaskText}
          onChange={(e) => {
            setErrorText("");
            setNewTaskText(e.target.value);
          }}
        />
        <Button disabled={0 === newTaskText.length} className="btn-black" type="submit">
          Add
        </Button>
      </form>
      {!!errorText && <Alert text={errorText} />}
      <div className="bg-white shadow overflow-hidden rounded-md">
        <ul>
          {data?.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={async (completed) => {
                await setTodoComplete(todo.id, completed);
                await refetch();
              }}
              onDelete={async () => {
                await deleteTodo(todo.id);
                await refetch();
              }}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

const Alert = ({ text }: { text: string }) => (
  <div className="rounded-md bg-red-100 p-4 my-3">
    <div className="text-sm leading-5 text-red-700">{text}</div>
  </div>
);
