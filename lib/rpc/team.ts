import { supabase } from "../initSupabase";
import { Database } from "../schema";

export type Team = Database["public"]["CompositeTypes"]["team_type"];

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
