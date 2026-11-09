-- Branch-owned employee roster. Existing Beitar employees and historical data are preserved.
CREATE TABLE IF NOT EXISTS branch_employees (
 branch TEXT NOT NULL CHECK (branch IN ('ביתר עילית A','ביתר עילית B','בית שמש רמה א','בית שמש רמה ד','בית שמש נעימי','צפת','תל אביב','קריית ספר','מודיעין','אשדוד ג','אשדוד ז','בני ברק','פתח תקווה','רחובות')),
 employee TEXT NOT NULL CHECK (length(trim(employee)) BETWEEN 2 AND 80),
 created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
 PRIMARY KEY (branch, employee)
);
INSERT OR IGNORE INTO branch_employees (branch,employee)
SELECT DISTINCT branch,employee FROM employee_subscriptions;
INSERT OR IGNORE INTO branch_employees (branch,employee)
SELECT DISTINCT branch,employee FROM subscription_receipts;
INSERT OR IGNORE INTO branch_employees (branch,employee)
SELECT branch,employee FROM (
 SELECT 'ביתר עילית A' AS branch, employee FROM (
  SELECT 'יהודה בן גיגי','נהוראי מלכה','אוריאל דוד פנחסי','דביר כהן','שמואל שמואלי','יצחק סודרי' AS employee
 )
 UNION ALL
 SELECT 'ביתר עילית B' AS branch, employee FROM (
  SELECT 'יהודה בן גיגי','נהוראי מלכה','אוריאל דוד פנחסי','דביר כהן','שמואל שמואלי','יצחק סודרי' AS employee
 )
);
