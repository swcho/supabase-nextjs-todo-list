DROP POLICY "Team members can view other members." ON team_members;

CREATE POLICY "Team members can view other members." ON team_members FOR
SELECT
  USING (
    EXISTS (
      SELECT
        1
      FROM
        team_members
      WHERE
        team_members.team_id = team_id
        AND team_members.user_id = auth.uid()
    )
  );
