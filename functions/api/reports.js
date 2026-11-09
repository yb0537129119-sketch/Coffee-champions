import {json,requireAuth} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B","בית שמש רמה א","בית שמש רמה ד","בית שמש נעימי","צפת","תל אביב","קריית ספר","מודיעין","אשדוד ג","אשדוד ז","בני ברק","פתח תקווה","רחובות"];
export async function onRequestGet({request,env}){
 try{
  const user=await requireAuth(request,env);if(!user)return json({error:"נדרשת התחברות."},401);
  const requested=new URL(request.url).searchParams.get("branch");
  const branch=user.role==="admin"?(BRANCHES.includes(requested)?requested:BRANCHES[0]):user.branch;
  const result=await env.COFFEE_DB.prepare("SELECT e.employee,s.subscriptions,s.receipt_data IS NOT NULL AS has_receipt,s.updated_at FROM branch_employees e LEFT JOIN employee_subscriptions s ON s.branch=e.branch AND s.employee=e.employee WHERE e.branch=? ORDER BY e.employee COLLATE NOCASE").bind(branch).all();
  const totals=await env.COFFEE_DB.prepare("SELECT b.branch,COALESCE(SUM(s.subscriptions),0) AS subscriptions FROM (SELECT ? AS branch UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ? UNION ALL SELECT ?) b LEFT JOIN employee_subscriptions s ON s.branch=b.branch GROUP BY b.branch").bind(...BRANCHES).all();
  return json({branch,employees:(result.results||[]).map(row=>({employee:row.employee,subscriptions:Number(row.subscriptions||0),has_receipt:!!row.has_receipt,updated_at:row.updated_at||null})),branches:(totals.results||[]).map(row=>({branch:row.branch,subscriptions:Number(row.subscriptions||0)}))});
 }catch{return json({error:"לא ניתן לטעון נתוני מנויים."},500)}
}