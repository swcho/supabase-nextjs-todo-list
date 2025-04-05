

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."member_type" AS (
	"id" "uuid",
	"aud" character varying,
	"email" character varying,
	"joined_at" timestamp without time zone
);


ALTER TYPE "public"."member_type" OWNER TO "postgres";


CREATE TYPE "public"."team_type" AS (
	"id" bigint,
	"name" "text",
	"created_at" timestamp without time zone,
	"members" "public"."member_type"[]
);


ALTER TYPE "public"."team_type" OWNER TO "postgres";


CREATE TYPE "public"."todo_type" AS (
	"id" bigint,
	"team_id" bigint,
	"user_id" "uuid",
	"todo" "text",
	"is_completed" boolean,
	"created_at" timestamp without time zone
);


ALTER TYPE "public"."todo_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."accept_team_invitation"("invitation_token" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  invitation_record team_invitations;
  user_email text;
BEGIN
  -- Get user email
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  IF user_email IS NULL THEN
    RAISE EXCEPTION 'User not found';
  END IF;
  
  -- Get the invitation
  SELECT * INTO invitation_record
  FROM team_invitations
  WHERE token = invitation_token
  AND accepted_at IS NULL
  AND now() < expires_at;
  
  IF invitation_record IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Check if invitation is for this user
  IF invitation_record.email != user_email THEN
    RAISE EXCEPTION 'This invitation is not for your email address';
  END IF;
  
  -- Mark invitation as accepted
  UPDATE team_invitations
  SET accepted_at = now()
  WHERE id = invitation_record.id;
  
  -- Add user to team
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (invitation_record.team_id, auth.uid(), 'member')
  ON CONFLICT (team_id, user_id) DO NOTHING;
  
  RETURN true;
END;
$$;


ALTER FUNCTION "public"."accept_team_invitation"("invitation_token" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_team"("team_name" "text", "team_url_key" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_team_id bigint;
  new_team jsonb;
BEGIN
  -- Check if url_key already exists
  IF EXISTS (SELECT 1 FROM teams WHERE url_key = team_url_key) THEN
    RAISE EXCEPTION 'Team URL key already in use.';
  END IF;

  -- Insert new team
  INSERT INTO teams (name, owner_id, url_key)
  VALUES (team_name, auth.uid(), team_url_key)
  RETURNING id INTO new_team_id;
  
  -- Add admin as team member
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (new_team_id, auth.uid(), 'admin');
  
  -- Get the new team with members
  SELECT 
    jsonb_build_object(
      'id', t.id,
      'name', t.name,
      'created_at', t.created_at,
      'url_key', t.url_key,
      'members', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', u.id,
              'email', u.email,
              'aud', u.aud
            )
          )
          FROM auth.users u
          JOIN team_members tm ON u.id = tm.user_id
          WHERE tm.team_id = t.id
        ),
        '[]'::jsonb
      )
    ) INTO new_team
  FROM teams t
  WHERE t.id = new_team_id;
  
  RETURN new_team;
END;
$$;


ALTER FUNCTION "public"."create_team"("team_name" "text", "team_url_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_team_invitation"("team_id" bigint, "invitee_email" "text", "expires_in" interval DEFAULT '7 days'::interval) RETURNS "text"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  invitation_id uuid;
  invitation_token text;
  is_admin boolean;
BEGIN
  -- Check if user is an admin of the team
  SELECT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = create_team_invitation.team_id
    AND user_id = auth.uid()
    AND role = 'admin'
  ) INTO is_admin;
  
  IF NOT is_admin THEN
    RAISE EXCEPTION 'Only team admins can create invitations';
  END IF;
  
  -- Generate a random token
  invitation_token := gen_random_uuid()::text;
  
  -- Create the invitation
  INSERT INTO team_invitations (
    team_id,
    email,
    token,
    expires_at,
    created_by
  )
  VALUES (
    create_team_invitation.team_id,
    invitee_email,
    invitation_token,
    now() + expires_in,
    auth.uid()
  )
  ON CONFLICT ON CONSTRAINT team_email_unique
  DO UPDATE SET
    token = invitation_token,
    expires_at = now() + expires_in,
    created_at = now(),
    created_by = auth.uid(),
    accepted_at = NULL
  RETURNING id INTO invitation_id;
  
  RETURN invitation_token;
END;
$$;


