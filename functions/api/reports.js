import {json,requireAuth,canAccessBranch} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B","בית שמש רמה א","בית שמש רמה ד","בית שמש נעימי","צפת","תל אביב","קריית ספר","מודיעין","אשדוד ג","אשדוד ז","בני ברק","פתח תקווה","רחובות"];
const EMPLOYEES=["יהודה בן גיגי","נהוראי מלכה","אוריאל דוד פנחסי","דביר כהן","שמואל שמואלי","יצחק סודרי"];
export async function onRequestGet({request,env}){
 try{
  
  const user=await requireAuth(request,env);if(!user)return json({error:"נדרשת התחברות."},401);
  const requested=new URL(request.url).searchParams.get("branch");
  const branch=user.role==="admin"?requested:user.branch;
  if(!BRANCHES.includes(branch)||!canAccessBranch(user,branch))return json({error:"אין הרשאה לצפות בנתוני הסניף הזה."},403);
  const result=await env.COFFEE_DB.prepare("SELECT employee,subscriptions,receipt_data IS NOT NULL AS has_receipt,updated_at FROM employee_subscriptions WHERE branch=?").bind(branch).all();
  const saved=new Map((result.results||[]).map(row=>[row.employee,row]));
  return json({branch,employees:EMPLOYEES.map(employee=>{const row=saved.get(employee);return {employee,subscriptions:row?Number(row.subscriptions):0,has_receipt:!!row?.has_receipt,updated_at:row?.updated_at||null}})});
 }catch{return json({error:"לא ניתן לטעון נתוני מנויים."},500)}
}