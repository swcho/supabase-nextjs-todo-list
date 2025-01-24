import { supabase } from "@/lib/initSupabase"
import { SignInWithPasswordCredentials, User, Session } from "@supabase/supabase-js"

export const TEST_USER_01: SignInWithPasswordCredentials = {
    email: "test_user_01@todo.ex",
    password: "111111",
}

export const TEST_USER_02: SignInWithPasswordCredentials = {
    email: "test_user_02@todo.ex",
    password: "111111",
}

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