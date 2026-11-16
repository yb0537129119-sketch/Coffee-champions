import {json} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B"];
export async function onRequestGet({request,env}){
 try{
  const url=new URL(request.url),origin=request.headers.get("Origin");
  if(origin && origin!==url.origin)return json({error:"הבקשה נדחתה."},403);
  const branch=url.searchParams.get("branch");
  if(!BRANCHES.includes(branch))return json({error:"יש לבחור סניף תקין."},400);
  const result=await env.COFFEE_DB.prepare("SELECT employee FROM branch_employees WHERE branch=? UNION SELECT employee FROM employee_subscriptions WHERE branch=? ORDER BY employee COLLATE NOCASE").bind(branch,branch).all();
  return json({branch,employees:result.results||[]},200,{"Cache-Control":"no-store"});
 }catch{return json({error:"לא ניתן לטעון את רשימת העובדים."},500)}
}