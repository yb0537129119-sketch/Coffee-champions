import {json,requireAuth,sameOrigin} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B","כללי"];
const clean=v=>String(v||"").trim();
const validStatus=s=>["open","done"].includes(s);
export async function onRequestGet({request,env}){
 try{
  const user=await requireAuth(request,env);if(!user)return json({error:"יש להתחבר כמנהל כדי לצפות במשימות."},401);
  const rows=await env.COFFEE_DB.prepare("SELECT id,title,details,branch,assignee,priority,due_date,status,created_by,created_at,updated_at FROM tasks WHERE (?='admin' OR branch=? OR branch='כללי') ORDER BY CASE status WHEN 'open' THEN 0 ELSE 1 END, CASE priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END, CASE WHEN due_date IS NULL THEN 1 ELSE 0 END,due_date,id DESC").bind(user.role,user.branch||"").all();
  return json({tasks:rows.results||[],user:{role:user.role,branch:user.branch}});
 }catch{return json({error:"לא ניתן לטעון את המשימות."},500)}
}
export async function onRequestPost({request,env}){
 try{
  if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
  const user=await requireAuth(request,env);if(!user)return json({error:"יש להתחבר כדי להוסיף משימה."},401);
  const b=await request.json(),title=clean(b.title),details=clean(b.details),assignee=clean(b.assignee),priority=clean(b.priority||"normal"),due=clean(b.due_date),branch=user.role==="admin"?clean(b.branch||"כללי"):user.branch;
  if(title.length<2||title.length>120)return json({error:"כותרת המשימה חייבת להכיל 2 עד 120 תווים."},400);
  if(details.length>1500||assignee.length>80)return json({error:"תיאור או שם אחראי ארוכים מדי."},400);
  if(!BRANCHES.includes(branch)||!["low","normal","high"].includes(priority))return json({error:"בחירת סניף או עדיפות אינה תקינה."},400);
  if(due&&!/^20\d{2}-\d{2}-\d{2}$/.test(due))return json({error:"תאריך יעד לא תקין."},400);
  const r=await env.COFFEE_DB.prepare("INSERT INTO tasks(title,details,branch,assignee,priority,due_date,status,created_by) VALUES(?,?,?,?,?,?,'open',?)").bind(title,details,branch,assignee,priority,due||null,user.username).run();
  return json({ok:true,id:r.meta?.last_row_id});
 }catch{return json({error:"לא ניתן לשמור את המשימה. בדקו שהרצתם את עדכון מסד הנתונים."},500)}
}
export async function onRequestPatch({request,env}){
 try{
  if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
  const user=await requireAuth(request,env);if(!user)return json({error:"יש להתחבר כדי לעדכן משימה."},401);
  const b=await request.json(),id=Number(b.id),status=clean(b.status);
  if(!Number.isInteger(id)||id<1||!validStatus(status))return json({error:"עדכון המשימה אינו תקין."},400);
  const task=await env.COFFEE_DB.prepare("SELECT branch,created_by FROM tasks WHERE id=?").bind(id).first();
  if(!task)return json({error:"המשימה לא נמצאה."},404);
  if(user.role!=="admin"&&task.branch!=="כללי"&&task.branch!==user.branch)return json({error:"אין הרשאה למשימה הזו."},403);
  await env.COFFEE_DB.prepare("UPDATE tasks SET status=?,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now'),completed_at=CASE WHEN ?='done' THEN strftime('%Y-%m-%dT%H:%M:%fZ','now') ELSE NULL END WHERE id=?").bind(status,status,id).run();
  return json({ok:true});
 }catch{return json({error:"לא ניתן לעדכן את המשימה."},500)}
}
export async function onRequestDelete({request,env}){
 try{
  if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
  const user=await requireAuth(request,env);if(!user)return json({error:"יש להתחבר כדי למחוק משימה."},401);
  const b=await request.json(),id=Number(b.id);
  if(!Number.isInteger(id)||id<1)return json({error:"משימה לא תקינה."},400);
  const task=await env.COFFEE_DB.prepare("SELECT branch,created_by FROM tasks WHERE id=?").bind(id).first();
  if(!task)return json({error:"המשימה לא נמצאה."},404);
  if(user.role!=="admin"&&task.branch!==user.branch&&task.created_by!==user.username)return json({error:"אין הרשאה למחוק את המשימה."},403);
  await env.COFFEE_DB.prepare("DELETE FROM tasks WHERE id=?").bind(id).run();
  return json({ok:true});
 }catch{return json({error:"לא ניתן למחוק את המשימה."},500)}
}
