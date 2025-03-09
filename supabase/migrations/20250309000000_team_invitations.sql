-- Create team invitations table
CREATE TABLE public.team_invitations (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id bigint REFERENCES public.teams(id) ON DELETE CASCADE,
  email text NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  expires_at timestamptz NOT NULL,
  created_by uuid REFERENCES auth.users(id),
  accepted_at timestamptz,
  
  CONSTRAINT team_email_unique UNIQUE(team_id, email)
);

-- RLS for team_invitations
ALTER TABLE public.team_invitations ENABLE ROW LEVEL SECURITY;

-- Only team admins can create invitations
CREATE POLICY "Team admins can create invitations" ON public.team_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = team_invitations.team_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Team admins can read invitations for their teams
CREATE POLICY "Team admins can view invitations" ON public.team_invitations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM team_members
      WHERE team_id = team_invitations.team_id
      AND user_id = auth.uid()
      AND role = 'admin'
    )
  );

-- Any authenticated user can read invitations sent to their email
CREATE POLICY "Users can view their own invitations" ON public.team_invitations
  FOR SELECT
  TO authenticated
  USING (
    email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND
    accepted_at IS NULL
  );

-- Function to create an invitation
CREATE OR REPLACE FUNCTION public.create_team_invitation(
  team_id bigint,
  invitee_email text,
  expires_in interval DEFAULT '7 days'::interval
)
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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
  
  RETURN invitation_id;
END;
$$;

-- Function to accept an invitation
CREATE OR REPLACE FUNCTION public.accept_team_invitation(
  invitation_token text
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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
  AND expires_at > now();
  
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

-- Function to list invitations for a team
CREATE OR REPLACE FUNCTION public.get_team_invitations(
  team_id bigint
)
RETURNS TABLE (
  id uuid,
  email text,
  created_at timestamptz,
  expires_at timestamptz,
  accepted_at timestamptz,
  status text
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if user is a team admin
  IF NOT EXISTS (
    SELECT 1 FROM team_members
    WHERE team_id = get_team_invitations.team_id
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
$$;

-- Function to delete an invitation
CREATE OR REPLACE FUNCTION public.delete_team_invitation(
  invitation_id uuid
)
RETURNS boolean
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
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

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_team_invitation(bigint, text, interval) TO authenticated;
GRANT EXECUTE ON FUNCTION public.accept_team_invitation(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_team_invitations(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.delete_team_invitation(uuid) TO authenticated;