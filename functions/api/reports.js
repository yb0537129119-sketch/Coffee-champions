import {json,requireAuth,canAccessBranch} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B","בית שמש רמה א","בית שמש רמה ד","בית שמש נעימי","צפת","תל אביב","קריית ספר","מודיעין","אשדוד ג","אשדוד ז","בני ברק","פתח תקווה","רחובות"];
export async function onRequestGet({request,env}){
 try{
  
  const user=await requireAuth(request,env);if(!user)return json({error:"נדרשת התחברות."},401);
  const requested=new URL(request.url).searchParams.get("branch");
  const branch=user.role==="admin"?requested:user.branch;
  if(!BRANCHES.includes(branch)||!canAccessBranch(user,branch))return json({error:"אין הרשאה לצפות בנתוני הסניף הזה."},403);
  const result=await env.COFFEE_DB.prepare("SELECT e.employee,s.subscriptions,s.receipt_data IS NOT NULL AS has_receipt,s.updated_at FROM branch_employees e LEFT JOIN employee_subscriptions s ON s.branch=e.branch AND s.employee=e.employee WHERE e.branch=? ORDER BY e.employee COLLATE NOCASE").bind(branch).all();
  return json({branch,employees:(result.results||[]).map(row=>({employee:row.employee,subscriptions:Number(row.subscriptions||0),has_receipt:!!row.has_receipt,updated_at:row.updated_at||null}))});
 }catch{return json({error:"לא ניתן לטעון נתוני מנויים."},500)}
}