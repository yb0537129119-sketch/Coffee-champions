const BRANCHES = ['תל אביב','צפת','אשדוד אזור ג','אשדוד אזור ז','רחובות','מודיעין','קריית ספר','בית שמש נעימי','בית שמש רמה א','בית שמש רמה ד','ירושלים גאולה','ירושלים בית וגן','פתח תקווה','ביתר עילית A'];
export async function onRequestPut({ request, env }) {
  try {
    const { entries } = await request.json();
    if (!entries || BRANCHES.some(b => {
      const x = entries[b] || {};
      return !Number.isInteger(Number(x.last_year)) || Number(x.last_year) < 0 ||
        !Number.isInteger(Number(x.current_year)) || Number(x.current_year) < 0 ||
        !Number.isInteger(Number(x.target)) || Number(x.target) < 1;
    })) return Response.json({ error: 'יש להזין מכירות תקינות ויעד חיובי לכל סניף.' }, { status: 400 });
    const stmts = BRANCHES.map(branch => {
      const x = entries[branch];
      return env.COFFEE_DB.prepare('INSERT INTO coffee_sales (branch,last_year,current_year,target) VALUES (?,?,?,?) ON CONFLICT(branch) DO UPDATE SET last_year=excluded.last_year,current_year=excluded.current_year,target=excluded.target,updated_at=strftime(\'%Y-%m-%dT%H:%M:%fZ\',\'now\')')
        .bind(branch, Number(x.last_year), Number(x.current_year), Number(x.target));
    });
    await env.COFFEE_DB.batch(stmts);
    return Response.json({ ok: true });
  } catch { return Response.json({ error: 'לא ניתן לשמור נתוני תחרות קפה.' }, { status: 500 }); }
}
