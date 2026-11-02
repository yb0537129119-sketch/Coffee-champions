export async function onRequestGet({ env }) {
  try {
    const [reports, targetsRows, coffeeRows] = await Promise.all([
      env.COFFEE_DB.prepare('SELECT id, branch, employee, subscriptions, created_at FROM reports ORDER BY created_at DESC').all(),
      env.COFFEE_DB.prepare('SELECT branch, target FROM targets').all(),
      env.COFFEE_DB.prepare('SELECT branch,general_progress,vietnam_progress,updated_at FROM coffee_sales').all()
    ]);
    const targets = Object.fromEntries((targetsRows.results || []).map(r => [r.branch, r.target]));
    const coffee = Object.fromEntries((coffeeRows.results || []).map(r => [r.branch, r]));
    return Response.json({ reports: reports.results || [], targets, coffee });
  } catch { return Response.json({ error: 'מסד הנתונים לא הוגדר. יש להפעיל את הוראות ההתקנה.' }, { status: 500 }); }
}
