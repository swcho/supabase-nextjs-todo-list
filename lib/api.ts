import { User } from "@supabase/supabase-js";
import { supabase } from "./initSupabase";

export async function getTeams() {
  const { data, error } = await supabase.from("teams").select(`
      *,
      team_members (
        user_id,
        role
      )
    `);

  if (error) throw error;
  return data;
}

export async function createTeam(user: User, name: string) {
  // console.log('createTeam', { user, name })
  const { data, error } = await supabase
    .from("teams")
    .insert({
      name,
      owner_id: user.id,
    })
    .select(`*`)
    .single();

  // console.log('createTeam.inserted', { data, error })
  if (error) throw error;

  const { error: memberError } = await supabase.from("team_members").insert({
    team_id: data.id,
    user_id: user.id,
    role: "admin",
  });

  if (memberError) throw memberError;

  return data;
}

export async function deleteTeam(teamId: number) {
  // console.log('deleteTeam', { teamId })
  const { data: dataMembers, error: errMembers } = await supabase
    .from("team_members")
    .delete()
    .match({ team_id: teamId }).select();
  // console.log('deleteTeam.team_members', { dataMembers, errMembers})
  if (errMembers) throw errMembers;
  const { data, error: errTeams } = await supabase
    .from("teams")
    .delete()
    .match({ id: teamId }).select();
  // console.log('deleteTeam.teams', { errTeams })
  if (errTeams) throw errTeams;
  // console.log("deleteTeam", { data });
  return data;
}

export async function addTeamMember(teamId: number, email: string) {
  // First get user by email
  // const { data: users, error: userError } = await supabase
  //   .from('users')
  //   .select('id')
  //   .eq('email', email)
  //   .single()
  // if (userError) throw userError
  // if (!users) throw new Error('User not found')
  // const { error } = await supabase
  //   .from('team_members')
  //   .insert({
  //     team_id: teamId,
  //     user_id: users.id,
  //     role: 'member'
  //   })
  // if (error) throw error
}

export async function removeTeamMember(teamId: number, userId: string) {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .match({ team_id: teamId, user_id: userId });

  if (error) throw error;
}

export async function getTeamTodos(teamId: number) {
  const { data, error } = await supabase
    .from("todos")
    .select(
      `
      *,
      user:user_id (
        email
      )
    `
    )
    .eq("team_id", teamId)
    .order("inserted_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function createTeamTodo(teamId: number, task: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const { data, error } = await supabase
    .from("todos")
    .insert({
      task,
      team_id: teamId,
      user_id: user.id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
