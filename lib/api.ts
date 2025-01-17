import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

const supabase = createClientComponentClient&lt;Database&gt;()

export async function createTeam(name: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('teams')
    .insert({
      name,
      owner_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  
  // Add owner as team member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({
      team_id: data.id,
      user_id: user.id,
      role: 'owner'
    })

  if (memberError) throw memberError

  return data
}

export async function getTeams() {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_members (
        user_id,
        role
      )
    `)

  if (error) throw error
  return data
}

export async function addTeamMember(teamId: number, email: string) {
  // First get user by email
  const { data: users, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('email', email)
    .single()

  if (userError) throw userError
  if (!users) throw new Error('User not found')

  const { error } = await supabase
    .from('team_members')
    .insert({
      team_id: teamId,
      user_id: users.id,
      role: 'member'
    })

  if (error) throw error
}

export async function removeTeamMember(teamId: number, userId: string) {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .match({ team_id: teamId, user_id: userId })

  if (error) throw error
}

export async function getTeamTodos(teamId: number) {
  const { data, error } = await supabase
    .from('todos')
    .select(`
      *,
      user:user_id (
        email
      )
    `)
    .eq('team_id', teamId)
    .order('inserted_at', { ascending: false })

  if (error) throw error
  return data
}

export async function createTeamTodo(teamId: number, task: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('todos')
    .insert({
      task,
      team_id: teamId,
      user_id: user.id
    })
    .select()
    .single()

  if (error) throw error
  return data
}