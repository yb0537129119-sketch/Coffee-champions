import {json} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B"];
const EMPLOYEES=["יהודה בן גיגי","נהוראי מלכה","אוריאל דוד פנחסי","ישי אלמקייס"];
export async function onRequestGet({request,env}){
 try{
  const branch=new URL(request.url).searchParams.get("branch");
  if(!BRANCHES.includes(branch))return json({error:"יש לבחור סניף תקין."},400);
  const result=await env.COFFEE_DB.prepare("SELECT employee,subscriptions,receipt_data IS NOT NULL AS has_receipt,updated_at FROM employee_subscriptions WHERE branch=?").bind(branch).all();
  const saved=new Map((result.results||[]).map(row=>[row.employee,row]));
  return json({branch,employees:EMPLOYEES.map(employee=>{const row=saved.get(employee);return {employee,subscriptions:row?Number(row.subscriptions):0,has_receipt:!!row?.has_receipt,updated_at:row?.updated_at||null}})});
 }catch{return json({error:"לא ניתן לטעון נתוני מנויים."},500)}
}
