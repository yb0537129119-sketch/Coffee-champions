CREATE TABLE IF NOT EXISTS coffee_sales (
  branch TEXT PRIMARY KEY,
  last_year INTEGER NOT NULL DEFAULT 0 CHECK(last_year >= 0),
  current_year INTEGER NOT NULL DEFAULT 0 CHECK(current_year >= 0),
  target INTEGER NOT NULL DEFAULT 1 CHECK(target > 0),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'))
);