ALTER FUNCTION "public"."create_team_invitation"("team_id" bigint, "invitee_email" "text", "expires_in" interval) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_team_todo"("team_id" bigint, "task" "text") RETURNS "public"."todo_type"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_todo_id bigint;
  result todo_type;
BEGIN
  -- Insert new todo
  INSERT INTO todos (team_id, user_id, task)
  VALUES (team_id, auth.uid(), task)
  RETURNING id INTO new_todo_id;
  
  -- 단일 행을 결과 변수에 저장
  SELECT 
    t.id,
    t.team_id,
    t.user_id,
    t.task,
    t.is_complete,
    t.inserted_at::timestamp
  INTO result
  FROM todos t
  WHERE t.id = new_todo_id;
  
  -- 단일 결과 반환
  RETURN result;
END
$$;


ALTER FUNCTION "public"."create_team_todo"("team_id" bigint, "task" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_team"("team_id" bigint) RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  _team_id ALIAS FOR team_id;
  is_owner boolean;
BEGIN
  SELECT owner_id = auth.uid() INTO is_owner
  FROM teams
  WHERE id = _team_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Team not found.';
    -- RETURN FALSE;
  END IF;

  IF NOT is_owner THEN
    RAISE EXCEPTION 'Only team owner can delete teams.';
    -- RETURN FALSE;
  END IF;
  
  -- Delete all todos
  DELETE FROM todos t
  WHERE t.team_id = _team_id;
  
  -- Delete all team member relations
  DELETE FROM team_members tm
  WHERE tm.team_id = _team_id;
  
  DELETE FROM teams
  WHERE id = _team_id AND owner_id = auth.uid();
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."delete_team"("team_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_team_invitation"("invitation_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  team_id_val bigint;
BEGIN
  -- Get the team_id
  SELECT team_id INTO team_id_val
  FROM team_invitations
  WHERE id = invitation_id;
  
  IF team_id_val IS NULL THEN
    RAISE EXCEPTION 'Invitation not found';
  END IF;
  
  -- Check if user is a team admin
  IF NOT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = team_id_val
    AND user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only team admins can delete invitations';
  END IF;
  
  -- Delete the invitation
  DELETE FROM team_invitations
  WHERE id = invitation_id;
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."delete_team_invitation"("invitation_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_todo"("todo_id" bigint) RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  DELETE FROM todos
  WHERE id = todo_id;
END
$$;


ALTER FUNCTION "public"."delete_todo"("todo_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."delete_user_invitations"("user_id" "uuid") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  DELETE FROM team_invitations
  WHERE created_by = delete_user_invitations.user_id;
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."delete_user_invitations"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_by_url_key"("team_url_key" "text") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  team jsonb;
BEGIN
  SELECT 
    jsonb_build_object(
      'id', t.id,
      'name', t.name,
      'created_at', t.created_at,
      'url_key', t.url_key,
      'members', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', u.id,
              'email', u.email,
              'aud', u.aud,
              'joined_at', tm.created_at
            )
          )
          FROM auth.users u
          JOIN team_members tm ON u.id = tm.user_id
          WHERE tm.team_id = t.id
        ),
        '[]'::jsonb
      )
    ) INTO team
  FROM teams t
  WHERE t.url_key = team_url_key;
  RETURN team;
END;
$$;


ALTER FUNCTION "public"."get_team_by_url_key"("team_url_key" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_invitations"("team_id" bigint) RETURNS SETOF "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Check if user is a team admin
  IF NOT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = get_team_invitations.team_id
    AND user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only team admins can view invitations';
  END IF;
  
  RETURN QUERY
  SELECT 
    jsonb_build_object(
      'id', ti.id,
      'email', ti.email,
      'created_at', ti.created_at,
      'expires_at', ti.expires_at,
      'accepted_at', ti.accepted_at,
      'status', CASE
                 WHEN ti.accepted_at IS NOT NULL THEN 'accepted'
                 WHEN ti.expires_at < now() THEN 'expired'
                 ELSE 'pending'
                END,
      'token', ti.token
    )
  FROM team_invitations ti
  WHERE ti.team_id = get_team_invitations.team_id
  ORDER BY ti.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_team_invitations"("team_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_team_todos"("team_id" bigint) RETURNS SETOF "public"."todo_type"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  p_team_id BIGINT;
BEGIN
  p_team_id := team_id;
  RETURN QUERY
  SELECT 
    t.id,
    t.team_id,
    t.user_id,
    t.task,
    t.is_complete,
    t.inserted_at::timestamp
  FROM todos t
  WHERE t.team_id = p_team_id;
END
$$;


ALTER FUNCTION "public"."get_team_todos"("team_id" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_invitations"() RETURNS TABLE("id" "uuid", "team_id" bigint, "team_name" "text", "email" "text", "created_at" timestamp with time zone, "expires_at" timestamp with time zone, "token" "text", "accepted_at" timestamp with time zone, "status" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ti.id,
    ti.team_id,
    t.name as team_name,
    ti.email,
    ti.created_at,
    ti.expires_at,
    ti.token,
    ti.accepted_at,
    CASE
      WHEN ti.accepted_at IS NOT NULL THEN 'accepted'
      WHEN ti.expires_at < now() THEN 'expired'
      ELSE 'pending'
    END as status
  FROM team_invitations ti
  JOIN teams t ON ti.team_id = t.id
  WHERE ti.email = (SELECT auth_users.email FROM auth.users auth_users WHERE auth_users.id = auth.uid())
  ORDER BY ti.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_invitations"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_teams"() RETURNS TABLE("id" bigint, "name" "text", "created_at" timestamp with time zone, "owner_id" "uuid", "url_key" "text", "is_owner" boolean)
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.created_at,
    t.owner_id,
    t.url_key,
    t.owner_id = auth.uid() as is_owner
  FROM teams t
  INNER JOIN team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_user_teams"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_teams_v2"() RETURNS SETOF "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    jsonb_build_object(
      'id', t.id,
      'name', t.name,
      'created_at', t.created_at,
      'url_key', t.url_key,
      'members', COALESCE(
        (
          SELECT jsonb_agg(
            jsonb_build_object(
              'id', u.id,
              'email', u.email,
              'aud', u.aud,
              'joined_at', tm.created_at
            )
          )
          FROM auth.users u
          JOIN team_members tm ON u.id = tm.user_id
          WHERE tm.team_id = t.id
        ),
        '[]'::jsonb
      )
    )
  FROM teams t
  JOIN team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_user_teams_v2"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_todo_completed"("todo_id" bigint, "is_completed" boolean) RETURNS "public"."todo_type"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  result todo_type;
BEGIN
  -- Update todo
  UPDATE todos
  SET is_complete = is_completed
  WHERE id = todo_id
  RETURNING id, team_id, user_id, task, is_completed, inserted_at::timestamp
  INTO result;
  
  -- 단일 결과 반환
  RETURN result;
END
$$;


ALTER FUNCTION "public"."set_todo_completed"("todo_id" bigint, "is_completed" boolean) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_team"("team_id" bigint, "new_name" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  UPDATE teams
  SET 
    name = new_name
  WHERE id = team_id AND owner_id = auth.uid();
  
  RETURN FOUND;
END;
$$;


ALTER FUNCTION "public"."update_team"("team_id" bigint, "new_name" "text") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."team_invitations" (
    "id" "uuid" DEFAULT "extensions"."uuid_generate_v4"() NOT NULL,
    "team_id" bigint,
    "email" "text" NOT NULL,
    "token" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "expires_at" timestamp with time zone NOT NULL,
    "created_by" "uuid",
    "accepted_at" timestamp with time zone
);


ALTER TABLE "public"."team_invitations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."team_members" (
    "team_id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "team_members_role_check" CHECK (("role" = ANY (ARRAY['admin'::"text", 'member'::"text"])))
);


ALTER TABLE "public"."team_members" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."teams" (
    "id" bigint NOT NULL,
    "name" "text" NOT NULL,
    "owner_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "url_key" "text" NOT NULL,
    CONSTRAINT "teams_name_check" CHECK (("char_length"("name") > 2))
);


ALTER TABLE "public"."teams" OWNER TO "postgres";


ALTER TABLE "public"."teams" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."teams_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."todos" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "task" "text" NOT NULL,
    "is_complete" boolean DEFAULT false NOT NULL,
    "inserted_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "team_id" bigint,
    CONSTRAINT "todos_task_check" CHECK (("char_length"("task") > 1))
);


