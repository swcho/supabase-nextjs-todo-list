import { useSupabaseClient } from "@/lib/initSupabase";
import { Database } from "@/lib/schema";
import { useSession } from "@supabase/auth-helpers-react";
import { useSuspenseQuery } from "@tanstack/react-query";

export declare namespace useForTeamTodoPage {
  export type Return = ReturnType<typeof useForTeamTodoPage>
  export type ReturnData = Return['data']
}

export function useForTeamTodoPage(id: string) {
  const supabase = useSupabaseClient();
  const session = useSession();
  if (!session) {
    throw new Error("Access denied");
  }
  return useSuspenseQuery({
    queryKey: ["useForTeamTodoPage", id],
    queryFn: async () => {
      const { user } = session;
      const { data: team } = await supabase
        .from("teams")
        .select(`
          *,
          team_members:team_members!team_id (
            user_id,
            role
          )
        `)
        .eq("id", id)
        .single();

      const { data: todos } = await supabase
        .from("todos")
        .select(`
          *,
          user:user_id (
            email
          )
        `)
        .eq("team_id", id)
        .order("inserted_at", { ascending: false });
      return {
        user,
        team,
        todos,
      };
    },
  });
}

export declare namespace useTeams {
  export type Return = ReturnType<typeof useTeams>
  export type ReturnData = Return['data']
  export type TeamWithMembers = Database['public']['Tables']['teams']['Row'] & {
    team_members: Database['public']['Tables']['team_members']['Row'][]
  };
  // export type Team = NonNullable<NonNullable<ReturnData>[0]>
}

export function useTeams() {
  const supabase = useSupabaseClient();
  return useSuspenseQuery({
    queryKey: ["useTeams" ],
    queryFn: async () => {
      const { data: teams } = await supabase
        .from("teams")
        .select(`
          *,
          team_members (
            *
          )
        `).returns<useTeams.TeamWithMembers[]>()
      return teams;
    },
  });
}