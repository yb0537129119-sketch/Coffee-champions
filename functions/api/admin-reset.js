import {json,sameOrigin,requireAuth} from "./_auth.js";
const BRANCHES=["ביתר עילית A","ביתר עילית B"];
export async function onRequestPost({request,env}){try{
 if(!sameOrigin(request))return json({error:"הבקשה נדחתה."},403);
 const admin=await requireAuth(request,env,"admin");if(!admin)return json({error:"נדרשת הרשאת מנהל אזור."},403);
 const body=await request.json(),branch=String(body.branch||"");
 if(!BRANCHES.includes(branch))return json({error:"יש לבחור סניף תקין."},400);
 await env.COFFEE_DB.prepare("UPDATE employee_subscriptions SET subscriptions=0,receipt_data=NULL,receipt_type=NULL,updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now') WHERE branch=?").bind(branch).run();
 return json({ok:true,branch});
 }catch{return json({error:"לא ניתן לאפס. ודא שמסד הנתונים מעודכן."},500)}}