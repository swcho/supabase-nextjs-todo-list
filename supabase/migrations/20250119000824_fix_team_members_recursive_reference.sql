DROP POLICY "Team members can view other members." ON team_members;

CREATE POLICY "Team members can view other members." ON team_members FOR
SELECT
  USING (
    EXISTS (
      SELECT
        1
      FROM
        team_members as tm
      WHERE
        tm.team_id = team_members.team_id
        AND tm.user_id = auth.uid()
    )
  );
