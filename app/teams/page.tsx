import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import TeamsClient from './teams-client'

export default async function TeamsPage() {
  const supabase = createServerComponentClient&lt;Database&gt;({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  const { data: teams } = await supabase
    .from('teams')
    .select(`
      *,
      team_members (
        user_id,
        role
      )
    `)

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-8">팀 관리</h1>
      <TeamsClient user={user} teams={teams} />
    </div>
  )
}