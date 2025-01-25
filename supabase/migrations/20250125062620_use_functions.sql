-- Get user's teams
CREATE OR REPLACE FUNCTION public.get_user_teams()
RETURNS TABLE (
  id bigint,
  name text,
  created_at timestamptz,
  owner_id uuid,
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
    t.owner_id = auth.uid() as is_owner
  FROM teams t
  INNER JOIN team_members tm ON t.id = tm.team_id
  WHERE tm.user_id = auth.uid();
END;
$$;

-- Create team
CREATE OR REPLACE FUNCTION public.create_team(team_name text)
RETURNS bigint
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  new_team_id bigint;
BEGIN
  -- Insert new team
  INSERT INTO teams (name, owner_id)
  VALUES (team_name, auth.uid())
  RETURNING id INTO new_team_id;
  
  -- Add admin as team member
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (new_team_id, auth.uid(), 'admin');
  
  RETURN new_team_id;
END;
$$;

-- Update team
CREATE OR REPLACE FUNCTION public.update_team(team_id bigint, new_name text)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE teams
  SET 
    name = new_name
  WHERE id = team_id AND owner_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Delete team
CREATE OR REPLACE FUNCTION public.delete_team(team_id bigint)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  _team_id ALIAS FOR team_id;
  is_owner boolean;
BEGIN
  SELECT owner_id = auth.uid() INTO is_owner
  FROM teams
  WHERE id = _team_id;
  
  IF NOT FOUND THEN
    -- RAISE EXCEPTION 'Only team owner can delete teams.';
    RETURN FALSE;
  END IF;

  IF NOT is_owner THEN
    -- RAISE EXCEPTION 'Only team owner can delete teams.';
    RETURN FALSE;
  END IF;
  
  DELETE FROM team_members tm
  WHERE tm.team_id = _team_id;
  
  DELETE FROM teams
  WHERE id = _team_id AND owner_id = auth.uid();
  
  RETURN FOUND;
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_user_teams() TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_team(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_team(bigint, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_team(bigint) TO authenticated;
