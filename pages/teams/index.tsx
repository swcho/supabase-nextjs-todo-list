import { useSession } from '@supabase/auth-helpers-react';
import { useTeams } from '@/hooks/database';
import TeamsClient from './teams-client';

export default function TeamsPage() {
  const session = useSession();
  const { data: teams } = useTeams()
  if (!session) {
    return <></>
  }
  const { user } = session
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">팀 관리</h1>
      {teams && (
        <TeamsClient user={user} teams={teams} />
      )}
    </div>
  )
}