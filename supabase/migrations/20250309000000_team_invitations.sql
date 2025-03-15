create table "public"."team_invitations" (
    "id" uuid not null default uuid_generate_v4(),
    "team_id" bigint,
    "email" text not null,
    "token" text not null,
    "created_at" timestamp with time zone default now(),
    "expires_at" timestamp with time zone not null,
    "created_by" uuid,
    "accepted_at" timestamp with time zone
);


alter table "public"."team_invitations" enable row level security;

CREATE UNIQUE INDEX team_email_unique ON public.team_invitations USING btree (team_id, email);

CREATE UNIQUE INDEX team_invitations_pkey ON public.team_invitations USING btree (id);

CREATE UNIQUE INDEX team_invitations_token_key ON public.team_invitations USING btree (token);

alter table "public"."team_invitations" add constraint "team_invitations_pkey" PRIMARY KEY using index "team_invitations_pkey";

alter table "public"."team_invitations" add constraint "team_email_unique" UNIQUE using index "team_email_unique";

alter table "public"."team_invitations" add constraint "team_invitations_created_by_fkey" FOREIGN KEY (created_by) REFERENCES auth.users(id) not valid;

alter table "public"."team_invitations" validate constraint "team_invitations_created_by_fkey";

alter table "public"."team_invitations" add constraint "team_invitations_team_id_fkey" FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE not valid;

alter table "public"."team_invitations" validate constraint "team_invitations_team_id_fkey";

alter table "public"."team_invitations" add constraint "team_invitations_token_key" UNIQUE using index "team_invitations_token_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.accept_team_invitation(invitation_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.create_team_invitation(team_id bigint, invitee_email text, expires_in interval DEFAULT '7 days'::interval)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.delete_team_invitation(invitation_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.delete_user_invitations(user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  DELETE FROM team_invitations
  WHERE created_by = delete_user_invitations.user_id;
  RETURN FOUND;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_team_invitations(team_id bigint)
 RETURNS TABLE(id uuid, email text, created_at timestamp with time zone, expires_at timestamp with time zone, accepted_at timestamp with time zone, status text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
    ti.id,
    ti.email,
    ti.created_at,
    ti.expires_at,
    ti.accepted_at,
    CASE
      WHEN ti.accepted_at IS NOT NULL THEN 'accepted'
      WHEN ti.expires_at < now() THEN 'expired'
      ELSE 'pending'
    END as status
  FROM team_invitations ti
  WHERE ti.team_id = get_team_invitations.team_id
  ORDER BY ti.created_at DESC;
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
$function$
;

grant delete on table "public"."team_invitations" to "anon";

grant insert on table "public"."team_invitations" to "anon";

grant references on table "public"."team_invitations" to "anon";

grant select on table "public"."team_invitations" to "anon";

grant trigger on table "public"."team_invitations" to "anon";

grant truncate on table "public"."team_invitations" to "anon";

grant update on table "public"."team_invitations" to "anon";

grant delete on table "public"."team_invitations" to "authenticated";

grant insert on table "public"."team_invitations" to "authenticated";

grant references on table "public"."team_invitations" to "authenticated";

grant select on table "public"."team_invitations" to "authenticated";

grant trigger on table "public"."team_invitations" to "authenticated";

grant truncate on table "public"."team_invitations" to "authenticated";

grant update on table "public"."team_invitations" to "authenticated";

grant delete on table "public"."team_invitations" to "service_role";

grant insert on table "public"."team_invitations" to "service_role";

grant references on table "public"."team_invitations" to "service_role";

grant select on table "public"."team_invitations" to "service_role";

grant trigger on table "public"."team_invitations" to "service_role";

grant truncate on table "public"."team_invitations" to "service_role";

grant update on table "public"."team_invitations" to "service_role";

create policy "Team admins can create invitations"
on "public"."team_invitations"
as permissive
for insert
to authenticated
with check ((EXISTS ( SELECT 1
   FROM team_members
  WHERE ((team_members.team_id = team_invitations.team_id) AND (team_members.user_id = auth.uid()) AND (team_members.role = 'admin'::text)))));


create policy "Team admins can view invitations"
on "public"."team_invitations"
as permissive
for select
to authenticated
using ((EXISTS ( SELECT 1
   FROM team_members
  WHERE ((team_members.team_id = team_invitations.team_id) AND (team_members.user_id = auth.uid()) AND (team_members.role = 'admin'::text)))));


create policy "Users can view their own invitations"
on "public"."team_invitations"
as permissive
for select
to authenticated
using (((email = (( SELECT users.email
   FROM auth.users
  WHERE (users.id = auth.uid())))::text) AND (accepted_at IS NULL)));




