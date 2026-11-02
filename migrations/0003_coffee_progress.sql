ALTER TABLE coffee_sales ADD COLUMN general_progress REAL NOT NULL DEFAULT 0 CHECK(general_progress >= 0);
ALTER TABLE coffee_sales ADD COLUMN vietnam_progress REAL NOT NULL DEFAULT 0 CHECK(vietnam_progress >= 0);
