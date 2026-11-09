import {json,requireAuth,canAccessBranch,sameOrigin} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B","בית שמש רמה א","בית שמש רמה ד","בית שמש נעימי","צפת","תל אביב","קריית ספר","מודיעין","אשדוד ג","אשדוד ז","בני ברק","פתח תקווה","רחובות"];
export async function onRequestGet({request,env}){
 try{
  const user=await requireAuth(request,env);if(!user)return json({error:"נדרשת התחברות."},401);
  const requested=new URL(request.url).searchParams.get("branch");
  const branch=user.role==="admin"?requested:user.branch;
  if(!BRANCHES.includes(branch)||!canAccessBranch(user,branch))return json({error:"אין הרשאה לצפות ברשימת העובדים הזו."},403);
  const result=await env.COFFEE_DB.prepare("SELECT employee,created_at FROM branch_employees WHERE branch=? ORDER BY employee COLLATE NOCASE").bind(branch).all();
  return json({branch,employees:result.results||[]});
 }catch{return json({error:"לא ניתן לטעון את רשימת העובדים."},500)}
}
export async function onRequestPost({request,env}){
 try{
  if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
  const user=await requireAuth(request,env);if(!user)return json({error:"נדרשת התחברות."},401);
  const body=await request.json(),requested=String(body.branch||""),branch=user.role==="admin"?requested:user.branch;
  const employee=String(body.employee||"").trim().replace(/\s+/g," ");
  if(!BRANCHES.includes(branch)||!canAccessBranch(user,branch)||(user.role==="branch"&&requested&&requested!==user.branch))return json({error:"אין הרשאה להוסיף עובד לסניף הזה."},403);
  if(employee.length<2||employee.length>80||/[<>\u0000-\u001f]/.test(employee))return json({error:"יש להזין שם עובד תקין (2 עד 80 תווים)."},400);
  const existing=await env.COFFEE_DB.prepare("SELECT 1 AS ok FROM branch_employees WHERE branch=? AND employee=?").bind(branch,employee).first();
  if(existing)return json({error:"העובד כבר קיים ברשימת הסניף."},409);
  await env.COFFEE_DB.prepare("INSERT INTO branch_employees(branch,employee) VALUES(?,?)").bind(branch,employee).run();
  return json({ok:true,branch,employee});
 }catch{return json({error:"לא ניתן להוסיף את העובד. ודאו שהרצתם את עדכון 0011."},500)}
}

export async function onRequestDelete({request,env}){
 try{
  if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
  const admin=await requireAuth(request,env,"admin");if(!admin)return json({error:"רק מנהל אזור יכול למחוק עובדים."},403);
  const body=await request.json(),branch=String(body.branch||""),employee=String(body.employee||"");
  if(!BRANCHES.includes(branch)||!employee)return json({error:"יש לבחור סניף ועובד תקינים."},400);
  const exists=await env.COFFEE_DB.prepare("SELECT 1 AS ok FROM branch_employees WHERE branch=? AND employee=?").bind(branch,employee).first();
  if(!exists)return json({error:"העובד לא נמצא ברשימת הסניף."},404);
  await env.COFFEE_DB.prepare("DELETE FROM branch_employees WHERE branch=? AND employee=?").bind(branch,employee).run();
  return json({ok:true,branch,employee,historyPreserved:true});
 }catch{return json({error:"לא ניתן למחוק את העובד."},500)}
}
