-- 기존 정책 삭제
DROP POLICY "Team members can view other members." ON team_members;

-- 새로운 정책 생성
CREATE POLICY "Team members can view other members." ON team_members
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM team_members members 
        WHERE members.team_id = team_members.team_id 
        AND members.user_id = auth.uid()
    )
);