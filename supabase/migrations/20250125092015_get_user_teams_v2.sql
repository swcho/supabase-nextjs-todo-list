CREATE TYPE member_type AS (
   id uuid,
   aud varchar,
   email varchar,
   joined_at timestamp
);

CREATE TYPE team_type AS (
   id bigint,
   name text,
   created_at timestamp,
   members member_type[]
);

-- Get user's teams
CREATE OR REPLACE FUNCTION public.get_user_teams_v2()
RETURNS SETOF team_type
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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
