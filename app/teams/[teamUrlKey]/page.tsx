'use client';

import { useAppContext } from '@/app/components/AppContext';
import TodoListWrapper from './_components/TodoListWrapper';

export default function TeamPage() {
  const { activeTeam } = useAppContext();
  return (
    <div className="container mx-auto px-3 py-4">
      {activeTeam && (
        <TodoListWrapper />
      )}
    </div>
  );
}