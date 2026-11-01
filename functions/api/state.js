export async function onRequestGet({ env }) {
  try {
    const [reports, targetsRows] = await Promise.all([
      env.COFFEE_DB.prepare('SELECT id, branch, employee, subscriptions, created_at FROM reports ORDER BY created_at DESC').all(),
      env.COFFEE_DB.prepare('SELECT branch, target FROM targets').all()
    ]);
    const targets = Object.fromEntries((targetsRows.results || []).map(r => [r.branch, r.target]));
    return Response.json({ reports: reports.results || [], targets });
  } catch (e) { return Response.json({ error: 'מסד הנתונים לא הוגדר. יש להפעיל את הוראות ההתקנה.' }, { status: 500 }); }
}