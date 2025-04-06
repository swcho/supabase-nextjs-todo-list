import { supabase } from "../initSupabase";
import { Database } from "../schema";
import { TeamInvitation, UserInvitation } from "../types";

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
  return data as UserInvitation[];
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
  return data as any as TeamInvitation[];
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