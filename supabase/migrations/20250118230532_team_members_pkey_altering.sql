-- 1. 기존 PK 제약조건 삭제
ALTER TABLE team_members
DROP CONSTRAINT team_members_pkey;

-- 2. id 컬럼 삭제
ALTER TABLE team_members
DROP COLUMN id;

-- 3. team_id와 user_id로 복합 PK 생성
ALTER TABLE team_members
ADD PRIMARY KEY (team_id, user_id);