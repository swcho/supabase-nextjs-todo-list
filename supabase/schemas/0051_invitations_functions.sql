

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

GRANT ALL ON FUNCTION "public"."create_team_invitation"("team_id" bigint, "invitee_email" "text", "expires_in" interval) TO "anon";
GRANT ALL ON FUNCTION "public"."create_team_invitation"("team_id" bigint, "invitee_email" "text", "expires_in" interval) TO "authenticated";
GRANT ALL ON FUNCTION "public"."create_team_invitation"("team_id" bigint, "invitee_email" "text", "expires_in" interval) TO "service_role";


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

GRANT ALL ON FUNCTION "public"."delete_team_invitation"("invitation_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_team_invitation"("invitation_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_team_invitation"("invitation_id" "uuid") TO "service_role";


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


GRANT ALL ON FUNCTION "public"."accept_team_invitation"("invitation_token" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."accept_team_invitation"("invitation_token" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."accept_team_invitation"("invitation_token" "text") TO "service_role";


-- Decline user invitation
CREATE OR REPLACE FUNCTION "public"."decline_team_invitation"("invitation_token" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;

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


GRANT ALL ON FUNCTION "public"."delete_user_invitations"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."delete_user_invitations"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."delete_user_invitations"("user_id" "uuid") TO "service_role";

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
GRANT ALL ON FUNCTION "public"."get_team_invitations"("team_id" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_team_invitations"("team_id" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_team_invitations"("team_id" bigint) TO "service_role";

-- 테이블 타입을 활용한 응답값 사용
CREATE OR REPLACE FUNCTION "public"."get_team_invitations_v2"("team_id" bigint) RETURNS SETOF team_invitations
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
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
$$;


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
    ti.accepted_at
  FROM team_invitations ti
  JOIN teams t ON ti.team_id = t.id
  WHERE ti.email = (SELECT auth_users.email FROM auth.users auth_users WHERE auth_users.id = auth.uid())
  ORDER BY ti.created_at DESC;
END;
$$;


ALTER FUNCTION "public"."get_user_invitations"() OWNER TO "postgres";


GRANT ALL ON FUNCTION "public"."get_user_invitations"() TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_invitations"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_invitations"() TO "service_role";

-- Function for get user invitation from user_invitations view
CREATE OR REPLACE FUNCTION "public"."get_user_invitations_v2"() RETURNS SETOF user_invitations
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    *
  FROM user_invitations
  -- WHERE email = (SELECT auth_users.email FROM auth.users auth_users WHERE auth_users.id = auth.uid())
  ORDER BY created_at DESC;
END;
$$;