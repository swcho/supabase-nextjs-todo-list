import { supabase } from "@/lib/initSupabase"
import { SignInWithPasswordCredentials, User, Session } from "@supabase/supabase-js"
import { TEST_USER_01, TEST_USER_02 } from "./fixtures"
import { deleteTeam, getTeams } from "@/lib/rpc/team"

export type LoginGuardFnParams = {
  user: User
  session: Session
}

export type LoginGuardFn = (params: LoginGuardFnParams) => Promise<any>

export async function loginGuard(credentials: SignInWithPasswordCredentials, fn: LoginGuardFn) {
    const { data, error } = await supabase.auth.signInWithPassword(credentials)
    if (error) {
        throw error
    }
    await fn(data)
    await supabase.auth.signOut()
}

export async function cleanUp() {
    await loginGuard(TEST_USER_01, async ({ user }) => {
      const teams = await getTeams();
      for (const team of teams) {
        await deleteTeam(team.id);
      }
      const teamsAfterDeleteAll = await getTeams();
    });
    await loginGuard(TEST_USER_02, async ({ user }) => {
      const teams = await getTeams();
      for (const team of teams) {
        await deleteTeam(team.id);
      }
    });
}