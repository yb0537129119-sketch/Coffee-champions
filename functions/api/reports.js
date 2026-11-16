import {json,requireAuth} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B"];
export async function onRequestGet({request,env}){
 try{
  const user=await requireAuth(request,env);
  const requested=new URL(request.url).searchParams.get("branch");
  if(user && user.role==="branch" && requested && requested!==user.branch)return json({error:"אין הרשאה לצפות בסניף הזה."},403);
  const selected=user?.role==="branch"?user.branch:(BRANCHES.includes(requested)?requested:null);
  const result=await env.COFFEE_DB.prepare("SELECT e.branch,e.employee,COALESCE(s.subscriptions,0) AS subscriptions,CASE WHEN s.receipt_data IS NOT NULL THEN 1 ELSE 0 END AS has_receipt,s.updated_at FROM branch_employees e LEFT JOIN employee_subscriptions s ON s.branch=e.branch AND s.employee=e.employee ORDER BY e.branch,e.employee COLLATE NOCASE").all();
  const grouped=BRANCHES.map(branch=>{const employees=(result.results||[]).filter(row=>row.branch===branch).map(row=>({employee:row.employee,subscriptions:Number(row.subscriptions||0),has_receipt:!!row.has_receipt,updated_at:row.updated_at||null}));return {branch,subscriptions:employees.reduce((n,e)=>n+e.subscriptions,0),employees}});
  const visible=selected?grouped.filter(x=>x.branch===selected):grouped;
  const safeVisible=user?visible:visible.map(x=>({branch:x.branch,subscriptions:x.subscriptions,employees:[]}));
  return json({branch:selected,employees:user?(safeVisible[0]?.employees||[]):[],branches:user?.role==="branch"?safeVisible:safeVisible});
 }catch{return json({error:"לא ניתן לטעון נתוני מנויים."},500)}
}