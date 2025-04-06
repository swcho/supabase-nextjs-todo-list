alter table "public"."team_invitations" add column "declined_at" timestamp with time zone;

create or replace view "public"."user_invitations" as  SELECT ti.id,
    ti.team_id,
    t.name AS team_name,
    ti.email,
    ti.created_at,
    ti.expires_at,
    ti.token,
    ti.accepted_at,
    ti.declined_at
   FROM (team_invitations ti
     JOIN teams t ON ((ti.team_id = t.id)))
  WHERE (ti.email = (( SELECT auth_users.email
           FROM auth.users auth_users
          WHERE (auth_users.id = auth.uid())))::text);

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.decline_team_invitation(invitation_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  invitation_record team_invitations;
BEGIN
  -- Get the invitation
  SELECT * INTO invitation_record
  FROM team_invitations
  WHERE token = invitation_token
  AND accepted_at IS NULL
  AND now() < expires_at;
  
  IF invitation_record IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;
  
  -- Set declined_at
  UPDATE team_invitations
  SET declined_at = now()
  WHERE id = invitation_record.id;

  RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_team_invitations_v2(team_id bigint)
 RETURNS SETOF team_invitations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is a team admin
  IF NOT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_members.team_id = get_team_invitations_v2.team_id
    AND user_id = auth.uid()
    AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only team admins can view invitations';
  END IF;
  
  RETURN QUERY
  SELECT 
    *
  FROM team_invitations ti
  WHERE ti.team_id = get_team_invitations_v2.team_id
  ORDER BY ti.created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_invitations_v2()
 RETURNS SETOF user_invitations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    *
  FROM user_invitations
  -- WHERE email = (SELECT auth_users.email FROM auth.users auth_users WHERE auth_users.id = auth.uid())
  ORDER BY created_at DESC;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_user_invitations()
 RETURNS TABLE(id uuid, team_id bigint, team_name text, email text, created_at timestamp with time zone, expires_at timestamp with time zone, token text, accepted_at timestamp with time zone, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    ti.accepted_at
  FROM team_invitations ti
  JOIN teams t ON ti.team_id = t.id
  WHERE ti.email = (SELECT auth_users.email FROM auth.users auth_users WHERE auth_users.id = auth.uid())
  ORDER BY ti.created_at DESC;
END;
$function$
;


