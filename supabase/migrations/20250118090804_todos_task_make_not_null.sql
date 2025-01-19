
-- make todos.task not null
ALTER TABLE todos
  ALTER COLUMN task SET NOT NULL;