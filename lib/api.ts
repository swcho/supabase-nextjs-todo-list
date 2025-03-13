import { User } from "@supabase/supabase-js";
import { supabase } from "./initSupabase";
import { Database } from "./schema";

type StrictRequired<T> = {
  [K in keyof T]-?: NonNullable<T[K]>;
};

export type Team = Database["public"]["CompositeTypes"]["team_type"];
export type Todo = StrictRequired<Database["public"]["CompositeTypes"]["todo_type"]>;
export type TeamInvitation = Database['public']['Functions']['get_team_invitations']['Returns'][0];

export async function getTeams() {
  const { data, error } = await supabase.rpc("get_user_teams");
  if (error) throw error;
  return data;
}

export async function getTeamsV2() {
  // const explain = await supabase
  //   .rpc('get_user_teams_v2').explain();
  // console.log({ explain });
  const { data, error } = await supabase.rpc("get_user_teams_v2");
  if (error) throw error;
  return data;
}

export async function createTeam(name: string) {
  const { data, error } = await supabase.rpc("create_team", {
    team_name: name,
  });
  if (error) throw error;
  return data;
}

export async function deleteTeam(teamId: number) {
  const { data, error } = await supabase.rpc("delete_team", {
    team_id: teamId,
  });
  if (error) throw error;
  return data;
}

export async function inviteTeamMember(teamId: number, email: string) {
  const { data, error } = await supabase.rpc("create_team_invitation", {
    team_id: teamId,
    invitee_email: email,
  });
  
  if (error) throw error;
  return data;
}

export async function getMyInvitations() {
  const { data, error } = await supabase.rpc("get_user_invitations")
  if (error) throw error;
  return data;
}

export async function removeTeamMember(teamId: number, userId: string) {
  const { error } = await supabase
    .from("team_members")
    .delete()
    .match({ team_id: teamId, user_id: userId });

  if (error) throw error;
}

export async function getTeamInvitations(teamId: number): Promise<TeamInvitation[]> {
  const { data, error } = await supabase.rpc("get_team_invitations", {
    team_id: teamId,
  });
  
  if (error) throw error;
  return data;
}

export async function deleteTeamInvitation(invitationId: string) {
  const { data, error } = await supabase.rpc("delete_team_invitation", {
    invitation_id: invitationId,
  });
  
  if (error) throw error;
  return data;
}

export async function acceptTeamInvitation(token: string) {
  const { data, error } = await supabase.rpc("accept_team_invitation", {
    invitation_token: token,
  });
  
  if (error) throw error;
  return data;
}

export async function deleteUserInvitations(user_id: string) {
  const { data, error } = await supabase.rpc("delete_user_invitations", {
    user_id
  });
  if (error) throw error;
  return data;
}

export async function createTeamTodo(teamId: number, task: string) {
  const { data, error } = await supabase.rpc("create_team_todo", {
    team_id: teamId,
    task,
  });
  if (error) {
    throw error;
  }
  return data as any as Todo;
}

export async function getTeamTodos(team_id: number) {
  const { data, error } = await supabase.rpc("get_team_todos", { team_id });
  if (error) {
    throw error;
  }
  return data as any as Todo[];
}

export async function setTodoComplete(todo_id: number, is_completed: boolean) {
  const { data, error } = await supabase.rpc("set_todo_completed", {
    todo_id,
    is_completed,
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function deleteTodo(todoId: number) {
  const { error, data } = await supabase.rpc("delete_todo", {
    todo_id: todoId,
  });
  if (error) {
    throw error;
  }
  return data;
}
