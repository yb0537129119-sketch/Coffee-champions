-- COFFEE CHAMPIONS: מסך מנויים מצומצם לשני סניפי ביתר עילית
-- הפעולה מנקה דיווחי מנויים ישנים בלבד. משתמשים, סיסמאות והתחברויות נשמרים.
CREATE TABLE IF NOT EXISTS employee_subscriptions (
  branch TEXT NOT NULL CHECK (branch IN ('ביתר עילית A','ביתר עילית B')),
  employee TEXT NOT NULL CHECK (employee IN ('יהודה בן גיגי','נהוראי מלכה','אוריאל דוד פנחסי','ישי אלמקייס')),
  subscriptions INTEGER NOT NULL DEFAULT 0 CHECK (subscriptions >= 0 AND subscriptions <= 100000),
  receipt_data TEXT,
  receipt_type TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  PRIMARY KEY (branch, employee)
);

DELETE FROM reports;
