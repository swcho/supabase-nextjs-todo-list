'use client';

import { useRouter } from 'next/navigation';
import { useAppContext } from '@/app/components/AppContext';
import TodoListWrapper from './_components/TodoListWrapper';

export default function TeamPage() {
  const { activeTeam } = useAppContext();
  const router = useRouter();


  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[300px]">
  //       <div className="text-center">Loading team data...</div>
  //     </div>
  //   );
  // }

  // if (error) {
  //   return (
  //     <div className="flex items-center justify-center min-h-[300px]">
  //       <div className="text-center text-destructive">
  //         <h2 className="text-xl font-semibold mb-2">Error</h2>
  //         <p>{error}</p>
  //         <button
  //           className="mt-4 underline"
  //           onClick={() => router.push('/')}
  //         >
  //           Go to Home
  //         </button>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{activeTeam?.name}</h1>
      {activeTeam && (
        <TodoListWrapper />
      )}
    </div>
  );
}