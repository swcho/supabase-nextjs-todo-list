import { Button } from "@/components/ui/button";
import { Todo } from "@/lib/rpc/todo";
import { Checkbox } from "@radix-ui/react-checkbox";
import { Check, Settings, Square, Trash2, UserRoundCheck } from "lucide-react";
import * as React from "react";

export type Props = {
  todo: Todo;
  onToggle?: (completed: boolean) => void;
  onDelete?: () => void;
};

function TodoItem(props: Props) {
  const { todo, onToggle, onDelete } = props;

  const { is_completed } = todo;
  return (
    <li className="w-full block cursor-pointer hover:bg-200 focus:outline-none focus:bg-200 transition duration-150 ease-in-out">
      <div className="flex gap-2 items-center px-2 py-2 sm:px-6">
        <Button
          size="icon"
          variant={"ghost"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete?.();
          }}
        >
          <Trash2 />
        </Button>
        <div className="min-w-0 flex-1 flex items-center">
          <div className="leading-5 font-medium truncate">{todo.todo}</div>
        </div>
        <Button
          size="icon"
          variant={"ghost"}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onToggle?.(!is_completed);
          }}
        >
          {is_completed ? <Check className="text-primary" /> : <Square />}
        </Button>
      </div>
    </li>
  );
}

export default React.memo(TodoItem);
