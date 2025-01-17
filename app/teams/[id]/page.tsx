import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from '@/lib/database.types'
import TeamTodosClient from './team-todos-client'
import Link from 'next/link'

export default async function TeamTodosPage({
  params: { id },
}: {
  params: { id: string }
}) {
  const supabase = createServerComponentClient&lt;Database&gt;({ cookies })

  const { data: { user } } = await supabase.auth.getUser()
  
  const { data: team } = await supabase
    .from('teams')
    .select(`
      *,
      team_members (
        user_id,
        role
      )
    `)
    .eq('id', id)
    .single()

  const { data: todos } = await supabase
    .from('todos')
    .select(`
      *,
      user:user_id (
        email
      )
    `)
    .eq('team_id', id)
    .order('inserted_at', { ascending: false })

  if (!team) {
    return <div>Team not found</div>
  }

  // Check if user is a member of the team
  const isMember = team.team_members.some(member => member.user_id === user?.id)
  if (!isMember) {
    return <div>Access denied</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">{team.name} - 할일 목록</h1>
        <Link
          href="/teams"
          className="px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          팀 목록으로
        </Link>
      </div>
      <TeamTodosClient user={user} todos={todos} teamId={parseInt(id)} />
    </div>
  )
}