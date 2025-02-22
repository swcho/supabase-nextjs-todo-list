import { useSupabaseClient } from "@/lib/initSupabase";
import { Database } from "@/lib/schema";
import { Session } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/app/components/AppContext";
import {
  createTeamTodo,
  deleteTodo,
  getTeamTodos,
  setTodoComplete,
  Team,
  Todo,
} from "@/lib/api";

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
      <h1 className="mb-12">Todo List.</h1>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await createTeamTodo(activeTeam.id!, newTaskText.trim());
          await refetch();
        }}
        className="flex gap-2 my-2"
      >
        <input
          className="rounded w-full p-2"
          type="text"
          placeholder="make coffee"
          value={newTaskText}
          onChange={(e) => {
            setErrorText("");
            setNewTaskText(e.target.value);
          }}
        />
        <button className="btn-black" type="submit">
          Add
        </button>
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

const TodoItem = ({
  todo,
  onToggle,
  onDelete,
}: {
  todo: Todo;
  onToggle: (completed: boolean) => void;
  onDelete: () => void;
}) => {
  const { is_completed } = todo;
  return (
    <li className="w-full block cursor-pointer hover:bg-200 focus:outline-none focus:bg-200 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="text-sm leading-5 font-medium truncate">
            {todo.todo}
          </div>
        </div>
        <div>
          <input
            className="cursor-pointer"
            onChange={(e) => onToggle(!is_completed)}
            type="checkbox"
            checked={is_completed}
          />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete();
          }}
          className="w-4 h-4 ml-2 border-2 hover:border-black rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="gray"
          >
            <path
              fillRule="evenodd"
              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </li>
  );
};

const Alert = ({ text }: { text: string }) => (
  <div className="rounded-md bg-red-100 p-4 my-3">
    <div className="text-sm leading-5 text-red-700">{text}</div>
  </div>
);