ALTER TABLE "public"."todos" OWNER TO "postgres";


ALTER TABLE "public"."todos" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."todos_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_email_unique" UNIQUE ("team_id", "email");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_token_key" UNIQUE ("token");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_url_key_key" UNIQUE ("url_key");



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."team_invitations"
    ADD CONSTRAINT "team_invitations_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id");



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



CREATE POLICY "Team admins can create invitations" ON "public"."team_invitations" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."team_members"
  WHERE (("team_members"."team_id" = "team_invitations"."team_id") AND ("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = 'admin'::"text")))));



CREATE POLICY "Team admins can view invitations" ON "public"."team_invitations" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."team_members"
  WHERE (("team_members"."team_id" = "team_invitations"."team_id") AND ("team_members"."user_id" = "auth"."uid"()) AND ("team_members"."role" = 'admin'::"text")))));



CREATE POLICY "Users can view their own invitations" ON "public"."team_invitations" FOR SELECT TO "authenticated" USING ((("email" = (( SELECT "users"."email"
   FROM "auth"."users"
  WHERE ("users"."id" = "auth"."uid"())))::"text") AND ("accepted_at" IS NULL)));



ALTER TABLE "public"."team_invitations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."team_members" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "team_members service_role restricted." ON "public"."team_members" AS RESTRICTIVE TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."teams" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "teams service_role" ON "public"."teams" AS RESTRICTIVE TO "service_role" USING (true) WITH CHECK (true);



