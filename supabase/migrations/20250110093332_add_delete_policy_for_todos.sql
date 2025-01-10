-- 기존 정책 삭제
drop policy if exists "Individuals can delete their own todos." on todos;

-- 새로운 정책 추가
create policy "Can only delete completed todos" on todos for
    delete using (
        auth.uid() = user_id and
        is_complete = true
    );
