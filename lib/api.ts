import { User } from "@supabase/supabase-js";
import { supabase } from "./initSupabase";
import { Database } from "./schema";

export type Team = Database["public"]["CompositeTypes"]["team_type"]

export async function getTeams() {
  const { data, error } = await supabase
    .rpc('get_user_teams');
  if (error) throw error;
  return data;
}

export async function getTeamsV2() {
  // const explain = await supabase
  //   .rpc('get_user_teams_v2').explain();
  // console.log({ explain });
  const { data, error } = await supabase
    .rpc('get_user_teams_v2');
  if (error) throw error;
  return data;
}

export async function createTeam(name: string) {
  const { data, error } = await supabase
    .rpc('create_team', { team_name: name });
  if (error) throw error;
  return data;
}

export async function deleteTeam(teamId: number) {
  const { data, error } = await supabase
    .rpc('delete_team', { team_id: teamId });
  if (error) throw error;
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
