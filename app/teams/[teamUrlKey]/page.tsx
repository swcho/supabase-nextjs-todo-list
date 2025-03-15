'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getTeamByUrlKey } from '@/lib/rpc/team';
import { Team } from '@/lib/types';
import { useAppContext } from '@/app/components/AppContext';
import TodoListWrapper from '@/app/components/TodoListWrapper';

export default function TeamPage({ params }: { params: { teamUrlKey: string } }) {
  const { teamUrlKey } = params;
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setActiveTeam } = useAppContext();
  const router = useRouter();

  useEffect(() => {
    async function loadTeam() {
      try {
        setLoading(true);
        const teamData = await getTeamByUrlKey(teamUrlKey);
        
        if (!teamData) {
          setError('Team not found');
          return;
        }
        
        setTeam(teamData);
        // Set this team as the active team in the app context
        setActiveTeam(teamData);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error loading team:', err);
        setError('Error loading team');
      } finally {
        setLoading(false);
      }
    }

    loadTeam();
  }, [teamUrlKey, setActiveTeam]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">Loading team data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center text-destructive">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p>{error}</p>
          <button
            className="mt-4 underline"
            onClick={() => router.push('/')}
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">{team?.name}</h1>
      
      {team && (
        <TodoListWrapper />
      )}
    </div>
  );
}