import { supabase } from "../initSupabase";
import { Team } from "../types";

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
  return data as any as Team[];
}

export async function createTeam(name: string, urlKey: string) {
  const { data, error } = await supabase.rpc("create_team", {
    team_name: name,
    team_url_key: urlKey,
  });
  if (error) throw error;
  return data as any as Team;
}

export async function deleteTeam(teamId: number) {
  const { data, error } = await supabase.rpc("delete_team", {
    team_id: teamId,
  });
  if (error) throw error;
  return data;
}

export async function getTeamByUrlKey(urlKey: string): Promise<Team | null> {
  const { data: teams, error } = await supabase
    .from('teams')
    .select('*')
    .eq('url_key', urlKey)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    throw error;
  }
  
  return teams as unknown as Team;
}
