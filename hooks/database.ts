import { getMyInvitations, getTeamInvitations } from "@/lib/rpc/invitation";
import { useSupabaseClient } from "@/lib/initSupabase";
import { Database } from "@/lib/schema";
import { useSession } from "@supabase/auth-helpers-react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { getTeamsV2 } from "@/lib/rpc/team";
import { makeUseQuery } from "./common";

export declare namespace useForTeamTodoPage {
  export type Return = ReturnType<typeof useForTeamTodoPage>
  export type ReturnData = Return['data']
}

export function useForTeamTodoPage(id: number) {
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

export const [useTeams, useTeamsSuspense] = makeUseQuery(() => {
  return {
    queryKey: ["useTeams"],
    queryFn: async () => {
      return getTeamsV2();
    },
  }
})

export declare namespace useTeamInvitations {
  export type Return = ReturnType<typeof useTeamInvitations>
  export type ReturnData = Return['data']
}

export function useTeamInvitations(teamId: number) {
  return useSuspenseQuery({
    queryKey: ["useTeamInvitations", teamId],
    queryFn: async () => {
      return getTeamInvitations(teamId);
    },
  });
}

export const [useMyInvitations, useMyInvitationsSuspense] = makeUseQuery(() => {
  return {
    queryKey: ["useMyInvitations"],
    queryFn: async () => {
      return getMyInvitations();
    },
  }
})