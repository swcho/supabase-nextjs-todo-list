import * as React from 'react';
import { useAppContext } from './AppContext';
import TodoList from './TodoList';
import { useSessionContext } from '@supabase/auth-helpers-react';

export type Props = {
}

function TodoListWrapper(props: Props) {
  const {
  } = props;
  
  const { session } = useSessionContext();
  const { activeTeam } = useAppContext();
  
  if (!session || !activeTeam) {
    return (
      <>Please select team</>
    )
  }

  return (
    <TodoList session={session} activeTeam={activeTeam} />
  );
}

export default React.memo(TodoListWrapper)
