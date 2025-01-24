-- Delete all RLS policies on team_members
DO $$ 
DECLARE
    _policy record;
BEGIN
    FOR _policy IN (
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'team_members'
    ) LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || _policy.policyname || '" ON team_members';
    END LOOP;
END $$;

-- RLS: user within `team_members` can view other members
CREATE POLICY "Team members can view other members." ON team_members FOR SELECT USING (
  EXISTS (
    SELECT 1
    FROM teams
    WHERE teams.id = team_members.team_id
    AND EXISTS (
      SELECT 1
      FROM team_members tm
      WHERE tm.team_id = teams.id
      AND tm.user_id = auth.uid()
    )
  )
);

-- RLS: user with `team.owner_id` can create `team_members`
CREATE POLICY "Only team owner can create members." ON team_members FOR INSERT WITH CHECK (
  EXISTS (
    SELECT
      1
    FROM
      teams
    WHERE
      teams.id = team_id
      AND teams.owner_id = auth.uid()
  )
);

-- RLS: user with `team.owner_id` can update `team_members`
CREATE POLICY "Only team owner can update members." ON team_members FOR UPDATE USING (
  EXISTS (
    SELECT
      1
    FROM
      teams
    WHERE
      teams.id = team_id
      AND teams.owner_id = auth.uid()
  )
);

-- RLS: user with `team.owner_id` can delete `team_members`
CREATE POLICY "Only team owner can delete members." ON team_members FOR DELETE USING (
  EXISTS (
    SELECT
      1
    FROM
      teams
    WHERE
      teams.id = team_id
      AND teams.owner_id = auth.uid()
  )
);
