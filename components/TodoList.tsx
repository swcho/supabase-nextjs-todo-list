import { useSupabaseClient } from "@/lib/initSupabase";
import { Database } from "@/lib/schema";
import { Session } from "@supabase/auth-helpers-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAppContext } from "@/app/components/AppContext";
import { createTeamTodo } from "@/lib/api";

type Todos = Database["public"]["Tables"]["todos"]["Row"];

export default function TodoList({ session }: { session: Session }) {
  const supabase = useSupabaseClient();
  const { activeTeam } = useAppContext();
  const [newTaskText, setNewTaskText] = useState("");
  const [errorText, setErrorText] = useState("");

  const user = session.user;

  const { data, refetch } = useQuery({
    queryKey: ["todos", user.id],
    queryFn: async () => {
      const ret = await supabase
        .from("todos")
        .select("*")
        .order("id", { ascending: true });
      return ret;
    },
  });

  const addTodo = async (taskText: string) => {
    let task = taskText.trim();
    await createTeamTodo(activeTeam!.id!, task);
  };

  const deleteTodo = async (id: number) => {
    try {
      await supabase.from("todos").delete().eq("id", id).throwOnError();
      await refetch();
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <div className="w-full">
      <h1 className="mb-12">Todo List.</h1>
      {activeTeam ? (
        <>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addTodo(newTaskText);
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
              {data?.data?.map((todo) => (
                <Todo
                  key={todo.id}
                  todo={todo}
                  onDelete={() => deleteTodo(todo.id)}
                />
              ))}
            </ul>
          </div>
        </>
      ) : (
        <>Please select team</>
      )}
    </div>
  );
}

const Todo = ({ todo, onDelete }: { todo: Todos; onDelete: () => void }) => {
  const supabase = useSupabaseClient();
  const [isCompleted, setIsCompleted] = useState(todo.is_complete);

  const toggle = async () => {
    try {
      const { data } = await supabase
        .from("todos")
        .update({ is_complete: !isCompleted })
        .eq("id", todo.id)
        .throwOnError()
        .select()
        .single();

      if (data) setIsCompleted(data.is_complete);
    } catch (error) {
      console.log("error", error);
    }
  };

  return (
    <li className="w-full block cursor-pointer hover:bg-200 focus:outline-none focus:bg-200 transition duration-150 ease-in-out">
      <div className="flex items-center px-4 py-4 sm:px-6">
        <div className="min-w-0 flex-1 flex items-center">
          <div className="text-sm leading-5 font-medium truncate">
            {todo.task}
          </div>
        </div>
        <div>
          <input
            className="cursor-pointer"
            onChange={(e) => toggle()}
            type="checkbox"
            checked={isCompleted ? true : false}
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
