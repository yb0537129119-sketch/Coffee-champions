ALTER TABLE tasks ADD COLUMN task_day TEXT;
UPDATE tasks SET task_day=substr(created_at,1,10) WHERE task_day IS NULL;
CREATE INDEX IF NOT EXISTS idx_tasks_task_day_branch ON tasks(task_day, branch, status);
