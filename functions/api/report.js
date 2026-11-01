const BRANCHES = ['תל אביב','צפת','אשדוד אזור ג','אשדוד אזור ז','רחובות','מודיעין','קריית ספר','בית שמש נעימי','בית שמש רמה א','בית שמש רמה ד','ירושלים גאולה','ירושלים בית וגן','פתח תקווה','ביתר עילית A'];
export async function onRequestPost({ request, env }) {
  try {
    const body = await request.json();
    const branch = String(body.branch || '').trim(), employee = String(body.employee || '').trim();
    const subscriptions = Number(body.subscriptions);
    if (!BRANCHES.includes(branch) || !employee || employee.length > 100 || !Number.isInteger(subscriptions) || subscriptions < 1 || subscriptions > 10000)
      return Response.json({ error: 'פרטי הדיווח אינם תקינים.' }, { status: 400 });
    await env.COFFEE_DB.prepare('INSERT INTO reports (branch, employee, subscriptions) VALUES (?, ?, ?)').bind(branch, employee, subscriptions).run();
    return Response.json({ ok: true });
  } catch { return Response.json({ error: 'לא ניתן לשמור דיווח. בדוק את הגדרת הענן.' }, { status: 500 }); }
}