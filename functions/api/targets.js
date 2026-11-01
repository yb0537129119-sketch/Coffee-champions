const BRANCHES = ['תל אביב','צפת','אשדוד אזור ג','אשדוד אזור ז','רחובות','מודיעין','קריית ספר','בית שמש נעימי','בית שמש רמה א','בית שמש רמה ד','ירושלים גאולה','ירושלים בית וגן','פתח תקווה','ביתר עילית A'];
export async function onRequestPut({ request, env }) {
  try {
    const { targets } = await request.json();
    if (!targets || BRANCHES.some(b => !Number.isInteger(Number(targets[b])) || Number(targets[b]) < 1 || Number(targets[b]) > 1000000))
      return Response.json({ error: 'יש להגדיר יעד חיובי לכל 14 הסניפים.' }, { status: 400 });
    const stmts = BRANCHES.map(branch => env.COFFEE_DB.prepare('INSERT INTO targets (branch, target) VALUES (?, ?) ON CONFLICT(branch) DO UPDATE SET target=excluded.target').bind(branch, Number(targets[branch])));
    await env.COFFEE_DB.batch(stmts);
    return Response.json({ ok: true });
  } catch { return Response.json({ error: 'לא ניתן לשמור יעדים. בדוק את הגדרת הענן.' }, { status: 500 }); }
}