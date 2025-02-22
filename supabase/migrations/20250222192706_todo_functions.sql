
create type "public"."todo_type" as ("id" bigint, "team_id" bigint, "user_id" uuid, "todo" text, "is_completed" boolean, "created_at" timestamp without time zone);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.create_team_todo(team_id bigint, task text)
 RETURNS todo_type
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.delete_todo(todo_id bigint)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM todos
  WHERE id = todo_id;
END
$function$
;

CREATE OR REPLACE FUNCTION public.get_team_todos(team_id bigint)
 RETURNS SETOF todo_type
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.set_todo_completed(todo_id bigint, is_completed boolean)
 RETURNS todo_type
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

-- drop function create_team
DROP FUNCTION IF EXISTS public.create_team(text);

CREATE OR REPLACE FUNCTION public.create_team(team_name text)
 RETURNS team_type
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.delete_team(team_id bigint)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;


