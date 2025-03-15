-- Add url_key column to teams table
ALTER TABLE teams ADD COLUMN url_key text;

-- Update existing teams with a default url_key based on their id
UPDATE teams SET url_key = 'team-' || id::text;

-- Now add the NOT NULL constraint
ALTER TABLE teams ALTER COLUMN url_key SET NOT NULL;

-- Add UNIQUE constraint
ALTER TABLE teams ADD CONSTRAINT teams_url_key_key UNIQUE (url_key);

-- Update create_team function to accept and use url_key
CREATE OR REPLACE FUNCTION public.create_team(team_name text, team_url_key text)
RETURNS jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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

-- Drop the old function
DROP FUNCTION IF EXISTS public.create_team(text);

-- Grant execute permissions to the new function
GRANT EXECUTE ON FUNCTION public.create_team(text, text) TO authenticated;

-- drop get_user_teams_v2 if it exists
DROP FUNCTION IF EXISTS public.get_user_teams_v2();

-- Update get_user_teams and get_user_teams_v2 to include url_key
CREATE OR REPLACE FUNCTION public.get_user_teams_v2()
RETURNS SETOF jsonb
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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

-- Drop get_user_teams if it exists
DROP FUNCTION IF EXISTS public.get_user_teams();

-- Update get_user_teams to include url_key
CREATE OR REPLACE FUNCTION public.get_user_teams()
RETURNS TABLE (
  id bigint,
  name text,
  created_at timestamptz,
  owner_id uuid,
  url_key text,
  is_owner boolean
) 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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

-- Drop get_team_invitations if it exists
DROP FUNCTION IF EXISTS public.get_team_invitations(bigint);

-- Refactor return type to SETOF jsonb
CREATE OR REPLACE FUNCTION public.get_team_invitations(team_id bigint)
 RETURNS SETOF jsonb
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
$function$;

