

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


CREATE OR REPLACE FUNCTION "public"."create_team"("team_name" "text") RETURNS "public"."team_type"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  new_team_id bigint;
  result team_type;  -- 결과를 저장할 변수 선언
BEGIN
  -- Insert new team
  INSERT INTO teams (name, owner_id)
  VALUES (team_name, auth.uid())
  RETURNING id INTO new_team_id;
  
  -- Add admin as team member
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (new_team_id, auth.uid(), 'admin');
  
  -- 단일 행을 결과 변수에 저장
  SELECT 
    t.id,
    t.name,
    t.created_at::timestamp,
    ARRAY(
      SELECT ROW(
        u.id,
        u.aud,
        u.email,
        tm.created_at::timestamp
      )::member_type
      FROM team_members tm
      JOIN auth.users u ON u.id = tm.user_id
      WHERE tm.team_id = t.id
    )
  INTO result  -- INTO 구문을 사용하여 결과 저장
  FROM teams t
  WHERE t.id = new_team_id;
  
  -- 단일 결과 반환
  RETURN result;
END;
$$;


ALTER FUNCTION "public"."create_team"("team_name" "text") OWNER TO "postgres";


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


CREATE OR REPLACE FUNCTION "public"."get_user_teams"() RETURNS TABLE("id" bigint, "name" "text", "created_at" timestamp with time zone, "owner_id" "uuid", "is_owner" boolean)
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
    t.owner_id = auth.uid() as is_owner
  FROM teams t
  INNER JOIN team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = auth.uid();
END;
$$;


ALTER FUNCTION "public"."get_user_teams"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_teams_v2"() RETURNS SETOF "public"."team_type"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.name,
    t.created_at::timestamp,
    ARRAY(
      SELECT ROW(
        u.id,
        u.aud,
        u.email,
        tm.created_at::timestamp
      )::member_type
      FROM team_members tm
      JOIN auth.users u ON u.id = tm.user_id
      WHERE tm.team_id = t.id)
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
    CONSTRAINT "todos_task_check" CHECK (("char_length"("task") > 3))
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



ALTER TABLE ONLY "public"."team_members"
    ADD CONSTRAINT "team_members_pkey" PRIMARY KEY ("team_id", "user_id");



ALTER TABLE ONLY "public"."teams"
    ADD CONSTRAINT "teams_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."todos"
    ADD CONSTRAINT "todos_pkey" PRIMARY KEY ("id");



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




















































































































































































GRANT ALL ON FUNCTION "public"."create_team"("team_name" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_team"("team_name" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_team"("team_name" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."create_team_todo"("team_id" bigint, "task" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."create_team_todo"("team_id" bigint, "task" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_team_todo"("team_id" bigint, "task" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_team"("team_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_team"("team_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_team"("team_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."delete_todo"("todo_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."delete_todo"("todo_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_todo"("todo_id" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_team_todos"("team_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_todos"("team_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_todos"("team_id" bigint) TO "service_role";



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
