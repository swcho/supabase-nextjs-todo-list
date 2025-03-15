import type { SignInWithPasswordCredentials } from "@supabase/supabase-js"

export const TEST_USER_01 = {
    email: "test_user_01@todo.ex",
    password: "111111",
} satisfies SignInWithPasswordCredentials;

export const TEST_USER_02 = {
    email: "test_user_02@todo.ex",
    password: "111111",
} satisfies SignInWithPasswordCredentials;