ALTER TABLE "public"."todos" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "todos service_role" ON "public"."todos" AS RESTRICTIVE TO "service_role" USING (true) WITH CHECK (true);





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";




















































































































































































GRANT ALL ON FUNCTION "public"."accept_team_invitation"("invitation_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_team_invitation"("invitation_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_team_invitation"("invitation_token" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_team"("team_name" "text", "team_url_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_team"("team_name" "text", "team_url_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_team"("team_name" "text", "team_url_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_team_invitation"("team_id" bigint, "invitee_email" "text", "expires_in" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."create_team_invitation"("team_id" bigint, "invitee_email" "text", "expires_in" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_team_invitation"("team_id" bigint, "invitee_email" "text", "expires_in" interval) TO "service_role";



GRANT ALL ON FUNCTION "public"."create_team_todo"("team_id" bigint, "task" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_team_todo"("team_id" bigint, "task" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_team_todo"("team_id" bigint, "task" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_team"("team_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_team"("team_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_team"("team_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_team_invitation"("invitation_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_team_invitation"("invitation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_team_invitation"("invitation_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_todo"("todo_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_todo"("todo_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_todo"("todo_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_user_invitations"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_invitations"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_invitations"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_by_url_key"("team_url_key" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_by_url_key"("team_url_key" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_by_url_key"("team_url_key" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_invitations"("team_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_invitations"("team_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_invitations"("team_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_todos"("team_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_todos"("team_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_todos"("team_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_invitations"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_invitations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_invitations"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_teams"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_teams"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_teams"() TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_teams_v2"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_teams_v2"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_teams_v2"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_todo_completed"("todo_id" bigint, "is_completed" boolean) TO "anon";
GRANT ALL ON FUNCTION "public"."set_todo_completed"("todo_id" bigint, "is_completed" boolean) TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_todo_completed"("todo_id" bigint, "is_completed" boolean) TO "service_role";



GRANT ALL ON FUNCTION "public"."update_team"("team_id" bigint, "new_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."update_team"("team_id" bigint, "new_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_team"("team_id" bigint, "new_name" "text") TO "service_role";


















GRANT ALL ON TABLE "public"."team_invitations" TO "anon";
GRANT ALL ON TABLE "public"."team_invitations" TO "authenticated";
GRANT ALL ON TABLE "public"."team_invitations" TO "service_role";



GRANT ALL ON TABLE "public"."team_members" TO "anon";
GRANT ALL ON TABLE "public"."team_members" TO "authenticated";
GRANT ALL ON TABLE "public"."team_members" TO "service_role";



GRANT ALL ON TABLE "public"."teams" TO "anon";
GRANT ALL ON TABLE "public"."teams" TO "authenticated";
GRANT ALL ON TABLE "public"."teams" TO "service_role";



GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."teams_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."todos" TO "anon";
GRANT ALL ON TABLE "public"."todos" TO "authenticated";
GRANT ALL ON TABLE "public"."todos" TO "service_role";



GRANT ALL ON SEQUENCE "public"."todos_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."todos_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."todos_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
