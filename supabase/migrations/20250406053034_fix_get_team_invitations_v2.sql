set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_team_invitations_v2(team_id bigint)
 RETURNS SETOF team_invitations
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Check if user is a team admin
  -- IF NOT EXISTS (
  --   SELECT 1 FROM team_members
  --   WHERE team_members.team_id = get_team_invitations_v2.team_id
  --   AND user_id = auth.uid()
  --   AND role = 'admin'
  -- ) THEN
  --   RAISE EXCEPTION 'Only team admins can view invitations';
  -- END IF;
  
  RETURN QUERY
  SELECT 
    *
  FROM team_invitations ti
  WHERE ti.team_id = get_team_invitations_v2.team_id
  ORDER BY ti.created_at DESC;
END;
$function$
;


