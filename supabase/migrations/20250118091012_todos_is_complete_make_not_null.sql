-- make todos.is_complete not null
ALTER TABLE todos
  ALTER COLUMN is_complete SET NOT NULL;
